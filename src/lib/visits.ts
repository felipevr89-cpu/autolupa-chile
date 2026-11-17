import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { hasConsent } from './consent';

export const SITE_VISITS_MIN_DISPLAY = 500;

const SITE_VISIT_KEY = 'autolupa_site_visit';
const LISTING_VIEW_PREFIX = 'autolupa_listing_view_';

let siteVisitsPromise: Promise<number | null> | null = null;

function sessionFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === '1';
  } catch {
    return true;
  }
}

function setSessionFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, '1');
  } catch {
    return;
  }
}

export async function registerSiteVisit(): Promise<void> {
  if (!supabase || !hasConsent('analytics') || sessionFlag(SITE_VISIT_KEY)) return;
  setSessionFlag(SITE_VISIT_KEY);
  try {
    await supabase.rpc('register_site_visit');
  } catch {
    return;
  }
}

export function getSiteVisits(): Promise<number | null> {
  if (!supabase) return Promise.resolve(null);
  if (!siteVisitsPromise) {
    const client = supabase;
    siteVisitsPromise = (async () => {
      try {
        const { data, error } = await client.rpc('site_visits_last_30_days');
        return error || typeof data !== 'number' ? null : data;
      } catch {
        return null;
      }
    })();
  }
  return siteVisitsPromise;
}

export function resetSiteVisitsCache() {
  siteVisitsPromise = null;
}

export async function getListingViews(listingIds: string[]): Promise<Record<string, number>> {
  if (!supabase || listingIds.length === 0) return {};
  try {
    const { data, error } = await supabase.rpc('get_listing_views', { p_listing_ids: listingIds });
    if (error || !Array.isArray(data)) return {};
    return Object.fromEntries((data as { listing_id: string; views: number }[]).map((row) => [row.listing_id, row.views]));
  } catch {
    return {};
  }
}

export async function trackListingView(listingId: string): Promise<number | null> {
  if (!supabase) return null;
  const key = `${LISTING_VIEW_PREFIX}${listingId}`;
  if (hasConsent('analytics') && !sessionFlag(key)) {
    setSessionFlag(key);
    try {
      const { data, error } = await supabase.rpc('register_listing_view', { p_listing_id: listingId });
      if (!error && typeof data === 'number') return data;
    } catch {
      return null;
    }
  }
  const views = await getListingViews([listingId]);
  return views[listingId] ?? null;
}

export function useSiteVisits(): number | null {
  const [visits, setVisits] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    getSiteVisits().then((value) => { if (alive) setVisits(value); });
    return () => { alive = false; };
  }, []);
  return visits;
}
