"use client";

import { useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useStore } from '@/lib/store';

/**
 * AuthSync handles the synchronization between Firebase Authentication state
 * and the application's global Zustand store.
 */
export function AuthSync() {
  const auth = useAuth();
  const db = useFirestore();
  const { setUser, setLoading } = useStore();

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user profile data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          } else {
            // Fallback if doc doesn't exist yet (e.g. during initial sign up)
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              groupIds: [],
            });
          }
        } catch (error) {
          // Logged silently as the AuthSync component is non-visual
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            groupIds: [],
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, setUser, setLoading]);

  return null;
}
