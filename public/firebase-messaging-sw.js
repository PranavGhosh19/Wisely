// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// These values match your project's Firebase configuration.
firebase.initializeApp({
  apiKey: "AIzaSyDkA149q4bq9MohFJYbyAMok_hF_ezXZsE",
  authDomain: "wisely-93688.firebaseapp.com",
  projectId: "wisely-93688",
  storageBucket: "wisely-93688.firebasestorage.app",
  messagingSenderId: "371802334079",
  appId: "1:371802334079:web:914749f196a7626c20b04a",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

/**
 * Handles messages received while the app is in the background.
 * This is what allows notifications to appear when the app is closed.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Wisely Activity';
  const notificationOptions = {
    body: payload.notification?.body || 'New update in your Wisely vault.',
    icon: 'https://placehold.co/192x192/3D737F/FFFFFF?text=W',
    badge: 'https://placehold.co/192x192/3D737F/FFFFFF?text=W',
    tag: 'wisely-update',
    vibrate: [200, 100, 200]
  };

  // self.registration is the reference to this Service Worker's registration
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
