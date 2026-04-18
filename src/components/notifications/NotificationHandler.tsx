
'use client';

import { useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';

/**
 * NotificationHandler manages the lifecycle of FCM push notifications.
 * It handles permission requests, token generation, token storage in Firestore,
 * and foreground message listening.
 */
export function NotificationHandler() {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const { user } = useStore();

  useEffect(() => {
    if (!auth || !db) return;

    // Check if the user has disabled notifications via settings
    // Default to true if the property doesn't exist yet
    const isMasterEnabled = user?.notificationSettings?.masterEnabled ?? true;

    if (!isMasterEnabled) {
      console.log('NotificationHandler: Master switch is OFF. Skipping setup.');
      return;
    }

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
          // Make sure this file exists in /public/firebase-messaging-sw.js
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });

          // 2. Wait for registration to be active
          await navigator.serviceWorker.ready;

          // 3. Request device token using the VAPID key
          // This token is unique to this device/browser
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

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setupMessaging();
      }
    });

    return () => unsubscribe();
  }, [auth, db, toast, user?.notificationSettings?.masterEnabled]);

  return null;
}
