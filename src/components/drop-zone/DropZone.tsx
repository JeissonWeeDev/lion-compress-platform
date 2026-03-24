"use client";

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderOpen } from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store/app-store";
import { ALL_SUPPORTED_TYPES, getFileMimeFromMagicBytes } from "@/lib/utils/browser-support";
import { Button } from "@/components/ui/Button";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif,.mp4,.webm,.mov";
const MAX_IMAGE_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

async function validateFile(file: File): Promise<string | null> {
  if (file.size === 0) return "El archivo está vacío.";

  const mime = await getFileMimeFromMagicBytes(file);
  const effectiveMime = mime ?? file.type;

  if (!ALL_SUPPORTED_TYPES.has(effectiveMime)) {
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "desconocido";
    return `Formato .${ext} no soportado. Usa JPG, PNG, WebP, AVIF, MP4 o WebM.`;
  }

  const isVideo = effectiveMime.startsWith("video/");
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return "El video supera el límite de 2 GB.";
  }
  if (!isVideo && file.size > MAX_IMAGE_SIZE) {
    return "La imagen supera el límite de 200 MB.";
  }

  return null;
}

async function collectFiles(items: DataTransferItemList | FileList): Promise<File[]> {
  const files: File[] = [];
  const list = Array.from(items as unknown as ArrayLike<DataTransferItem | File>);

  for (const item of list) {
    if (item instanceof File) {
      files.push(item);
    } else if ("webkitGetAsEntry" in item) {
      const entry = (item as DataTransferItem).webkitGetAsEntry();
      if (entry?.isDirectory) {
        await traverseDirectory(entry as FileSystemDirectoryEntry, files);
      } else if (entry?.isFile) {
        const file = await entryToFile(entry as FileSystemFileEntry);
        if (file) files.push(file);
      }
    }
  }
  return files;
}

function entryToFile(entry: FileSystemFileEntry): Promise<File | null> {
  return new Promise((resolve) => entry.file(resolve, () => resolve(null)));
}

async function traverseDirectory(
  dir: FileSystemDirectoryEntry,
  files: File[]
): Promise<void> {
  const reader = dir.createReader();
  const entries: FileSystemEntry[] = await new Promise((resolve) =>
    reader.readEntries(resolve, () => resolve([]))
  );
  for (const entry of entries) {
    if (entry.isFile) {
      const file = await entryToFile(entry as FileSystemFileEntry);
      if (file) files.push(file);
    } else if (entry.isDirectory) {
      await traverseDirectory(entry as FileSystemDirectoryEntry, files);
    }
  }
}

export function DropZone() {
  const addFiles = useAppStore((s) => s.addFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const valid: File[] = [];
      const errs: string[] = [];

      for (const file of rawFiles) {
        const err = await validateFile(file);
        if (err) {
          errs.push(`${file.name}: ${err}`);
        } else {
          valid.push(file);
        }
      }

      if (valid.length > 0) addFiles(valid);
      if (errs.length > 0) {
        setErrors(errs);
        setTimeout(() => setErrors([]), 5000);
      }
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = await collectFiles(e.dataTransfer.items);
      processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await processFiles(files);
    e.target.value = "";
  };

  return (
    <div className="w-full space-y-3">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        animate={{
          scale: isDragging ? 1.01 : 1,
          borderColor: isDragging
            ? "var(--accent-primary)"
            : "var(--border-default)",
          backgroundColor: isDragging
            ? "color-mix(in srgb, var(--accent-primary) 5%, transparent)"
            : "transparent",
        }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        role="region"
        aria-label="Zona de carga de archivos"
        className={clsx(
          "flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-5",
          "rounded-[var(--radius-xl)] border-2 border-dashed border-border",
          "transition-colors duration-150 select-none",
          "hover:border-border-hover hover:bg-bg-tertiary/40"
        )}
      >
        <motion.div
          animate={{ y: isDragging ? -4 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-bg-tertiary">
            {isDragging ? (
              <Upload size={24} className="text-accent" strokeWidth={2} />
            ) : (
              <FolderOpen size={24} className="text-text-tertiary" strokeWidth={1.5} />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base font-medium text-text-primary">
              {isDragging ? "Suelta tus archivos aquí" : "Arrastra tus archivos aquí"}
            </p>
            <p className="text-sm text-text-tertiary">
              o haz clic para seleccionar · Ctrl+V para pegar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {["JPG", "PNG", "WebP", "AVIF", "MP4", "WebM"].map((fmt) => (
              <span
                key={fmt}
                className="rounded-full border border-border bg-bg-tertiary px-2.5 py-0.5 font-mono text-xs text-text-secondary"
              >
                {fmt}
              </span>
            ))}
          </div>
        </motion.div>

        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="gap-2"
        >
          <Upload size={14} />
          Seleccionar archivos
        </Button>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        aria-hidden="true"
        onChange={handleFileInput}
      />

      {/* Validation errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-1 rounded-[var(--radius-md)] border border-red-500/20 bg-red-500/5 px-4 py-3"
            aria-live="polite"
          >
            {errors.map((e, i) => (
              <li key={i} className="text-sm text-red-600 dark:text-red-400">
                {e}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
