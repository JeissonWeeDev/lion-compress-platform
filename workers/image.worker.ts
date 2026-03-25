/**
 * Image compression worker — runs entirely off the main thread.
 *
 * PNG → PNG  : @jsquash/oxipng  (lossless WASM optimizer — always smaller or equal)
 * Everything else : OffscreenCanvas + convertToBlob  (lossy, Canvas API)
 */

import type { WorkerRequest, WorkerResponse } from "@/lib/compression/worker-types";
import {
  resolveOutputMime,
  resolveQuality,
  resolvePngLevel,
  calcSavings,
} from "@/lib/compression/engine";

// Lazy singleton so WASM is only fetched when a PNG file is actually processed.
type OxipngFn = (data: ArrayBuffer | ImageData, opts?: { level?: number }) => Promise<ArrayBuffer>;
let _oxipng: OxipngFn | null = null;

async function getOxipng(): Promise<OxipngFn> {
  if (!_oxipng) {
    // @jsquash/oxipng exports optimise as named — accepts ArrayBuffer|ImageData, returns ArrayBuffer
    const mod = await import("@jsquash/oxipng");
    _oxipng = mod.optimise as unknown as OxipngFn;
  }
  return _oxipng!;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function post(msg: WorkerResponse) {
  self.postMessage(msg);
}

// ── Main handler ─────────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, file, settings } = e.data;
  const start = performance.now();

  try {
    post({ type: "progress", id, progress: 10 });

    const { mime, ext } = resolveOutputMime(settings, file.type);
    const isPngToPng    = file.type === "image/png" && mime === "image/png";

    let blob: Blob;

    // ── Path A: PNG → PNG via oxipng (lossless WASM) ──────────────────────
    if (isPngToPng) {
      const oxipng = await getOxipng();
      post({ type: "progress", id, progress: 30 });

      const raw       = await file.arrayBuffer();
      post({ type: "progress", id, progress: 50 });

      const optimised = await oxipng(raw, { level: resolvePngLevel(settings) });
      post({ type: "progress", id, progress: 90 });

      blob = new Blob([optimised], { type: "image/png" });
    }
    // ── Path B: Everything else via OffscreenCanvas + convertToBlob ────────
    else {
      const quality = resolveQuality(settings, mime);
      const bitmap  = await createImageBitmap(file);
      post({ type: "progress", id, progress: 40 });

      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx    = canvas.getContext("2d");
      if (!ctx) throw new Error("OffscreenCanvas 2D context unavailable");

      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      post({ type: "progress", id, progress: 70 });

      // Encode — fall back to WebP if the requested codec is unsupported
      try {
        blob = await canvas.convertToBlob({ type: mime, quality });
        // Some browsers silently return image/png when the codec is unavailable
        if (mime !== "image/png" && blob.type !== mime) {
          blob = await canvas.convertToBlob({ type: "image/webp", quality });
        }
      } catch {
        blob = await canvas.convertToBlob({ type: "image/webp", quality });
      }
    }

    post({ type: "progress", id, progress: 95 });

    // Never ship a file larger than the original
    const useOriginal = blob.size >= file.size;
    const finalBlob   = useOriginal ? file : blob;
    const finalExt    = useOriginal ? (file.name.split(".").pop() ?? ext) : ext;

    post({
      type:         "done",
      id,
      blob:         finalBlob,
      size:         finalBlob.size,
      savings:      calcSavings(file.size, finalBlob.size),
      outputFormat: finalExt,
      duration:     Math.round(performance.now() - start),
    });
  } catch (err) {
    post({
      type:    "error",
      id,
      message: err instanceof Error ? err.message : "Compression failed",
    });
  }
};
