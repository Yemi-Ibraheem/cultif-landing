import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import App from './App.tsx'
import './index.css'

function getConvexUrl(): string {
  const configured = (import.meta.env.VITE_CONVEX_URL as string | undefined)?.trim().replace(/\/$/, '');
  
  // Requirement: WebSocket must connect to *.convex.cloud (Convex built-in host)
  const isValidConvexUrl = configured && /^https:\/\/.+\.convex\.cloud$/i.test(configured);
  
  // Handle misconfiguration where SITE_URL (frontend domain) is used for Convex Client
  if (configured && (configured.includes('cultif.com') || configured.includes('vercel.app'))) {
    console.error(
      '[convex] Fatal: VITE_CONVEX_URL is set to a frontend domain instead of a Convex domain.',
      { configured }
    );
    // Explicitly return an invalid value to halt Convex initialization
    return '';
  }

  if (import.meta.env.PROD) {
    if (!isValidConvexUrl) {
      console.error(
        '[convex] Fatal: VITE_CONVEX_URL is missing or invalid in production build. ' +
        'Expected a *.convex.cloud domain.'
      );
      // Fail loudly in production
      return '';
    }
    return configured;
  }

  // Development Fallback: allow the hardcoded project deployment for local dev convenience
  // only if the environment variable is missing.
  if (!isValidConvexUrl) {
    if (configured) {
       console.warn(`[convex] Warning: "${configured}" is not a valid *.convex.cloud URL. Using development fallback.`);
    }
    return 'https://hidden-armadillo-69.eu-west-1.convex.cloud';
  }
  
  return configured;
}


const convex = new ConvexReactClient(getConvexUrl());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
)
