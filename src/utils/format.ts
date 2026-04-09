export function formatDate(date: Date): string {
  return date.toISOString();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}
