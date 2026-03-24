"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import type { WorkerRequest, WorkerResponse } from "@/lib/compression/worker-types";

const MAX_CONCURRENT = 2;

/**
 * Watches the file queue and runs image compression via a Web Worker.
 * Falls back to main-thread Canvas if OffscreenCanvas isn't available (older Safari).
 */
export function useCompression() {
  const files = useAppStore((s) => s.files);
  const updateFile = useAppStore((s) => s.updateFile);
  const settings = useAppStore((s) => s.settings);

  // Active IDs being compressed right now
  const activeIds = useRef<Set<string>>(new Set());

  // Lazily created worker — reused across compressions
  const workerRef = useRef<Worker | null>(null);

  // Whether OffscreenCanvas is available
  const hasOffscreenCanvas = useRef<boolean | null>(null);

  // Stable reference to updateFile so the effect doesn't re-subscribe needlessly
  const updateFileRef = useRef(updateFile);
  updateFileRef.current = updateFile;

  // ── Worker initialization ──────────────────────────────────────────────────

  const getWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;

    // Check once
    if (hasOffscreenCanvas.current === null) {
      hasOffscreenCanvas.current = typeof OffscreenCanvas !== "undefined";
    }
    if (!hasOffscreenCanvas.current) return null;

    try {
      const worker = new Worker(
        new URL("../../workers/image.worker.ts", import.meta.url),
        { type: "module" }
      );

      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;
        const { id } = msg;

        if (msg.type === "progress") {
          updateFileRef.current(id, { progress: msg.progress });
          return;
        }

        activeIds.current.delete(id);

        if (msg.type === "done") {
          const { blob, size, outputFormat, duration } = msg;
          const originalSize = useAppStore.getState().files.find((f) => f.id === id)?.size ?? size;
          const savings = Math.max(0, ((originalSize - size) / originalSize) * 100);

          updateFileRef.current(id, {
            status: "completed",
            progress: 100,
            result: {
              blob,
              size,
              savings,
              outputFormat,
              duration,
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

      worker.onerror = (err) => {
        console.error("[image.worker] error:", err.message);
        // Mark all active items as errored
        for (const id of activeIds.current) {
          updateFileRef.current(id, {
            status: "error",
            error: "Worker crashed — please try again",
          });
        }
        activeIds.current.clear();
        workerRef.current = null; // allow re-creation on next attempt
      };

      workerRef.current = worker;
      return worker;
    } catch {
      return null;
    }
  }, []);

  // ── Main-thread fallback (no OffscreenCanvas) ──────────────────────────────

  const compressOnMainThread = useCallback(
    async (id: string, file: File) => {
      const currentSettings = useAppStore.getState().settings;
      updateFileRef.current(id, { status: "processing", progress: 10 });

      try {
        const bitmap = await createImageBitmap(file);
        updateFileRef.current(id, { progress: 40 });

        // Determine output MIME based on settings
        const fmt = currentSettings.outputFormat;
        let mime = "image/webp"; // safe default
        let ext = "webp";
        if (fmt !== "same") {
          mime = fmt === "jpeg" ? "image/jpeg" : `image/${fmt}`;
          ext = fmt;
        } else {
          const m: Record<string, { mime: string; ext: string }> = {
            "image/jpeg": { mime: "image/jpeg", ext: "jpeg" },
            "image/png": { mime: "image/png", ext: "png" },
            "image/webp": { mime: "image/webp", ext: "webp" },
            "image/avif": { mime: "image/avif", ext: "avif" },
          };
          const r = m[file.type];
          if (r) { mime = r.mime; ext = r.ext; }
        }

        const quality =
          currentSettings.mode === "custom"
            ? currentSettings.quality / 100
            : mime.includes("webp") ? 0.8 : 0.82;

        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
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

        const finalBlob = blob.size < file.size ? blob : file;
        const finalExt = blob.size < file.size ? ext : (file.name.split(".").pop() ?? ext);
        const savings = Math.max(0, ((file.size - finalBlob.size) / file.size) * 100);

        updateFileRef.current(id, {
          status: "completed",
          progress: 100,
          result: {
            blob: finalBlob,
            size: finalBlob.size,
            savings,
            outputFormat: finalExt,
            duration: 0,
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
    },
    []
  );

  // ── Queue processor ────────────────────────────────────────────────────────

  useEffect(() => {
    const queued = files.filter(
      (f) => f.status === "queued" && f.type === "image" && !activeIds.current.has(f.id)
    );

    if (queued.length === 0) return;
    const slots = MAX_CONCURRENT - activeIds.current.size;
    if (slots <= 0) return;

    const toProcess = queued.slice(0, slots);
    const worker = getWorker();

    for (const fileItem of toProcess) {
      activeIds.current.add(fileItem.id);
      updateFile(fileItem.id, { status: "processing", progress: 5 });

      if (worker) {
        // Off-main-thread via OffscreenCanvas worker
        const req: WorkerRequest = {
          id: fileItem.id,
          file: fileItem.file,
          settings,
        };
        worker.postMessage(req);
      } else {
        // Main-thread fallback
        compressOnMainThread(fileItem.id, fileItem.file);
      }
    }
  }, [files, settings, updateFile, getWorker, compressOnMainThread]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);
}
