import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './lib/i18n'; // Initialize i18n
import { initAnalytics } from './lib/analytics';
import App from './App.tsx';

// Boot analytics in production
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
