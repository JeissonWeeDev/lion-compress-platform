"use client";

import { AnimatePresence } from "framer-motion";
import { Trash2, Download } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useDict } from "@/lib/i18n/context";
import { FileCard } from "./FileCard";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/utils/format-bytes";
import JSZip from "jszip";

export function FileList() {
  const files = useAppStore((s) => s.files);
  const clearAll = useAppStore((s) => s.clearAll);
  const getCompletedFiles = useAppStore((s) => s.getCompletedFiles);
  const dict = useDict();

  if (files.length === 0) return null;

  const completed = getCompletedFiles();
  const totalOriginal = completed.reduce((acc, f) => acc + f.size, 0);
  const totalCompressed = completed.reduce(
    (acc, f) => acc + (f.result?.size ?? 0),
    0
  );

  const fileWord = files.length === 1 ? dict.fileList.fileOne : dict.fileList.fileOther;

  const handleDownloadAll = async () => {
    if (completed.length === 0) return;
    const zip = new JSZip();
    for (const file of completed) {
      if (!file.result) continue;
      const ext = file.result.outputFormat === "same"
        ? file.name.split(".").pop()
        : file.result.outputFormat;
      const name = `${file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`;
      zip.file(name, file.result.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lioncompress-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4" aria-label={dict.fileList.regionLabel}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {files.length} {fileWord}
          {completed.length > 0 && totalCompressed > 0 && (
            <span className="ml-1 text-text-tertiary">
              · {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}
            </span>
          )}
        </p>

        <div className="flex gap-2">
          {completed.length > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadAll}
              className="gap-1.5"
            >
              <Download size={13} />
              {dict.fileList.downloadAll}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="gap-1.5 text-text-tertiary hover:text-error"
            aria-label={dict.fileList.clearLabel}
          >
            <Trash2 size={13} />
            {dict.fileList.clear}
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
