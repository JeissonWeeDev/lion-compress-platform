"use client";

import { clsx } from "clsx";

interface ProgressProps {
  value: number;      // 0-100
  className?: string;
  showLabel?: boolean;
}

export function Progress({ value, className, showLabel = false }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={clsx("relative w-full", className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary"
      >
        <div
          className="h-full rounded-full transition-all duration-100 ease-out"
          style={{
            width: `${clamped}%`,
            background: "var(--accent-gradient)",
          }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 block text-right font-mono text-xs text-text-tertiary">
          {clamped}%
        </span>
      )}
    </div>
  );
}
