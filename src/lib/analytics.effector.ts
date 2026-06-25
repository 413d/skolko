/**
 * Effector ↔ Analytics bridge.
 *
 * Provides analyticsTrackFx effect and bindAnalytics helper
 * for wiring domain events to analytics calls.
 */

import { createEffect, sample, type Event } from 'effector';
import { trackEvent } from './analytics';

type TrackPayload = {
  name: string;
  data?: Record<string, unknown>;
}

/**
 * Effector effect wrapping trackEvent.
 * Use analyticsTrackFx.fail to handle errors — analytics must never crash the app.
 */
export const analyticsTrackFx = createEffect(
  ({ name, data }: TrackPayload): void => {
    trackEvent(name, data);
  },
);

/**
 * Binds an Effector event/effect unit to an analytics event name.
 *
 * @example
 * bindAnalytics(userSignedUpFx.done, "signup_completed");
 * bindAnalytics(planUpgradedEvt, "plan_upgraded", ({ from, to }) => ({ from_plan: from, to_plan: to }));
 */
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
