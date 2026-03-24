"use client";

import { useAppStore } from "@/store/app-store";
import { useDict } from "@/lib/i18n/context";
import { CompressionMode, OutputFormat } from "@/types/compression";
import { clsx } from "clsx";

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
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => updateSettings({ mode: m.value })}
              className={clsx(
                "flex flex-col gap-0.5 rounded-[var(--radius-md)] border px-3 py-2.5 text-left",
                "transition-all duration-150 cursor-pointer",
                settings.mode === m.value
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border bg-bg-primary text-text-secondary hover:border-border-hover"
              )}
            >
              <span className="text-xs font-semibold">{m.label}</span>
              <span className="text-[10px] leading-tight opacity-70">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quality slider — only for custom mode */}
      {settings.mode === "custom" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary">{dict.settings.quality}</p>
            <span className="font-mono text-xs text-text-primary">{settings.quality}</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={settings.quality}
            onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
            className="w-full accent-[var(--accent-primary)]"
            aria-label={dict.settings.quality}
          />
          <div className="flex justify-between font-mono text-[10px] text-text-tertiary">
            <span>{dict.settings.qualityMin}</span>
            <span>{dict.settings.qualityMax}</span>
          </div>
        </div>
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
                  : "border-border text-text-secondary hover:border-border-hover"
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
            "relative h-5 w-9 rounded-full transition-colors duration-200",
            settings.stripMetadata ? "bg-accent" : "bg-bg-tertiary border border-border"
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200",
              settings.stripMetadata ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
      </label>
    </div>
  );
}
