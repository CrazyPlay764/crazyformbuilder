// Client-side login/signup throttling. Not a substitute for server-side rate limiting,
// but adds a brute-force deterrent on top of Supabase's own auth throttling.

const KEY = 'crazyforms_auth_attempts';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min window
const LOCKOUT_MS = 15 * 60 * 1000; // 15 min lockout after exceeding

interface AttemptRecord {
  failures: number[]; // timestamps
  lockedUntil?: number;
}

const read = (): AttemptRecord => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { failures: [] };
    return JSON.parse(raw);
  } catch {
    return { failures: [] };
  }
};

const write = (rec: AttemptRecord) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(rec));
  } catch {
    /* ignore */
  }
};

export function getLockRemainingMs(): number {
  const rec = read();
  if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
    return rec.lockedUntil - Date.now();
  }
  return 0;
}

export function recordFailure() {
  const rec = read();
  const now = Date.now();
  rec.failures = rec.failures.filter((t) => now - t < WINDOW_MS);
  rec.failures.push(now);
  if (rec.failures.length >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
    rec.failures = [];
  }
  write(rec);
}

export function resetAttempts() {
  write({ failures: [] });
}

export function formatRemaining(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
