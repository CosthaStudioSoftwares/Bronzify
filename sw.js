// Importa os scripts necessários do Firebase.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// SUA CONFIGURAÇÃO DO FIREBASE (a mesma do config.js)
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

// LÓGICA DO FIREBASE MESSAGING PARA NOTIFICAÇÕES EM SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log("[sw.js] Mensagem recebida em segundo plano: ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/apple-touch-icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// --- SUA LÓGICA DE CACHE (MANTIDA EXATAMENTE COMO ESTAVA) ---

const CACHE_NAME = 'bronzify-cache-v2';
const DATA_CACHE_NAME = 'bronzify-data-cache-v1';

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/ativacao.html',
  '/caixa.html',
  '/clientes.html',
  '/dashboard.html',
  '/ordem-chegada.html',
  '/patio.html',
  '/vendas.html',
  '/config.js',
  '/layout.js',
  '/utils.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache de estáticos aberto e populado');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
  );
});
