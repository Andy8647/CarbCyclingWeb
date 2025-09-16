function setMeta(name: string, content: string) {
  if (!content) return;
  const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
  const selector = isProperty
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function absoluteUrl(url: string, base: string) {
  if (!url) return '';
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

export function applyEnvSEO() {
  const SITE_NAME =
    (import.meta.env.VITE_SITE_NAME as string | undefined) ||
    'Carb Cycling Planner';
  const DESCRIPTION =
    (import.meta.env.VITE_META_DESCRIPTION as string | undefined) ||
    'Open-source carb cycling planner that generates a personalized weekly macro plan with drag-and-drop, CSV/Markdown export, and PNG sharing. No login required.';
  const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || '';
  const OG_IMAGE = (import.meta.env.VITE_OG_IMAGE as string | undefined) || '/og.png';
  const TWITTER_HANDLE = import.meta.env
    .VITE_TWITTER_HANDLE as string | undefined;

  const origin = SITE_URL || window.location.origin;
  const pageUrl = `${origin}${window.location.pathname}`;
  const imageUrl = absoluteUrl(OG_IMAGE, origin);

  // Document
  document.title = SITE_NAME;

  // Canonical
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', pageUrl);

  // Standard
  setMeta('description', DESCRIPTION);
  setMeta('theme-color', '#0ea5e9');

  // Open Graph
  setMeta('og:type', 'website');
  setMeta('og:site_name', SITE_NAME);
  setMeta('og:title', SITE_NAME);
  setMeta('og:description', DESCRIPTION);
  setMeta('og:url', pageUrl);
  setMeta('og:image', imageUrl);

  // Twitter
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', SITE_NAME);
  setMeta('twitter:description', DESCRIPTION);
  setMeta('twitter:image', imageUrl);
  if (TWITTER_HANDLE) setMeta('twitter:site', TWITTER_HANDLE);
}

