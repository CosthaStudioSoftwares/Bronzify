// Define um nome e versão para o cache
const CACHE_NAME = 'bronzify-cache-v4'; // Versão incrementada para forçar a atualização

// Lista de arquivos essenciais
const URLS_TO_CACHE = [
  '/', 'index.html', 'ativacao.html', 'caixa.html', 'clientes.html', 'dashboard.html',
  'ordem-chegada.html', 'patio.html', 'vendas.html', 'config.js', 'layout.js', 'utils.js',
  'manifest.json', 'icon-192x192.png', 'icon-512x512.png', 'apple-touch-icon.png',
  'frente.png', 'costas.png', 'lado_esquerdo.png', 'lado_direito.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Cache aberto');
      return cache.addAll(URLS_TO_CACHE).catch(err => console.error("Falha ao adicionar arquivos ao cache", err));
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
  if (event.request.url.includes('firestore.googleapis.com')) { return; }
  event.respondWith( caches.match(event.request).then(response => response || fetch(event.request)) );
});

// Lógica para responder ao clique na notificação
self.addEventListener('notificationclick', event => {
  const saleId = event.notification.data.saleId;
  const urlToOpen = new URL('patio.html', self.location.origin).href;

  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (new URL(client.url).pathname === '/patio.html' && 'focus' in client) {
          client.focus();
          // Envia o saleId para a página já aberta
          return client.postMessage({ type: 'NOTIFICATION_CLICK', saleId: saleId });
        }
      }
      if (self.clients.openWindow) {
        // Se a página não estiver aberta, abre uma nova
        return self.clients.openWindow(urlToOpen).then(client => {
          // A página, ao carregar, pode verificar se precisa mostrar um modal
        });
      }
    })
  );
});
