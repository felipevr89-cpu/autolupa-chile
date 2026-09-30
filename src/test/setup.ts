import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

vi.stubEnv('VITE_SUPABASE_URL', '');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => undefined;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
