import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './lib/i18n'; // Initialize i18n
import { PostHogProvider } from 'posthog-js/react';
import App from './App.tsx';
import { applyEnvSEO } from './lib/seo-runtime';

// PostHog env configuration (supports both VITE_PUBLIC_* and VITE_* keys)
const PH_KEY =
  (import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined) ||
  (import.meta.env.VITE_POSTHOG_KEY as string | undefined);
const PH_HOST =
  (import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined) ||
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ||
  'https://app.posthog.com';
const ENABLE_DEV =
  (import.meta.env.VITE_POSTHOG_ENABLE_DEV as string | undefined) === 'true';
const SHOULD_INIT = !!PH_KEY && (import.meta.env.PROD || ENABLE_DEV);

// Apply SEO meta from env before app renders
applyEnvSEO();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {SHOULD_INIT ? (
      <PostHogProvider
        apiKey={PH_KEY!}
        options={{
          api_host: PH_HOST,
          defaults: '2025-05-24',
        }}
      >
        <App />
      </PostHogProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
