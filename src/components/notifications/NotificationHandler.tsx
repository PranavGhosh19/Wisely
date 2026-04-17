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
      // Messaging is not supported in all browsers
      const supported = await isSupported();
      if (!supported) {
        console.warn('FCM Push notifications are not supported in this browser.');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging();
          
          // 1. Register the background service worker explicitly
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });

          // 2. Wait for registration to be active
          await navigator.serviceWorker.ready;

          // 3. Request device token using the VAPID key
          const token = await getToken(messaging, {
            vapidKey: 'BPgA6C3oY9eopfHttCljTrm9EgVz6acNkhLBjNWquraG-aDSoPbbEjVu6vnBPGa6e8hNlnOGgoNQMSqrmwPX28U',
            serviceWorkerRegistration: registration
          });

          if (token && auth.currentUser) {
            // Save token to Firestore so we can target this specific device from the server
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(token)
            });
            console.log('FCM Token secured:', token);
          }

          // 4. Handle messages while app is in FOREGROUND
          onMessage(messaging, (payload) => {
            console.log('Foreground message:', payload);
            toast({
              title: payload.notification?.title || 'Wisely',
              description: payload.notification?.body || 'New activity recorded.',
            });
          });
        }
      } catch (error) {
        console.error('Notification setup failed:', error);
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
