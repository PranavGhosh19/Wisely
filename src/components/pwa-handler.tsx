
"use client";

import { useEffect } from 'react';

/**
 * PwaHandler handles the registration of the service worker
 * to satisfy browser PWA installation requirements.
 */
export function PwaHandler() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Wisely PWA: ServiceWorker registered with scope: ', registration.scope);
          },
          (err) => {
            console.log('Wisely PWA: ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
