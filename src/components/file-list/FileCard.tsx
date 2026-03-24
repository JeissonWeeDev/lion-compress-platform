"use client";

import { motion } from "framer-motion";
import { X, FileVideo, Image, CheckCircle, AlertCircle } from "lucide-react";
import { FileItem } from "@/types/compression";
import { formatBytes, savingsPercent } from "@/lib/utils/format-bytes";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app-store";
import { clsx } from "clsx";

interface FileCardProps {
  file: FileItem;
}

export function FileCard({ file }: FileCardProps) {
  const removeFile = useAppStore((s) => s.removeFile);

  const savings = file.result
    ? savingsPercent(file.size, file.result.size)
    : 0;

  const savingsBadge =
    savings >= 30
      ? "success"
      : savings >= 10
      ? "warning"
      : "default";

  const handleDownload = () => {
    if (!file.result) return;
    const url = URL.createObjectURL(file.result.blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = file.result.outputFormat === "same"
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
      className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4 shadow-sm"
    >
      {/* Thumbnail / Icon */}
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary">
        {file.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.thumbnail}
            alt={file.name}
            className="size-full object-cover"
          />
        ) : file.type === "video" ? (
          <FileVideo size={20} className="text-text-tertiary" />
        ) : (
          <Image size={20} className="text-text-tertiary" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-text-primary" title={file.name}>
            {file.name}
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Eliminar archivo"
            onClick={() => removeFile(file.id)}
            className="size-7 shrink-0 p-0 text-text-tertiary hover:text-error"
          >
            <X size={14} />
          </Button>
        </div>

        {/* Sizes */}
        <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
          <span>{formatBytes(file.size)}</span>
          {file.result && (
            <>
              <span className="text-text-tertiary">→</span>
              <span className="text-text-primary">{formatBytes(file.result.size)}</span>
              <Badge variant={savingsBadge}>-{savings.toFixed(1)}%</Badge>
            </>
          )}
        </div>

        {/* Progress / Status */}
        {file.status === "processing" && (
          <Progress value={file.progress} />
        )}

        {file.status === "completed" && file.result && (
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-success shrink-0" />
            <button
              onClick={handleDownload}
              className={clsx(
                "text-xs text-accent underline-offset-2 hover:underline",
                "cursor-pointer"
              )}
            >
              Descargar
            </button>
          </div>
        )}

        {file.status === "error" && (
          <div className="flex items-center gap-1.5 text-xs text-error">
            <AlertCircle size={13} />
            <span>{file.error ?? "No pudimos procesar este archivo."}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
