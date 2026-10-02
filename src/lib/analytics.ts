type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: PlausibleProps }) => void;
  }
}

export function track(event: string, props?: PlausibleProps) {
  try {
    window.plausible?.(event, props ? { props } : undefined);
  } catch {
    return;
  }
}
