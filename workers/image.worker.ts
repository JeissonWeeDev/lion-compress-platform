/**
 * Image compression worker — OffscreenCanvas + convertToBlob.
 * Runs entirely off the main thread.
 */

import type { WorkerRequest, WorkerResponse } from "@/lib/compression/worker-types";
import { resolveOutputMime, resolveQuality, calcSavings } from "@/lib/compression/engine";

function post(msg: WorkerResponse) {
  self.postMessage(msg);
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, file, settings } = e.data;
  const start = performance.now();

  try {
    post({ type: "progress", id, progress: 10 });

    // Decode — browser never allocates the full source in RAM
    const bitmap = await createImageBitmap(file);
    post({ type: "progress", id, progress: 40 });

    const { mime, ext } = resolveOutputMime(settings, file.type);
    const quality      = resolveQuality(settings, mime);

    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx    = canvas.getContext("2d");
    if (!ctx) throw new Error("OffscreenCanvas 2D context unavailable");

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    post({ type: "progress", id, progress: 70 });

    // Encode — fall back to WebP if the requested format is unsupported
    let blob: Blob;
    try {
      blob = await canvas.convertToBlob({ type: mime, quality });
      // Some browsers silently return image/png when the codec is unavailable
      if (mime !== "image/png" && blob.type !== mime) {
        blob = await canvas.convertToBlob({ type: "image/webp", quality });
      }
    } catch {
      blob = await canvas.convertToBlob({ type: "image/webp", quality });
    }

    // Never ship a file larger than the original
    const useOriginal = blob.size >= file.size;
    const finalBlob   = useOriginal ? file : blob;
    const finalExt    = useOriginal ? (file.name.split(".").pop() ?? ext) : ext;

    post({ type: "progress", id, progress: 95 });

    post({
      type: "done",
      id,
      blob:         finalBlob,
      size:         finalBlob.size,
      outputFormat: finalExt,
      savings:      calcSavings(file.size, finalBlob.size),
      duration:     Math.round(performance.now() - start),
    });
  } catch (err) {
    post({
      type: "error",
      id,
      message: err instanceof Error ? err.message : "Compression failed",
    });
  }
};
