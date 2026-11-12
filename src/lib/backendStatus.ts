import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from './supabase';

export type BackendStatus = 'checking' | 'ok' | 'down' | 'unconfigured';

let pending: Promise<BackendStatus> | null = null;

export function checkBackend(timeoutMs = 5000): Promise<BackendStatus> {
  if (!isSupabaseConfigured) return Promise.resolve('unconfigured');
  if (pending) return pending;
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  pending = fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, signal: controller.signal })
    .then((res) => (res.status < 500 ? 'ok' : 'down') as BackendStatus)
    .catch(() => 'down' as BackendStatus)
    .finally(() => clearTimeout(timer));
  return pending;
}

export function resetBackendStatus() {
  pending = null;
}

export function useBackendStatus(): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>(isSupabaseConfigured ? 'checking' : 'unconfigured');
  useEffect(() => {
    let alive = true;
    checkBackend().then((s) => { if (alive) setStatus(s); });
    return () => { alive = false; };
  }, []);
  return status;
}
