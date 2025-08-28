importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBgxaY8zFm8wwBzXEB9F4UpBZm4e8dLdEg",
  authDomain: "bronzify-b2491.firebaseapp.com",
  projectId: "bronzify-b2491",
  storageBucket: "bronzify-b2491.appspot.com",
  messagingSenderId: "399230151633",
  appId: "1:399230151633:web:8839c2e384a9301d8ecef0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Mensagem em segundo plano:', payload);
  const title = payload.notification?.title || "É a sua vez!";
  const options = {
    body: payload.notification?.body || "Dirija-se à receção",
    icon: "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
    vibrate: [200,100,200],
    sound: "/notification.mp3",
    requireInteraction: true
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
