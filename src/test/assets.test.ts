import { describe, expect, it } from 'vitest';
import manifest from '../data/carImages.json';

describe('assets de modelos', () => {
  it('Ford Territory usa la foto de la generación 2023+', () => {
    const entry = (manifest as Record<string, { source?: string } | null>)['188'];
    expect(entry).not.toBeNull();
    expect(entry?.source).toContain('2023_Ford_Territory');
  });
});
