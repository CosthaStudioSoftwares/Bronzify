// Importa os scripts necessários do Firebase (versão compatível com Service Workers)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// SUA CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBgxaY8zFm8wwBzXEB9F4UpBZm4e8dLdEg",
    authDomain: "bronzify-b2491.firebaseapp.com",
    projectId: "bronzify-b2491",
    storageBucket: "bronzify-b2491.appspot.com",
    messagingSenderId: "399230151633",
    appId: "1:399230151633:web:8839c2e384a9301d8ecef0"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// --- LÓGICA MELHORADA PARA NOTIFICAÇÕES EM SEGUNDO PLANO ---
messaging.onBackgroundMessage((payload) => {
  console.log("[sw.js] Mensagem de DADOS recebida em segundo plano: ", payload);

  // --- ALTERAÇÃO PRINCIPAL AQUI ---
  // Lemos os detalhes da notificação a partir de 'payload.data'
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    // Guarda o URL para ser usado quando a notificação for clicada
    data: {
        url: payload.data.click_action
    }
  };

  self.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// --- GESTOR DE EVENTOS PARA O CLIQUE NA NOTIFICAÇÃO (SEM ALTERAÇÕES) ---
self.addEventListener('notificationclick', (event) => {
  console.log('[sw.js] Notificação clicada.');
  
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});


// --- SUA LÓGICA DE CACHE (MANTIDA) ---
const CACHE_NAME = 'bronzify-cache-v2';
const URLS_TO_CACHE = [
  '/', '/index.html', '/ativacao.html', '/caixa.html', '/clientes.html',
  '/dashboard.html', '/ordem-chegada.html', '/patio.html', '/vendas.html',
  '/config.js', '/layout.js', '/utils.js', 'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
