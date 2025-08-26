// Define um nome e versão para o cache
const CACHE_NAME = 'bronzify-cache-v3'; // Versão incrementada para forçar a atualização

// Lista de arquivos essenciais para o funcionamento offline do app
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'ativacao.html',
  'caixa.html',
  'clientes.html',
  'dashboard.html',
  'ordem-chegada.html',
  'patio.html',
  'vendas.html',
  'config.js',
  'layout.js',
  'utils.js',
  'manifest.json',
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'frente.png',
  'costas.png',
  'lado_esquerdo.png',
  'lado_direito.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto');
        // Adiciona URLs uma a uma para evitar que uma falha quebre todo o cache
        return Promise.all(
            URLS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`Falha ao cachear ${url}`, err)))
        );
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Ignora requisições para o Firestore para não interferir com o modo offline dele
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// Lógica para responder ao clique na notificação
self.addEventListener('notificationclick', event => {
  const saleId = event.notification.data.saleId;
  const urlToOpen = new URL('patio.html', self.location.origin).href;

  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname === '/patio.html' && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NOTIFICATION_CLICK', saleId: saleId });
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen).then(client => {
              if (client) {
                 // A página tratará de mostrar o modal ao receber o foco.
              }
          });
        }
      })
  );
});
