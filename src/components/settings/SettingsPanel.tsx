"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { useDict } from "@/lib/i18n/context";
import { CompressionMode, OutputFormat } from "@/types/compression";
import { clsx } from "clsx";

// Each mode has a dedicated color pulled from the design token palette
const MODE_COLOR: Record<
  CompressionMode,
  { border: string; bg: string; text: string; dot: string }
> = {
  lossless: {
    border: "var(--color-green-500)",
    bg: "color-mix(in srgb, var(--color-green-500) 7%, transparent)",
    text: "var(--color-green-500)",
    dot: "var(--color-green-500)",
  },
  balanced: {
    border: "var(--color-blue-500)",
    bg: "color-mix(in srgb, var(--color-blue-500) 7%, transparent)",
    text: "var(--color-blue-500)",
    dot: "var(--color-blue-500)",
  },
  custom: {
    border: "var(--color-purple-500)",
    bg: "color-mix(in srgb, var(--color-purple-500) 7%, transparent)",
    text: "var(--color-purple-500)",
    dot: "var(--color-purple-500)",
  },
};

export function SettingsPanel() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const dict = useDict();

  const MODES: { value: CompressionMode; label: string; desc: string }[] = [
    { value: "lossless", label: dict.settings.lossless, desc: dict.settings.losslessDesc },
    { value: "balanced", label: dict.settings.balanced, desc: dict.settings.balancedDesc },
    { value: "custom",   label: dict.settings.custom,   desc: dict.settings.customDesc },
  ];

  const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
    { value: "same", label: dict.settings.formatSame },
    { value: "webp", label: "WebP" },
    { value: "avif", label: "AVIF" },
    { value: "jpeg", label: "JPEG" },
    { value: "png",  label: "PNG" },
  ];

  return (
    <div className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-text-primary">{dict.settings.title}</h2>

      {/* Mode selector */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-text-secondary">{dict.settings.compressionMode}</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => {
            const selected = settings.mode === m.value;
            const color = MODE_COLOR[m.value];

            return (
              <motion.button
                key={m.value}
                onClick={() => updateSettings({ mode: m.value })}
                animate={
                  selected
                    ? {
                        borderColor: color.border,
                        backgroundColor: color.bg,
                        color: color.text,
                      }
                    : {
                        borderColor: "var(--border-default)",
                        backgroundColor: "transparent",
                        color: "var(--text-secondary)",
                      }
                }
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={clsx(
                  "relative flex flex-col gap-1 rounded-[var(--radius-md)] border px-3 py-2.5 text-left",
                  "cursor-pointer overflow-hidden",
                  !selected && "hover:border-[var(--border-hover)]"
                )}
              >
                {/* Mode color indicator bar at the top */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-[2px]"
                  animate={{
                    backgroundColor: selected ? color.dot : "transparent",
                    opacity: selected ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />

                <span className="text-xs font-semibold leading-none">{m.label}</span>
                <span className="text-[10px] leading-tight opacity-60">{m.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quality slider — only for custom mode */}
      {settings.mode === "custom" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary">{dict.settings.quality}</p>
            <span
              className="rounded px-1.5 py-0.5 font-mono text-xs font-semibold text-white"
              style={{ backgroundColor: MODE_COLOR.custom.dot }}
            >
              {settings.quality}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={settings.quality}
            onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
            className="w-full cursor-pointer"
            style={{ accentColor: MODE_COLOR.custom.dot }}
            aria-label={dict.settings.quality}
          />
          <div className="flex justify-between font-mono text-[10px] text-text-tertiary">
            <span>{dict.settings.qualityMin}</span>
            <span>{dict.settings.qualityMax}</span>
          </div>
        </motion.div>
      )}

      {/* Output format */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-text-secondary">{dict.settings.outputFormat}</p>
        <div className="flex flex-wrap gap-1.5">
          {OUTPUT_FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => updateSettings({ outputFormat: f.value })}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs transition-all duration-150 cursor-pointer",
                settings.outputFormat === f.value
                  ? "border-accent bg-accent/10 font-medium text-accent"
                  : "border-border text-text-secondary hover:border-[var(--border-hover)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Strip metadata toggle */}
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-primary">{dict.settings.stripMetadata}</p>
          <p className="text-[11px] text-text-tertiary">{dict.settings.stripMetadataDesc}</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.stripMetadata}
          onClick={() => updateSettings({ stripMetadata: !settings.stripMetadata })}
          className={clsx(
            "relative flex h-5 w-9 shrink-0 items-center rounded-full px-1 transition-colors duration-200 focus:outline-none",
            settings.stripMetadata ? "bg-accent" : "bg-bg-tertiary border border-border"
          )}
        >
          <span
            className={clsx(
              "size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
              settings.stripMetadata ? "translate-x-3.5" : "translate-x-0"
            )}
          />
        </button>
      </label>
    </div>
  );
}
