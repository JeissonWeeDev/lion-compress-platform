export type FileType = "image" | "video";

export type FileStatus = "queued" | "processing" | "completed" | "error";

export type CompressionMode = "lossless" | "balanced" | "custom";

export type OutputFormat = "same" | "webp" | "avif" | "jpeg" | "png";

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;  // seconds (video)
  fps?: number;       // video
  codec?: string;     // video
  bitrate?: number;   // video bps
  colorSpace?: string;
}

export interface CompressionResult {
  blob: Blob;
  size: number;          // bytes
  savings: number;       // percentage 0-100
  outputFormat: string;
  duration: number;      // ms taken
  metadata?: MediaMetadata;
}

export interface CompressionSettings {
  mode: CompressionMode;
  quality: number;           // 0-100 (custom mode)
  maxWidth?: number;
  maxHeight?: number;
  outputFormat: OutputFormat;
  stripMetadata: boolean;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;            // original bytes
  type: FileType;
  mimeType: string;
  thumbnail?: string;      // Object URL
  status: FileStatus;
  progress: number;        // 0-100
  error?: string;
  result?: CompressionResult;
}

export const DEFAULT_SETTINGS: CompressionSettings = {
  mode: "balanced",
  quality: 82,
  outputFormat: "same",
  stripMetadata: true,
};
