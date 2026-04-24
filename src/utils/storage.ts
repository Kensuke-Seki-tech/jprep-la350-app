export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed:', e);
  }
}

export function removeItem(key: string): void {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

export function userKey(userId: string, suffix: string): string {
  return `user_${userId}_${suffix}`;
}
