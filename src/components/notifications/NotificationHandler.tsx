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
          
          // Register service worker explicitly for background messaging
          // The file /firebase-messaging-sw.js must exist in the public directory
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });

          // Request device token
          const token = await getToken(messaging, {
            vapidKey: 'BPgA6C3oY9eopfHttCljTrm9EgVz6acNkhLBjNWquraG-aDSoPbbEjVu6vnBPGa6e8hNlnOGgoNQMSqrmwPX28U',
            serviceWorkerRegistration: registration
          });

          if (token && auth.currentUser) {
            // Save the device token to user profile for server-side targeting
            // This is how the server knows where to send push notifications for this user
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              fcmTokens: arrayUnion(token)
            });
            console.log('FCM Token generated and saved:', token);
          }

          // Handle incoming messages when the app is in the foreground
          onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            toast({
              title: payload.notification?.title || 'Wisely Alert',
              description: payload.notification?.body || 'New activity recorded.',
            });
          });
        } else {
          console.warn('Notification permission denied by user.');
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
