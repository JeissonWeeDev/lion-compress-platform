/**
 * Pure compression helpers — no browser globals, fully testable with Vitest.
 */

import type { CompressionSettings } from "@/types/compression";
import { IMAGE_PRESETS } from "./presets";

// ─── Format resolution ─────────────────────────────────────────────────────────

const MIME_MAP: Record<string, { mime: string; ext: string }> = {
  "image/jpeg": { mime: "image/jpeg", ext: "jpeg" },
  "image/jpg":  { mime: "image/jpeg", ext: "jpeg" },
  "image/png":  { mime: "image/png",  ext: "png"  },
  "image/webp": { mime: "image/webp", ext: "webp" },
  "image/avif": { mime: "image/avif", ext: "avif" },
};

/**
 * Returns the MIME type and file extension to use for encoding.
 * When outputFormat is "same", derives it from the source MIME.
 * Falls back to JPEG for unknown source types.
 */
export function resolveOutputMime(
  settings: CompressionSettings,
  sourceMime: string
): { mime: string; ext: string } {
  if (settings.outputFormat !== "same") {
    const fmt = settings.outputFormat; // "webp" | "avif" | "jpeg" | "png"
    return {
      mime: fmt === "jpeg" ? "image/jpeg" : `image/${fmt}`,
      ext: fmt,
    };
  }
  return MIME_MAP[sourceMime] ?? { mime: "image/jpeg", ext: "jpeg" };
}

// ─── Quality resolution ────────────────────────────────────────────────────────

/**
 * Returns the encoding quality as a 0–1 float.
 * PNG is always lossless so this returns 1 regardless of mode.
 */
export function resolveQuality(
  settings: CompressionSettings,
  mime: string
): number {
  const { mode, quality } = settings;

  if (mode === "custom") return quality / 100;

  const preset = IMAGE_PRESETS[mode];
  if (mime.includes("webp"))  return preset.webpQuality  / 100;
  if (mime.includes("avif"))  return preset.avifQuality  / 100;
  if (mime.includes("jpeg"))  return preset.jpegQuality  / 100;
  return 1; // PNG — quality param is ignored by canvas
}

// ─── Savings ───────────────────────────────────────────────────────────────────

/** Returns savings as a 0–100 percentage (never negative). */
export function calcSavings(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);
}
