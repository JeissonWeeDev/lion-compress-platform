import { CompressionMode } from "@/types/compression";

export interface ImagePresetParams {
  jpegQuality: number;   // 0-100
  webpQuality: number;   // 0-100
  avifQuality: number;   // 0-100
  oxipngLevel: number;   // 0-6
  stripMetadata: boolean;
}

export interface VideoPresetParams {
  bitrateRatio: number;    // 0.0-1.0 relative to original
  codec: "h264" | "av1" | "vp9" | "same";
}

export const IMAGE_PRESETS: Record<CompressionMode, ImagePresetParams> = {
  lossless: {
    jpegQuality: 100,
    webpQuality: 100,
    avifQuality: 100,
    oxipngLevel: 4,
    stripMetadata: false,
  },
  balanced: {
    jpegQuality: 82,
    webpQuality: 80,
    avifQuality: 65,
    oxipngLevel: 2,
    stripMetadata: true,
  },
  custom: {
    // Values overridden by user slider
    jpegQuality: 75,
    webpQuality: 75,
    avifQuality: 60,
    oxipngLevel: 2,
    stripMetadata: true,
  },
};

export const VIDEO_PRESETS: Record<CompressionMode, VideoPresetParams> = {
  lossless: {
    bitrateRatio: 1.0,
    codec: "same",
  },
  balanced: {
    bitrateRatio: 0.55,
    codec: "h264",
  },
  custom: {
    bitrateRatio: 0.5,
    codec: "h264",
  },
};
