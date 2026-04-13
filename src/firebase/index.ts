'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

/**
 * Initializes Firebase with a standard pattern that works across 
 * various deployment environments including Vercel and local development.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  // Enable offline persistence for Firestore
  if (typeof window !== 'undefined') {
    enableMultiTabIndexedDbPersistence(firestore, {
      forceOwnership: false
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence: Multiple tabs open, persistence limited to one tab.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence: Browser not supported.");
      }
    });
  }

  return {
    firebaseApp,
    auth,
    firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
