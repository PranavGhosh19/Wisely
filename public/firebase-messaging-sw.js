// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDkA149q4bq9MohFJYbyAMok_hF_ezXZsE",
  authDomain: "wisely-93688.firebaseapp.com",
  projectId: "wisely-93688",
  storageBucket: "wisely-93688.firebasestorage.app",
  messagingSenderId: "371802334079",
  appId: "1:371802334079:web:914749f196a7626c20b04a",
  measurementId: "G-5WL2L7KTYQ"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title || 'Wisely Alert';
  const notificationOptions = {
    body: payload.notification.body || 'New activity in your account.',
    icon: '/wallet.png', // Fallback icon
    badge: '/wallet.png',
    tag: 'wisely-notification',
    renotify: true,
    data: payload.data // Pass through custom data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
