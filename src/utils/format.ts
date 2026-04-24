export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

export function formatPercent(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
