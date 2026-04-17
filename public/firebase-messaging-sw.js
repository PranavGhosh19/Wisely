// 🔥 Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// 🔥 Initialize Firebase (same config as frontend)
firebase.initializeApp({
  apiKey: "AIzaSyDkA149q4bq9MohFJYbyAMok_hF_ezXZsE",
  authDomain: "wisely-93688.firebaseapp.com",
  projectId: "wisely-93688",
  storageBucket: "wisely-93688.firebasestorage.app",
  messagingSenderId: "371802334079",
  appId: "1:371802334079:web:914749f196a7626c20b04a",
  measurementId: "G-5WL2L7KTYQ"
});

// 🔥 Get messaging instance
const messaging = firebase.messaging();

// 🔔 Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message:", payload);

  const notificationTitle =
    payload.notification?.title || "Wisely Alert";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "New activity in your account.",
    icon: "/wallet.png",
    badge: "/wallet.png",
    tag: "wisely-notification",
    renotify: true,
    data: payload.data || {},
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// 🔗 Handle notification click (VERY important)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = "/dashboard"; // Change later to dynamic path if needed

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
