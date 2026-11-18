export interface ConsentChoice {
  analytics: boolean;
  ads: boolean;
}

export interface ConsentState extends ConsentChoice {
  version: number;
  decidedAt: string;
}

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = 'autolupa_consent';
export const CONSENT_CHANGE_EVENT = 'autolupa:consent-change';
export const CONSENT_OPEN_EVENT = 'autolupa:consent-open';

export function readConsent(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION || typeof parsed.analytics !== 'boolean' || typeof parsed.ads !== 'boolean') return null;
    return parsed as ConsentState;
  } catch {
    return null;
  }
}

function applyAnalyticsChoice(analytics: boolean) {
  try {
    if (analytics) window.localStorage.removeItem('plausible_ignore');
    else window.localStorage.setItem('plausible_ignore', 'true');
  } catch {
    return;
  }
}

export function saveConsent(choice: ConsentChoice): ConsentState {
  const state: ConsentState = { ...choice, version: CONSENT_VERSION, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    void 0;
  }
  applyAnalyticsChoice(choice.analytics);
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }));
  return state;
}

export function hasConsent(category: keyof ConsentChoice): boolean {
  const state = readConsent();
  if (category === 'analytics') return state ? state.analytics : true;
  return state ? state.ads : false;
}

export function openConsentPreferences() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
