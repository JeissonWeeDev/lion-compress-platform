"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, FileVideo, ImageIcon, CheckCircle, AlertCircle, Download } from "lucide-react";
import { FileItem } from "@/types/compression";
import { useDict } from "@/lib/i18n/context";
import { formatBytes, savingsPercent } from "@/lib/utils/format-bytes";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/store/app-store";
import { clsx } from "clsx";

// ─── Thumbnail generation ─────────────────────────────────────────────────────
// Uses createImageBitmap with resize options so the browser only decodes enough
// pixels to fill a 96×96 canvas — safe even for 200 MB source files.

const THUMB_PX = 96; // canvas resolution (displayed at 56px = good at 2× retina)
const THUMB_QUALITY = 0.5; // JPEG quality for the data URL (~5–15 KB per thumb)

async function generateThumbnail(file: File): Promise<string | null> {
  if (typeof createImageBitmap === "undefined") return null;

  try {
    // Downscale during decode — the browser never allocates the full bitmap in RAM
    const bitmap = await createImageBitmap(file, {
      resizeWidth: THUMB_PX,
      resizeQuality: "low",
    });

    const canvas = document.createElement("canvas");
    canvas.width = THUMB_PX;
    canvas.height = THUMB_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); return null; }

    // Center-crop to square
    const bw = bitmap.width;
    const bh = bitmap.height;
    if (bw === bh) {
      ctx.drawImage(bitmap, 0, 0, THUMB_PX, THUMB_PX);
    } else if (bw > bh) {
      // Landscape — crop sides
      const sx = (bw - bh) / 2;
      ctx.drawImage(bitmap, sx, 0, bh, bh, 0, 0, THUMB_PX, THUMB_PX);
    } else {
      // Portrait — crop top/bottom
      const sy = (bh - bw) / 2;
      ctx.drawImage(bitmap, 0, sy, bw, bw, 0, 0, THUMB_PX, THUMB_PX);
    }

    bitmap.close(); // free ImageBitmap memory immediately
    return canvas.toDataURL("image/jpeg", THUMB_QUALITY);
  } catch {
    // Unsupported format (e.g. AVIF on older browsers) — fall back to icon
    return null;
  }
}

type ThumbnailState = "loading" | "ready" | "unavailable";

function useThumbnail(file: FileItem): { src: string | null; state: ThumbnailState } {
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<ThumbnailState>(
    file.type === "image" ? "loading" : "unavailable"
  );

  useEffect(() => {
    if (file.type !== "image") return;

    let cancelled = false;
    generateThumbnail(file.file).then((dataUrl) => {
      if (cancelled) return;
      if (dataUrl) {
        setSrc(dataUrl);
        setState("ready");
      } else {
        setState("unavailable");
      }
    });

    return () => { cancelled = true; };
  }, [file.file, file.type]);

  return { src, state };
}

// ─── FileCard ─────────────────────────────────────────────────────────────────

interface FileCardProps {
  file: FileItem;
}

export function FileCard({ file }: FileCardProps) {
  const removeFile = useAppStore((s) => s.removeFile);
  const dict = useDict();
  const { src: thumbnail, state: thumbState } = useThumbnail(file);

  const savings = file.result ? savingsPercent(file.size, file.result.size) : 0;
  const savingsBadge = savings >= 30 ? "success" : savings >= 10 ? "warning" : "default";

  const handleDownload = () => {
    if (!file.result) return;
    const url = URL.createObjectURL(file.result.blob);
    const a = document.createElement("a");
    a.href = url;
    const ext =
      file.result.outputFormat === "same"
        ? file.name.split(".").pop()
        : file.result.outputFormat;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group/card flex items-start gap-3.5 rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3 shadow-sm"
    >
      {/* ── Thumbnail with X overlay ─────────────────────────────────────── */}
      <div className="relative shrink-0">
        <div className="size-14 overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary">
          {thumbState === "ready" && thumbnail ? (
            <motion.img
              src={thumbnail}
              alt={file.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="size-full object-cover"
            />
          ) : thumbState === "loading" ? (
            // Pulse skeleton while the 96×96 canvas thumbnail generates
            <div className="size-full animate-pulse bg-bg-tertiary" />
          ) : file.type === "video" ? (
            <div className="flex size-full items-center justify-center">
              <FileVideo size={22} className="text-text-tertiary" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon size={22} className="text-text-tertiary" strokeWidth={1.5} />
            </div>
          )}

          {/* Status overlay on thumbnail */}
          {file.status === "completed" && (
            <div className="absolute inset-0 flex items-end justify-start p-1">
              <span className="rounded-full bg-success/90 p-0.5">
                <CheckCircle size={10} className="text-white" strokeWidth={2.5} />
              </span>
            </div>
          )}
          {file.status === "error" && (
            <div className="absolute inset-0 flex items-end justify-start p-1">
              <span className="rounded-full bg-error/90 p-0.5">
                <AlertCircle size={10} className="text-white" strokeWidth={2.5} />
              </span>
            </div>
          )}
        </div>

        {/* X button — overlaid on thumbnail corner, appears on hover/focus */}
        <button
          onClick={() => removeFile(file.id)}
          aria-label={dict.fileCard.remove}
          className={clsx(
            "absolute -right-1.5 -top-1.5 flex size-5 cursor-pointer items-center justify-center",
            "rounded-full border border-border bg-bg-elevated shadow-sm",
            "text-text-tertiary transition-all duration-150",
            "opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100",
            "hover:border-red-400 hover:bg-red-50 hover:text-red-500",
            "dark:hover:bg-red-950 dark:hover:border-red-700 dark:hover:text-red-400"
          )}
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── File info ────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Name */}
        <p
          className="truncate text-xs font-medium leading-snug text-text-primary"
          title={file.name}
        >
          {file.name}
        </p>

        {/* Sizes */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-[11px] text-text-secondary">
          <span>{formatBytes(file.size)}</span>
          {file.result && (
            <>
              <span className="text-text-tertiary">→</span>
              <span className="font-medium text-text-primary">
                {formatBytes(file.result.size)}
              </span>
              <Badge variant={savingsBadge}>−{savings.toFixed(1)}%</Badge>
            </>
          )}
        </div>

        {/* Progress bar */}
        {file.status === "processing" && (
          <Progress value={file.progress} />
        )}

        {/* Download link */}
        {file.status === "completed" && file.result && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs text-accent underline-offset-2 hover:underline cursor-pointer"
          >
            <Download size={13} strokeWidth={2} />
            {dict.fileCard.download}
          </button>
        )}

        {/* Error message */}
        {file.status === "error" && (
          <p className="text-[11px] leading-snug text-error">
            {file.error ?? dict.fileCard.defaultError}
          </p>
        )}
      </div>
    </motion.div>
  );
}
