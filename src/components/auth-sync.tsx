"use client";

import { useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useStore } from '@/lib/store';

/**
 * AuthSync handles the synchronization between Firebase Authentication state,
 * Firestore user profile data, and the application's global Zustand store.
 * Uses real-time listeners for the user document to ensure the UI updates instantly
 * when the user joins or creates groups.
 */
export function AuthSync() {
  const auth = useAuth();
  const db = useFirestore();
  const { setUser, setLoading } = useStore();

  useEffect(() => {
    if (!auth || !db) return;

    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Clean up previous listener if it exists
        if (unsubscribeDoc) unsubscribeDoc();

        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        // Listen to user document for real-time profile updates (e.g. when groupIds or categories change)
        unsubscribeDoc = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          } else {
            // Fallback for initial sync if doc doesn't exist yet
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              groupIds: [],
            });
          }
          setLoading(false);
        }, (error) => {
          // Silent failure for listener, fallback to basic auth info
          console.error("AuthSync: Error listening to user doc", error);
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            groupIds: [],
          });
          setLoading(false);
        });
      } else {
        // User logged out
        if (unsubscribeDoc) unsubscribeDoc();
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [auth, db, setUser, setLoading]);

  return null;
}
