import { createEffect, sample, type Event } from 'effector';

type UmamiTracker = {
  track(eventName: string, data?: Record<string, unknown>): void;
  identify(data: Record<string, unknown>): void;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- global augmentation requires interface
  interface Window {
    umami?: UmamiTracker;
  }
}

const UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js';

const SITE_ID = import.meta.env.VITE_UMAMI_SITE_ID;

const isScriptAlreadyInjected = () => Boolean(document.querySelector(`script[data-website-id="${SITE_ID ?? ''}"]`));

export const initAnalytics = (): void => {
  if (!SITE_ID || isScriptAlreadyInjected()) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.dataset.websiteId = SITE_ID;

  document.head.appendChild(script);
};

export const trackEvent: UmamiTracker['track'] = (eventName, data) => {
  if (!SITE_ID || !window.umami) return;
  window.umami.track(eventName, data);
};

/**
 * Identifies a user session with custom properties.
 * Does NOT send PII — pass only opaque IDs or plan types.
 */
export const identifySession: UmamiTracker['identify'] = (data) => {
  if (!SITE_ID || !window.umami) return;
  window.umami.identify(data);
};

type TrackPayload = {
  name: string;
  data?: Record<string, unknown>;
};

export const analyticsTrackFx = createEffect(
  ({ name, data }: TrackPayload): void => {
    trackEvent(name, data);
  },
);

export function bindAnalytics<T>(
  clock: Event<T>,
  name: string,
  mapFn?: (payload: T) => Record<string, unknown>,
): void {
  sample({
    clock,
    fn: (payload): TrackPayload => ({
      name,
      data: mapFn ? mapFn(payload) : undefined,
    }),
    target: analyticsTrackFx,
  });
}
