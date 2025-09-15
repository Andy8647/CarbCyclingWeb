// Lightweight analytics bootstrap for Cloudflare Web Analytics + PostHog
import posthog from 'posthog-js';

function initCloudflareWebAnalytics() {
  try {
    if (!import.meta.env.PROD) return;
    const token = import.meta.env.VITE_CF_BEACON_TOKEN as string | undefined;
    if (!token) return;
    if (document.getElementById('cf-beacon')) return;

    const s = document.createElement('script');
    s.id = 'cf-beacon';
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token }));
    document.head.appendChild(s);
  } catch (err) {
    // no-op
  }
}

function initPostHog() {
  try {
    if (!import.meta.env.PROD) return;
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
  } catch (err) {
    // no-op
  }
}

export function initAnalytics() {
  initCloudflareWebAnalytics();
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
