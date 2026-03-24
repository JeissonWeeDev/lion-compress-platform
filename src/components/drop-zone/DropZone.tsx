"use client";

import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  DragEvent,
  ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderOpen } from "lucide-react";
import { clsx } from "clsx";
import { useAppStore } from "@/store/app-store";
import { useDict } from "@/lib/i18n/context";
import { ALL_SUPPORTED_TYPES, getFileMimeFromMagicBytes } from "@/lib/utils/browser-support";
import { Button } from "@/components/ui/Button";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif,.mp4,.webm,.mov";
const MAX_IMAGE_SIZE = 200 * 1024 * 1024;
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024;

// Dash pattern: dash length + gap length = total cycle
const DASH = 8;
const GAP = 5;
const DASH_CYCLE = DASH + GAP; // 13px per cycle

type ValidationError =
  | { type: "empty" }
  | { type: "unsupported"; ext: string }
  | { type: "videoSize" }
  | { type: "imageSize" };

async function validateFile(file: File): Promise<ValidationError | null> {
  if (file.size === 0) return { type: "empty" };

  const mime = await getFileMimeFromMagicBytes(file);
  const effectiveMime = mime ?? file.type;

  if (!ALL_SUPPORTED_TYPES.has(effectiveMime)) {
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "unknown";
    return { type: "unsupported", ext };
  }

  const isVideo = effectiveMime.startsWith("video/");
  if (isVideo && file.size > MAX_VIDEO_SIZE) return { type: "videoSize" };
  if (!isVideo && file.size > MAX_IMAGE_SIZE) return { type: "imageSize" };

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

// Animated SVG border — renders the dashed rect with marching ants
function DropZoneBorder({
  w,
  h,
  isHovered,
  isDragging,
}: {
  w: number;
  h: number;
  isHovered: boolean;
  isDragging: boolean;
}) {
  const active = isHovered || isDragging;

  // Stroke is centered on the rect edge; inset by half stroke-width (0.75) so it's fully visible
  const sw = 1.5;
  const inset = sw / 2;
  const rx = 23.25; // --radius-xl (24px) minus inset (0.75px)

  const rectProps = {
    x: inset,
    y: inset,
    width: Math.max(0, w - sw),
    height: Math.max(0, h - sw),
    rx,
    fill: "none" as const,
    strokeWidth: sw,
    strokeDasharray: `${DASH} ${GAP}`,
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Brand gradient: blue → purple */}
        <linearGradient id="dz-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* Idle border — gray, static */}
      <motion.rect
        {...rectProps}
        stroke="var(--border-default)"
        initial={{ opacity: 1 }}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />

      {/* Active border — gradient + marching ants */}
      <motion.rect
        {...rectProps}
        strokeDasharray={isDragging ? "0 0" : `${DASH} ${GAP}`}
        stroke={isDragging ? "#3B82F6" : "url(#dz-grad)"}
        initial={{ opacity: 0, strokeDashoffset: 0 }}
        animate={{
          opacity: active ? 1 : 0,
          strokeDashoffset: active ? [0, -DASH_CYCLE] : 0,
        }}
        transition={{
          opacity: { duration: 0.25, ease: "easeInOut" },
          strokeDashoffset: {
            repeat: Infinity,
            duration: isDragging ? 0.45 : 1.1,
            ease: "linear",
          },
        }}
      />
    </svg>
  );
}

export function DropZone() {
  const addFiles = useAppStore((s) => s.addFiles);
  const dict = useDict();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Track container size for the SVG border
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const translateError = useCallback(
    (err: ValidationError): string => {
      switch (err.type) {
        case "empty":
          return dict.dropzone.errorEmpty;
        case "unsupported":
          return dict.dropzone.errorUnsupported.replace("{ext}", err.ext);
        case "videoSize":
          return dict.dropzone.errorVideoSize;
        case "imageSize":
          return dict.dropzone.errorImageSize;
      }
    },
    [dict]
  );

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const valid: File[] = [];
      const errs: string[] = [];

      for (const file of rawFiles) {
        const err = await validateFile(file);
        if (err) {
          errs.push(`${file.name}: ${translateError(err)}`);
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
    [addFiles, translateError]
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

  const active = isHovered || isDragging;

  return (
    <div className="w-full space-y-3">
      <motion.div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        initial={{
          scale: 1,
          backgroundColor: "rgba(0, 0, 0, 0)",
          boxShadow: "0 0 0 0px rgba(59,130,246,0.00)",
        }}
        animate={{
          scale: isDragging ? 1.02 : isHovered ? 1.005 : 1,
          backgroundColor: isDragging
            ? "color-mix(in srgb, var(--accent-primary) 6%, transparent)"
            : "rgba(0, 0, 0, 0)",
          boxShadow: isDragging
            ? "0 0 0 4px rgba(59,130,246,0.10), 0 0 32px rgba(59,130,246,0.10)"
            : isHovered
            ? "0 0 0 4px rgba(59,130,246,0.06), 0 0 20px rgba(59,130,246,0.06)"
            : "0 0 0 0px rgba(59,130,246,0.00)",
        }}
        transition={{
          scale: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
          backgroundColor: { duration: 0.2 },
          boxShadow: { duration: 0.3, ease: "easeOut" },
        }}
        role="region"
        aria-label={dict.dropzone.regionLabel}
        className={clsx(
          "relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-5",
          "rounded-[var(--radius-xl)] select-none"
        )}
      >
        {/* Animated SVG border */}
        <DropZoneBorder
          w={dims.w}
          h={dims.h}
          isHovered={isHovered}
          isDragging={isDragging}
        />

        {/* Content */}
        <motion.div
          animate={{ y: isDragging ? -8 : 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            animate={
              isDragging
                ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5 } }
                : { scale: 1 }
            }
            className={clsx(
              "flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-bg-tertiary",
              "shadow-sm transition-shadow duration-300",
              active && "shadow-md"
            )}
          >
            {isDragging ? (
              <Upload size={24} className="text-accent" strokeWidth={2.5} />
            ) : (
              <motion.div
                animate={{ color: isHovered ? "var(--text-secondary)" : "var(--text-tertiary)" }}
                transition={{ duration: 0.2 }}
              >
                <FolderOpen size={24} strokeWidth={1.5} />
              </motion.div>
            )}
          </motion.div>

          <div className="space-y-1">
            <p className="text-base font-medium text-text-primary">
              {isDragging ? dict.dropzone.dragging : dict.dropzone.idle}
            </p>
            <motion.p
              animate={{ opacity: isDragging ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              className="text-sm text-text-tertiary"
            >
              {dict.dropzone.hint}
            </motion.p>
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
          {dict.dropzone.button}
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
