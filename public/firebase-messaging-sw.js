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
  console.log("[SW] Background message received:", payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};
  
  // 🧠 SMART LOGIC: Grouping & Anti-Spam
  // Using a tag based on groupId allows the OS to replace old notifications 
  // from the same group with the latest update, avoiding notification fatigue.
  const notificationTag = data.groupId ? `wisely-group-${data.groupId}` : "wisely-general";

  const notificationOptions = {
    body: body || "New activity in your account.",
    icon: "/wallet.png",
    badge: "/wallet.png",
    tag: notificationTag, 
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      ...data,
      targetUrl: data.targetUrl || "/dashboard"
    }
  };

  self.registration.showNotification(
    title || "Wisely Alert",
    notificationOptions
  );
});

// 🔗 Handle notification click (DEEP LINKING)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl = data.targetUrl || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 1. Try to find a tab that is already open at the target URL
        for (const client of clientList) {
          const url = new URL(client.url);
          if (url.pathname === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        
        // 2. If no target tab, find a dashboard tab and navigate it
        for (const client of clientList) {
          if (client.url.includes("/dashboard") && "focus" in client) {
            return client.navigate(targetUrl).then(c => c.focus());
          }
        }

        // 3. Otherwise open a fresh window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});