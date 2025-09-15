// Lightweight analytics bootstrap for PostHog
import posthog from 'posthog-js';

function initPostHog() {
  try {
    const enableDev = (import.meta.env.VITE_POSTHOG_ENABLE_DEV as string | undefined) === 'true';
    if (!(import.meta.env.PROD || enableDev)) return;
    const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
    if (!key) return;
    const host =
      (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ||
      'https://app.posthog.com';

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      autocapture: true,
      persistence: 'localStorage',
      respect_dnt: true,
    });
    if (enableDev) {
      // Helpful logs in dev
      try { posthog.debug(true); } catch {}
    }
  } catch (err) {
    // no-op
  }
}

export function initAnalytics() {
  initPostHog();
}

export function track(event: string, properties?: Record<string, any>) {
  try {
    posthog.capture(event, properties);
  } catch {
    // no-op
  }
}

export function identify(id: string, properties?: Record<string, any>) {
  try {
    posthog.identify(id, properties);
  } catch {}
}

export function resetIdentity() {
  try {
    posthog.reset();
  } catch {}
}
