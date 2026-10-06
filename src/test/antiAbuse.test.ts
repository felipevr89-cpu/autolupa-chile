import { beforeEach, describe, expect, it } from 'vitest';
import {
  checkAntiAbuse,
  MIN_FILL_TIME_MS,
  PUBLISH_DAILY_LIMIT,
  readPublishCount,
  recordPublish,
} from '../lib/antiAbuse';

const base = { honeypot: '', elapsedMs: MIN_FILL_TIME_MS + 500 };

describe('antiAbuse', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deja pasar a un usuario normal', () => {
    expect(checkAntiAbuse(base)).toEqual({ ok: true });
  });

  it('bloquea si el honeypot fue completado', () => {
    const result = checkAntiAbuse({ ...base, honeypot: ' https://spam.example ' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/No pudimos procesar/);
  });

  it('bloquea envíos más rápidos que la trampa de tiempo', () => {
    expect(checkAntiAbuse({ ...base, elapsedMs: MIN_FILL_TIME_MS - 1 }).ok).toBe(false);
    expect(checkAntiAbuse({ ...base, elapsedMs: 0 }).ok).toBe(false);
    expect(checkAntiAbuse({ ...base, elapsedMs: MIN_FILL_TIME_MS }).ok).toBe(true);
  });

  it('el error para bots es genérico y no delata la trampa', () => {
    const honeypot = checkAntiAbuse({ ...base, honeypot: 'x' });
    const fast = checkAntiAbuse({ ...base, elapsedMs: 10 });
    expect(honeypot.ok).toBe(false);
    expect(fast.ok).toBe(false);
    if (!honeypot.ok && !fast.ok) {
      expect(honeypot.message).toBe(fast.message);
      expect(honeypot.message).not.toMatch(/honeypot|trampa|bot/i);
    }
  });

  it('limita a 5 publicaciones cada 24 horas', () => {
    const now = 1_800_000_000_000;
    for (let index = 0; index < PUBLISH_DAILY_LIMIT; index += 1) {
      expect(checkAntiAbuse({ ...base, now: now + index }).ok).toBe(true);
      recordPublish(now + index);
    }
    expect(readPublishCount(now + PUBLISH_DAILY_LIMIT)).toBe(PUBLISH_DAILY_LIMIT);
    const blocked = checkAntiAbuse({ ...base, now: now + PUBLISH_DAILY_LIMIT });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.message).toContain(String(PUBLISH_DAILY_LIMIT));
  });

  it('libera el cupo cuando pasan 24 horas', () => {
    const now = 1_800_000_000_000;
    for (let index = 0; index < PUBLISH_DAILY_LIMIT; index += 1) recordPublish(now);
    expect(checkAntiAbuse({ ...base, now: now + 23 * 60 * 60 * 1000 }).ok).toBe(false);
    expect(checkAntiAbuse({ ...base, now: now + 24 * 60 * 60 * 1000 }).ok).toBe(true);
    expect(readPublishCount(now + 24 * 60 * 60 * 1000)).toBe(0);
  });

  it('ignora basura en localStorage sin lanzar', () => {
    localStorage.setItem('autolupa_publish_times', 'no-es-json');
    expect(checkAntiAbuse(base).ok).toBe(true);
    localStorage.setItem('autolupa_publish_times', JSON.stringify(['a', null, 5]));
    expect(checkAntiAbuse(base).ok).toBe(true);
    expect(recordPublish()).toHaveLength(1);
  });
});
