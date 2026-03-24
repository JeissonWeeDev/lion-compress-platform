import type { CompressionSettings } from "@/types/compression";

// ─── Messages sent TO the worker ──────────────────────────────────────────────

export interface WorkerRequest {
  id: string;
  file: File;
  settings: CompressionSettings;
}

// ─── Messages received FROM the worker ────────────────────────────────────────

export type WorkerResponse =
  | { type: "progress"; id: string; progress: number }
  | {
      type: "done";
      id: string;
      blob: Blob;
      size: number;
      savings: number;
      outputFormat: string;
      duration: number;
    }
  | { type: "error"; id: string; message: string };
