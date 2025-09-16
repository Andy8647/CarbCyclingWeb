import { Helmet } from 'react-helmet-async';

const SITE_NAME =
  (import.meta.env.VITE_SITE_NAME as string | undefined) ||
  'Carb Cycling Planner';
const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || '';
const DESCRIPTION =
  (import.meta.env.VITE_META_DESCRIPTION as string | undefined) ||
  'Open-source carb cycling planner that generates a personalized weekly macro plan with drag-and-drop, CSV/Markdown export, and PNG sharing. No login required.';
const OG_IMAGE = (import.meta.env.VITE_OG_IMAGE as string | undefined) || '/og.png';
const TWITTER_HANDLE = import.meta.env.VITE_TWITTER_HANDLE as string | undefined;

export function DefaultSEO() {
  // Compute URL on client if env not provided
  const url =
    SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <Helmet prioritizeSeoTags>
      <title>{SITE_NAME}</title>
      <meta name="description" content={DESCRIPTION} />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={SITE_NAME} />
      <meta property="og:description" content={DESCRIPTION} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={OG_IMAGE} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SITE_NAME} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}

      {/* Misc */}
      <meta name="theme-color" content="#0ea5e9" />
    </Helmet>
  );
}

