const PUBLISH_TIMES_KEY = 'autolupa_publish_times';
const WINDOW_MS = 24 * 60 * 60 * 1000;

export const MIN_FILL_TIME_MS = 2000;
export const PUBLISH_DAILY_LIMIT = 5;

const BOT_MESSAGE = 'No pudimos procesar la publicación. Revisa los datos e inténtalo de nuevo en unos minutos.';

export interface AntiAbuseInput {
  honeypot: string;
  elapsedMs: number;
  now?: number;
}

export type AntiAbuseResult = { ok: true } | { ok: false; message: string };

function readTimes(now: number): number[] {
  try {
    const raw = localStorage.getItem(PUBLISH_TIMES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is number =>
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value <= now &&
        now - value < WINDOW_MS,
    );
  } catch {
    return [];
  }
}

function writeTimes(times: number[]): void {
  try {
    localStorage.setItem(PUBLISH_TIMES_KEY, JSON.stringify(times));
  } catch {
    return;
  }
}

export function checkAntiAbuse(input: AntiAbuseInput): AntiAbuseResult {
  const now = input.now ?? Date.now();
  if (input.honeypot.trim() !== '') return { ok: false, message: BOT_MESSAGE };
  if (input.elapsedMs < MIN_FILL_TIME_MS) return { ok: false, message: BOT_MESSAGE };
  if (readTimes(now).length >= PUBLISH_DAILY_LIMIT) {
    return {
      ok: false,
      message: `Alcanzaste el límite de ${PUBLISH_DAILY_LIMIT} publicaciones cada 24 horas. Si necesitas publicar más, escríbenos desde la página de reclamos.`,
    };
  }
  return { ok: true };
}

export function recordPublish(now: number = Date.now()): number[] {
  const times = [...readTimes(now), now].sort((a, b) => a - b);
  writeTimes(times);
  return times;
}

export function readPublishCount(now: number = Date.now()): number {
  return readTimes(now).length;
}
