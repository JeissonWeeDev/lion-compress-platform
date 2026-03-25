"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Download, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useDict } from "@/lib/i18n/context";
import { FileCard } from "./FileCard";
import { Button } from "@/components/ui/Button";
import { formatBytes } from "@/lib/utils/format-bytes";
import JSZip from "jszip";

export function FileList() {
  const files              = useAppStore((s) => s.files);
  const clearAll           = useAppStore((s) => s.clearAll);
  const requeueAll         = useAppStore((s) => s.requeueAll);
  const triggerCompression = useAppStore((s) => s.triggerCompression);
  const dict               = useDict();

  if (files.length === 0) return null;

  // ── Derived state ──────────────────────────────────────────────────────────
  const queued     = files.filter((f) => f.status === "queued");
  const processing = files.filter((f) => f.status === "processing");
  const completed  = files.filter((f) => f.status === "completed" && f.result);
  const errored    = files.filter((f) => f.status === "error");

  const isCompressing = processing.length > 0;
  const hasQueued     = queued.length > 0;
  const hasDone       = completed.length > 0;
  const hasErrors     = errored.length > 0;
  // All settled: nothing is queued or actively compressing
  const allSettled    = !hasQueued && !isCompressing;

  const totalOriginal   = completed.reduce((a, f) => a + f.size, 0);
  const totalCompressed = completed.reduce((a, f) => a + (f.result?.size ?? 0), 0);
  const totalSaved      = totalOriginal - totalCompressed;
  const avgSavings      = totalOriginal > 0
    ? Math.round((totalSaved / totalOriginal) * 100)
    : 0;

  const fileWord    = files.length === 1 ? dict.fileList.fileOne : dict.fileList.fileOther;
  const queuedWord  = queued.length === 1 ? dict.fileList.fileOne : dict.fileList.fileOther;

  // ── Download all as ZIP ────────────────────────────────────────────────────
  const handleDownloadAll = async () => {
    if (completed.length === 0) return;
    const zip = new JSZip();
    for (const file of completed) {
      if (!file.result) continue;
      const ext  = file.result.outputFormat;
      const name = `${file.name.replace(/\.[^.]+$/, "")}-compressed.${ext}`;
      zip.file(name, file.result.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `lioncompress-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Re-compress: reset files + start immediately ───────────────────────────
  const handleRecompress = () => {
    requeueAll();
    triggerCompression();
  };

  return (
    <section className="space-y-3" aria-label={dict.fileList.regionLabel}>

      {/* ── Step 1 — Compress CTA (files waiting, not yet triggered) ────── */}
      <AnimatePresence mode="popLayout">
        {hasQueued && !isCompressing && (
          <motion.button
            key="compress-cta"
            onClick={triggerCompression}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group/cta relative w-full overflow-hidden rounded-[var(--radius-lg)] cursor-pointer"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-[var(--color-purple-500)] opacity-90 transition-opacity duration-200 group-hover/cta:opacity-100" />
            {/* Subtle animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
            />
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2.5 px-6 py-3.5">
              <Zap size={17} className="text-white" strokeWidth={2.5} fill="currentColor" />
              <span className="text-sm font-semibold text-white">
                {dict.fileList.compressAll}
                <span className="ml-1.5 font-normal opacity-80">
                  · {queued.length} {queuedWord}
                </span>
              </span>
            </div>
          </motion.button>
        )}

        {/* ── Step 2 — Active compression progress ─────────────────────── */}
        {isCompressing && (
          <motion.div
            key="compressing-bar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-accent/20 bg-accent/5 px-4 py-3"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
              className="shrink-0 text-accent"
            >
              <RefreshCw size={15} strokeWidth={2} />
            </motion.span>
            <p className="flex-1 text-sm font-medium text-text-primary">
              {dict.fileList.compressing}
            </p>
            {/* Shimmer bar */}
            <div className="hidden w-20 overflow-hidden rounded-full bg-bg-tertiary h-1.5 sm:block">
              <motion.div
                className="h-full w-1/2 rounded-full bg-accent/70"
                animate={{ x: ["-100%", "250%"] }}
                transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Step 3 — Results + Re-compress (all settled, something done) ─ */}
        {allSettled && (hasDone || hasErrors) && (
          <motion.div
            key="results-bar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3"
          >
            {/* Savings summary */}
            <div>
              {hasDone && totalSaved > 0 ? (
                <p className="text-sm font-medium text-text-primary">
                  <span className="text-success">{formatBytes(totalSaved)}</span>
                  <span className="text-text-tertiary"> {dict.fileList.savedSummary} · {avgSavings}%</span>
                </p>
              ) : hasErrors && !hasDone ? (
                <p className="flex items-center gap-1.5 text-sm text-error">
                  <AlertTriangle size={14} strokeWidth={2} />
                  {errored.length} {errored.length === 1 ? dict.fileList.fileOne : dict.fileList.fileOther} failed
                </p>
              ) : (
                <p className="text-sm text-text-secondary">{dict.fileList.compressing}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {hasErrors && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRecompress}
                  className="gap-1.5 border-error/30 text-error hover:border-error/60 hover:bg-error/5"
                >
                  <AlertTriangle size={12} strokeWidth={2} />
                  {dict.fileList.retryFailed}
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRecompress}
                className="gap-1.5"
              >
                <RefreshCw size={12} strokeWidth={2} />
                {dict.fileList.recompress}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {files.length} {fileWord}
          {isCompressing && processing.length > 0 && (
            <span className="ml-1 text-text-tertiary">
              · {processing.length} {processing.length === 1 ? dict.fileList.fileOne : dict.fileList.fileOther} {dict.fileList.compressing.toLowerCase().replace("…", "")}
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

      {/* ── File cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
