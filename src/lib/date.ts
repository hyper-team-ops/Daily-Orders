export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatArabicDate(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) return dateKey;
  const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat('ar-SY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(localDate);
}

export function formatShortArabicDate(dateKey: string): string {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3) return dateKey;
  const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
  return new Intl.DateTimeFormat('ar-SY', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(localDate);
}

export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-SY', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
