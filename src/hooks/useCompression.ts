"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import type { WorkerRequest, WorkerResponse } from "@/lib/compression/worker-types";
import { resolveOutputMime, resolveQuality, calcSavings } from "@/lib/compression/engine";

const MAX_IMG_CONCURRENT = 2; // images are fast — 2 at a time
const MAX_VID_CONCURRENT = 1; // video is CPU/memory heavy — 1 at a time

/**
 * Orchestrates image and video compression.
 *
 * Compression ONLY starts when the user explicitly triggers it via
 * triggerCompression() in the store. Files added before or after that click
 * stay in "queued" state until the next explicit trigger.
 *
 * Images   → image.worker.ts  (OffscreenCanvas / oxipng for PNG)
 * Videos   → video.worker.ts  (mediabunny + WebCodecs)
 */
export function useCompression() {
  const files              = useAppStore((s) => s.files);
  const updateFile         = useAppStore((s) => s.updateFile);
  const settings           = useAppStore((s) => s.settings);
  const compressionTrigger = useAppStore((s) => s.compressionTrigger);

  // ── Image worker ─────────────────────────────────────────────────────────
  const imageActiveIds = useRef<Set<string>>(new Set());
  const imageWorkerRef = useRef<Worker | null>(null);
  const hasOffscreen   = useRef<boolean | null>(null);

  // ── Video worker ──────────────────────────────────────────────────────────
  const videoActiveIds = useRef<Set<string>>(new Set());
  const videoWorkerRef = useRef<Worker | null>(null);

  // ── Session tracking ──────────────────────────────────────────────────────
  const isSessionActive      = useRef(false);
  const lastProcessedTrigger = useRef(0);

  // Stable ref so worker callbacks never capture a stale updateFile
  const updateFileRef = useRef(updateFile);
  updateFileRef.current = updateFile;

  // ── Worker factory helpers ────────────────────────────────────────────────

  function makeWorkerHandler(activeIds: React.MutableRefObject<Set<string>>) {
    return (e: MessageEvent<WorkerResponse>) => {
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
  }

  function makeWorkerErrorHandler(activeIds: React.MutableRefObject<Set<string>>, ref: React.MutableRefObject<Worker | null>) {
    return (err: ErrorEvent) => {
      console.error("[worker] crash:", err.message);
      for (const id of activeIds.current) {
        updateFileRef.current(id, {
          status: "error",
          error: "Worker crashed — please try again",
        });
      }
      activeIds.current.clear();
      ref.current = null;
    };
  }

  function getImageWorker(): Worker | null {
    if (imageWorkerRef.current) return imageWorkerRef.current;

    if (hasOffscreen.current === null) {
      hasOffscreen.current = typeof OffscreenCanvas !== "undefined";
    }
    if (!hasOffscreen.current) return null;

    try {
      const w = new Worker(
        new URL("../../workers/image.worker.ts", import.meta.url),
        { type: "module" }
      );
      w.onmessage  = makeWorkerHandler(imageActiveIds);
      w.onerror    = makeWorkerErrorHandler(imageActiveIds, imageWorkerRef);
      imageWorkerRef.current = w;
      return w;
    } catch {
      return null;
    }
  }

  function getVideoWorker(): Worker | null {
    if (videoWorkerRef.current) return videoWorkerRef.current;

    try {
      const w = new Worker(
        new URL("../../workers/video.worker.ts", import.meta.url),
        { type: "module" }
      );
      w.onmessage = makeWorkerHandler(videoActiveIds);
      w.onerror   = makeWorkerErrorHandler(videoActiveIds, videoWorkerRef);
      videoWorkerRef.current = w;
      return w;
    } catch {
      return null;
    }
  }

  // ── Main-thread fallback (Safari < 16.4 — no OffscreenCanvas) ────────────

  async function compressImageOnMainThread(id: string, file: File) {
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
      imageActiveIds.current.delete(id);
    }
  }

  // ── Queue processor ────────────────────────────────────────────────────────

  useEffect(() => {
    // Start a new session when the trigger counter increments
    if (compressionTrigger > lastProcessedTrigger.current) {
      lastProcessedTrigger.current = compressionTrigger;
      isSessionActive.current = true;
    }

    if (!isSessionActive.current) return;

    const queued = files.filter((f) => f.status === "queued");

    // End session when nothing is left to process
    const imageActive = imageActiveIds.current.size;
    const videoActive = videoActiveIds.current.size;
    const queuedImages = queued.filter((f) => f.type === "image" && !imageActiveIds.current.has(f.id));
    const queuedVideos = queued.filter((f) => f.type === "video" && !videoActiveIds.current.has(f.id));

    if (
      queuedImages.length === 0 && imageActive === 0 &&
      queuedVideos.length === 0 && videoActive === 0
    ) {
      isSessionActive.current = false;
      return;
    }

    // ── Dispatch images ────────────────────────────────────────────────────
    const imgSlots   = MAX_IMG_CONCURRENT - imageActive;
    const toImages   = queuedImages.slice(0, Math.max(0, imgSlots));
    const imgWorker  = toImages.length > 0 ? getImageWorker() : null;

    for (const item of toImages) {
      imageActiveIds.current.add(item.id);
      updateFile(item.id, { status: "processing", progress: 5 });

      if (imgWorker) {
        imgWorker.postMessage({ id: item.id, file: item.file, settings } satisfies WorkerRequest);
      } else {
        compressImageOnMainThread(item.id, item.file);
      }
    }

    // ── Dispatch videos ────────────────────────────────────────────────────
    const vidSlots  = MAX_VID_CONCURRENT - videoActive;
    const toVideos  = queuedVideos.slice(0, Math.max(0, vidSlots));
    const vidWorker = toVideos.length > 0 ? getVideoWorker() : null;

    for (const item of toVideos) {
      videoActiveIds.current.add(item.id);
      updateFile(item.id, { status: "processing", progress: 5 });

      if (vidWorker) {
        vidWorker.postMessage({ id: item.id, file: item.file, settings } satisfies WorkerRequest);
      } else {
        updateFileRef.current(item.id, {
          status: "error",
          error: "Could not create video worker",
        });
        videoActiveIds.current.delete(item.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, compressionTrigger]);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      imageWorkerRef.current?.terminate();
      imageWorkerRef.current = null;
      videoWorkerRef.current?.terminate();
      videoWorkerRef.current = null;
    };
  }, []);
}
