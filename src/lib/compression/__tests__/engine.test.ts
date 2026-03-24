import { describe, it, expect } from "vitest";
import { resolveOutputMime, resolveQuality, calcSavings } from "../engine";
import type { CompressionSettings } from "@/types/compression";

const BASE: CompressionSettings = {
  mode:           "balanced",
  quality:        82,
  outputFormat:   "same",
  stripMetadata:  true,
};

// ─── resolveOutputMime ─────────────────────────────────────────────────────────

describe("resolveOutputMime", () => {
  describe("outputFormat = 'same'", () => {
    it("preserves JPEG", () => {
      expect(resolveOutputMime(BASE, "image/jpeg")).toEqual({ mime: "image/jpeg", ext: "jpeg" });
    });

    it("maps image/jpg alias to image/jpeg", () => {
      expect(resolveOutputMime(BASE, "image/jpg")).toEqual({ mime: "image/jpeg", ext: "jpeg" });
    });

    it("preserves PNG", () => {
      expect(resolveOutputMime(BASE, "image/png")).toEqual({ mime: "image/png", ext: "png" });
    });

    it("preserves WebP", () => {
      expect(resolveOutputMime(BASE, "image/webp")).toEqual({ mime: "image/webp", ext: "webp" });
    });

    it("preserves AVIF", () => {
      expect(resolveOutputMime(BASE, "image/avif")).toEqual({ mime: "image/avif", ext: "avif" });
    });

    it("falls back to JPEG for unknown source MIME", () => {
      expect(resolveOutputMime(BASE, "image/bmp")).toEqual({ mime: "image/jpeg", ext: "jpeg" });
    });
  });

  describe("explicit output format", () => {
    it("converts to WebP regardless of source", () => {
      const s = { ...BASE, outputFormat: "webp" } as CompressionSettings;
      expect(resolveOutputMime(s, "image/jpeg")).toEqual({ mime: "image/webp", ext: "webp" });
    });

    it("converts to JPEG (mime: image/jpeg)", () => {
      const s = { ...BASE, outputFormat: "jpeg" } as CompressionSettings;
      expect(resolveOutputMime(s, "image/png")).toEqual({ mime: "image/jpeg", ext: "jpeg" });
    });

    it("converts to PNG", () => {
      const s = { ...BASE, outputFormat: "png" } as CompressionSettings;
      expect(resolveOutputMime(s, "image/jpeg")).toEqual({ mime: "image/png", ext: "png" });
    });

    it("converts to AVIF", () => {
      const s = { ...BASE, outputFormat: "avif" } as CompressionSettings;
      expect(resolveOutputMime(s, "image/jpeg")).toEqual({ mime: "image/avif", ext: "avif" });
    });
  });
});

// ─── resolveQuality ───────────────────────────────────────────────────────────

describe("resolveQuality", () => {
  describe("balanced mode (preset)", () => {
    it("returns 82% for JPEG", () => {
      expect(resolveQuality(BASE, "image/jpeg")).toBeCloseTo(0.82);
    });

    it("returns 80% for WebP", () => {
      expect(resolveQuality(BASE, "image/webp")).toBeCloseTo(0.80);
    });

    it("returns 65% for AVIF", () => {
      expect(resolveQuality(BASE, "image/avif")).toBeCloseTo(0.65);
    });

    it("returns 1.0 for PNG (lossless always)", () => {
      expect(resolveQuality(BASE, "image/png")).toBe(1);
    });
  });

  describe("lossless mode", () => {
    const s = { ...BASE, mode: "lossless" } as CompressionSettings;

    it("returns 1.0 for JPEG", () => {
      expect(resolveQuality(s, "image/jpeg")).toBe(1);
    });

    it("returns 1.0 for WebP", () => {
      expect(resolveQuality(s, "image/webp")).toBe(1);
    });
  });

  describe("custom mode", () => {
    it("uses slider value ÷ 100", () => {
      const s = { ...BASE, mode: "custom", quality: 70 } as CompressionSettings;
      expect(resolveQuality(s, "image/jpeg")).toBeCloseTo(0.70);
    });

    it("handles quality = 1 (minimum)", () => {
      const s = { ...BASE, mode: "custom", quality: 1 } as CompressionSettings;
      expect(resolveQuality(s, "image/jpeg")).toBeCloseTo(0.01);
    });

    it("handles quality = 100 (maximum)", () => {
      const s = { ...BASE, mode: "custom", quality: 100 } as CompressionSettings;
      expect(resolveQuality(s, "image/jpeg")).toBeCloseTo(1.0);
    });
  });
});

// ─── calcSavings ──────────────────────────────────────────────────────────────

describe("calcSavings", () => {
  it("computes 50% savings correctly", () => {
    expect(calcSavings(1_000_000, 500_000)).toBeCloseTo(50);
  });

  it("computes ~74% savings for a typical JPEG", () => {
    expect(calcSavings(4_000_000, 1_050_000)).toBeCloseTo(73.75);
  });

  it("returns 0 when compressed ≥ original (no negative savings)", () => {
    expect(calcSavings(500_000, 600_000)).toBe(0);
    expect(calcSavings(500_000, 500_000)).toBe(0);
  });

  it("returns 0 when originalSize is 0 (avoids division by zero)", () => {
    expect(calcSavings(0, 0)).toBe(0);
  });

  it("returns 100% when compressed size is 0", () => {
    expect(calcSavings(1_000_000, 0)).toBe(100);
  });
});
