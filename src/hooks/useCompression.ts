"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import type { WorkerRequest, WorkerResponse } from "@/lib/compression/worker-types";
import { resolveOutputMime, resolveQuality, calcSavings } from "@/lib/compression/engine";

const MAX_CONCURRENT = 2;

/**
 * Manages image compression.
 *
 * Compression ONLY starts when the user explicitly triggers it via
 * triggerCompression() in the store. Files added before or after that click
 * stay in "queued" state until the next trigger.
 *
 * Once a session starts it drains the queue automatically (up to MAX_CONCURRENT
 * at a time) until every queued file is processed. New files added mid-session
 * join the active session. New files added AFTER the session ends wait for the
 * next explicit trigger.
 */
export function useCompression() {
  const files              = useAppStore((s) => s.files);
  const updateFile         = useAppStore((s) => s.updateFile);
  const settings           = useAppStore((s) => s.settings);
  const compressionTrigger = useAppStore((s) => s.compressionTrigger);

  const activeIds          = useRef<Set<string>>(new Set());
  const workerRef          = useRef<Worker | null>(null);
  const hasOffscreen       = useRef<boolean | null>(null);

  // Session tracking — avoids re-using an old trigger value for new files
  const isSessionActive       = useRef(false);
  const lastProcessedTrigger  = useRef(0);

  // Stable ref so worker callbacks never capture a stale updateFile
  const updateFileRef = useRef(updateFile);
  updateFileRef.current = updateFile;

  // ── Worker ────────────────────────────────────────────────────────────────

  function getWorker(): Worker | null {
    if (workerRef.current) return workerRef.current;

    if (hasOffscreen.current === null) {
      hasOffscreen.current = typeof OffscreenCanvas !== "undefined";
    }
    if (!hasOffscreen.current) return null;

    try {
      const w = new Worker(
        new URL("../../workers/image.worker.ts", import.meta.url),
        { type: "module" }
      );

      w.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        const { id } = msg;

        if (msg.type === "progress") {
          updateFileRef.current(id, { progress: msg.progress });
          return;
        }

        activeIds.current.delete(id);

        if (msg.type === "done") {
          updateFileRef.current(id, {
            status: "completed",
            progress: 100,
            result: {
              blob:         msg.blob,
              size:         msg.size,
              savings:      msg.savings,
              outputFormat: msg.outputFormat,
              duration:     msg.duration,
            },
          });
        } else if (msg.type === "error") {
          updateFileRef.current(id, {
            status: "error",
            progress: 0,
            error: msg.message,
          });
        }
      };

      w.onerror = (err) => {
        console.error("[image.worker] crash:", err.message);
        for (const id of activeIds.current) {
          updateFileRef.current(id, {
            status: "error",
            error: "Worker crashed — please try again",
          });
        }
        activeIds.current.clear();
        workerRef.current = null;
      };

      workerRef.current = w;
      return w;
    } catch {
      return null;
    }
  }

  // ── Main-thread fallback ──────────────────────────────────────────────────

  async function compressOnMainThread(id: string, file: File) {
    const s = useAppStore.getState().settings;
    updateFileRef.current(id, { status: "processing", progress: 10 });

    try {
      const bitmap = await createImageBitmap(file);
      updateFileRef.current(id, { progress: 40 });

      const { mime, ext } = resolveOutputMime(s, file.type);
      const quality       = resolveQuality(s, mime);

      const canvas = document.createElement("canvas");
      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      updateFileRef.current(id, { progress: 70 });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
          mime,
          quality
        );
      });

      updateFileRef.current(id, { progress: 95 });

      const useOriginal = blob.size >= file.size;
      const finalBlob   = useOriginal ? file : blob;
      const finalExt    = useOriginal ? (file.name.split(".").pop() ?? ext) : ext;

      updateFileRef.current(id, {
        status: "completed",
        progress: 100,
        result: {
          blob:         finalBlob,
          size:         finalBlob.size,
          savings:      calcSavings(file.size, finalBlob.size),
          outputFormat: finalExt,
          duration:     0,
        },
      });
    } catch (err) {
      updateFileRef.current(id, {
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Compression failed",
      });
    } finally {
      activeIds.current.delete(id);
    }
  }

  // ── Queue processor ────────────────────────────────────────────────────────
  //
  // Runs whenever files or compressionTrigger changes.
  //
  // Session lifecycle:
  //   trigger counter increments → start session
  //   no more queued/active files → end session
  //   new files added after session ends → stay queued until next trigger
  //
  useEffect(() => {
    // ── Start a new session when the trigger counter increments ──
    if (compressionTrigger > lastProcessedTrigger.current) {
      lastProcessedTrigger.current = compressionTrigger;
      isSessionActive.current = true;
    }

    // Nothing to do if no active session
    if (!isSessionActive.current) return;

    const queued = files.filter(
      (f) =>
        f.status === "queued" &&
        f.type === "image" &&
        !activeIds.current.has(f.id)
    );

    // End session when everything is done
    if (queued.length === 0 && activeIds.current.size === 0) {
      isSessionActive.current = false;
      return;
    }

    const slots = MAX_CONCURRENT - activeIds.current.size;
    if (slots <= 0 || queued.length === 0) return;

    const toProcess = queued.slice(0, slots);
    const worker    = getWorker();

    for (const item of toProcess) {
      activeIds.current.add(item.id);
      updateFile(item.id, { status: "processing", progress: 5 });

      if (worker) {
        const req: WorkerRequest = { id: item.id, file: item.file, settings };
        worker.postMessage(req);
      } else {
        compressOnMainThread(item.id, item.file);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, compressionTrigger]);
  // Note: settings, updateFile, getWorker are intentionally excluded — they are
  // either stable references or accessed via refs/getState() to avoid re-firing
  // the effect when only settings change (that would auto-restart compression).

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);
}
