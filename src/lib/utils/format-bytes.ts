export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatSavings(original: number, compressed: number): string {
  if (original === 0) return "0%";
  const pct = ((original - compressed) / original) * 100;
  return `${pct.toFixed(1)}%`;
}

export function savingsPercent(original: number, compressed: number): number {
  if (original === 0) return 0;
  return ((original - compressed) / original) * 100;
}
