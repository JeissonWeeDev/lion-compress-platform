/**
 * Video compression worker — mediabunny + WebCodecs API.
 *
 * Lossless mode : transmux only (copy packets, no re-encode, container change allowed)
 * Balanced mode : re-encode at QUALITY_MEDIUM
 * Custom mode   : re-encode at quality mapped from slider
 *
 * Output format: same container as input (MP4 → MP4, WebM → WebM).
 * Format conversion between containers is not exposed in the UI yet.
 */

import type { WorkerRequest, WorkerResponse } from "@/lib/compression/worker-types";
import { calcSavings } from "@/lib/compression/engine";
import {
  Input,
  Output,
  Conversion,
  ALL_FORMATS,
  BlobSource,
  Mp4OutputFormat,
  WebMOutputFormat,
  BufferTarget,
  QUALITY_HIGH,
  QUALITY_MEDIUM,
  QUALITY_LOW,
  QUALITY_VERY_LOW,
  QUALITY_VERY_HIGH,
} from "mediabunny";
import type { CompressionSettings } from "@/types/compression";
import type { Quality } from "mediabunny";

// ── Helpers ──────────────────────────────────────────────────────────────────

function post(msg: WorkerResponse) {
  self.postMessage(msg);
}

function resolveVideoQuality(settings: CompressionSettings): Quality {
  if (settings.mode === "balanced") return QUALITY_MEDIUM;
  // custom mode — map slider 0-100 to quality constants
  const q = settings.quality;
  if (q < 20) return QUALITY_VERY_LOW;
  if (q < 40) return QUALITY_LOW;
  if (q < 70) return QUALITY_MEDIUM;
  if (q < 90) return QUALITY_HIGH;
  return QUALITY_VERY_HIGH;
}

// ── Main handler ─────────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, file, settings } = e.data;
  const start = performance.now();

  try {
    post({ type: "progress", id, progress: 5 });

    // ── Input ────────────────────────────────────────────────────────────────
    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    post({ type: "progress", id, progress: 10 });

    // ── Output format ────────────────────────────────────────────────────────
    // Keep same container: MP4 → MP4, WebM/MKV → WebM
    const isWebM  = file.type === "video/webm" || file.type === "video/x-matroska";
    const outFmt  = isWebM ? new WebMOutputFormat() : new Mp4OutputFormat();
    const outExt  = isWebM ? "webm" : "mp4";

    const output = new Output({
      format: outFmt,
      target: new BufferTarget(),
    });

    // ── Conversion options ───────────────────────────────────────────────────
    const isLossless = settings.mode === "lossless";

    const conversion = await Conversion.init({
      input,
      output,
      // Lossless: let mediabunny copy packets without re-encoding (forceReencode=false is default)
      // Balanced/Custom: force re-encode with target quality
      video: isLossless
        ? undefined
        : { bitrate: resolveVideoQuality(settings), forceTranscode: true },
      audio: isLossless
        ? undefined
        : { bitrate: 128_000 },   // 128 kbps — good quality stereo
    });

    post({ type: "progress", id, progress: 15 });

    // Map conversion progress 0-1 to 15-95%
    conversion.onProgress = (p) => {
      post({ type: "progress", id, progress: Math.round(15 + p * 80) });
    };

    await conversion.execute();
    post({ type: "progress", id, progress: 97 });

    // ── Result ───────────────────────────────────────────────────────────────
    const buffer = (output.target as BufferTarget).buffer;
    if (!buffer) throw new Error("Conversion produced no output buffer");
    const blob   = new Blob([buffer], { type: outFmt.mimeType });

    // Never ship a file larger than the original
    const useOriginal = blob.size >= file.size;
    const finalBlob   = useOriginal ? file : blob;
    const finalExt    = useOriginal ? (file.name.split(".").pop() ?? outExt) : outExt;

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
    // Provide a clear error for missing WebCodecs support
    const message =
      err instanceof Error && (err.message.includes("codec") || err.message.includes("encode"))
        ? "Video compression requires WebCodecs. Try Chrome 94+ or Safari 16.4+."
        : err instanceof Error
        ? err.message
        : "Video compression failed";

    post({ type: "error", id, message });
  }
};
