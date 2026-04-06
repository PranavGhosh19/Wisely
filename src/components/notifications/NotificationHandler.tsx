
'use client';

import { useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

/**
 * NotificationHandler manages the lifecycle of FCM push notifications.
 * It handles permission requests, token generation, token storage in Firestore,
 * and foreground message listening.
 */
export function NotificationHandler() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth || !db) return;

    const setupMessaging = async () => {
      // Messaging is not supported in all browsers (e.g., Safari requires specific conditions)
      const supported = await isSupported();
      if (!supported) {
        console.warn('FCM Push notifications are not supported in this browser.');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging();
          
          // Request device token
          const token = await getToken(messaging, {
            vapidKey: 'BPgA6C3oY9eopfHttCljTrm9EgVz6acNkhLBjNWquraG-aDSoPbbEjVu6vnBPGa6e8hNlnOGgoNQMSqrmwPX28U'
          });

          if (token && auth.currentUser) {
            // Save the device token to user profile for server-side targeting
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(token)
            });
          }

          // Handle incoming messages when the app is in the foreground
          onMessage(messaging, (payload) => {
            toast({
              title: payload.notification?.title || 'Activity Alert',
              description: payload.notification?.body || 'New activity recorded.',
            });
          });
        }
      } catch (error) {
        console.error('NotificationHandler: Setup failed', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setupMessaging();
      }
    });

    return () => unsubscribe();
  }, [auth, db, toast]);

  return null;
}
