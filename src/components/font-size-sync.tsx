
'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * FontSizeSync monitors the fontSize in the Zustand store 
 * and applies it to the document element's style.
 */
export function FontSizeSync() {
  const { fontSize } = useStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = fontSize;
    }
  }, [fontSize]);

  return null;
}
