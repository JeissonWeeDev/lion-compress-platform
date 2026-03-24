export interface BrowserSupport {
  wasm: boolean;
  webCodecs: boolean;
  sharedArrayBuffer: boolean;
  offscreenCanvas: boolean;
  fileSystemAccess: boolean;
}

export function detectBrowserSupport(): BrowserSupport {
  return {
    wasm: typeof WebAssembly !== "undefined",
    webCodecs: typeof VideoEncoder !== "undefined",
    sharedArrayBuffer: typeof SharedArrayBuffer !== "undefined",
    offscreenCanvas: typeof OffscreenCanvas !== "undefined",
    fileSystemAccess: "showOpenFilePicker" in window,
  };
}

// Supported MIME types
export const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const ALL_SUPPORTED_TYPES = new Set([
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
]);

// Magic bytes validation (first bytes of file)
export async function getFileMimeFromMagicBytes(
  file: File
): Promise<string | null> {
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // WebM: 1A 45 DF A3
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "video/webm";
  }
  // MP4/MOV/AVIF: ftyp box at offset 4
  const ftyp =
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70;
  if (ftyp) {
    const brand = String.fromCharCode(
      bytes[8],
      bytes[9],
      bytes[10],
      bytes[11]
    );
    if (brand.startsWith("avif") || brand.startsWith("avis")) {
      return "image/avif";
    }
    if (brand.startsWith("qt")) return "video/quicktime";
    return "video/mp4";
  }

  return null;
}
