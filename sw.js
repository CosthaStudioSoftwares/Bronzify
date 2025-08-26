// Define um nome e versão para o cache
const CACHE_NAME = 'bronzify-cache-v1';

// Lista de arquivos essenciais para o funcionamento offline do app
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
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// NOVO: Lógica para responder ao clique na notificação
self.addEventListener('notificationclick', event => {
  const saleId = event.notification.data.saleId;
  const urlToOpen = new URL('/patio.html', self.location.origin).href;

  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Se a janela do pátio já estiver aberta, foca nela e envia a mensagem
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NOTIFICATION_CLICK', saleId: saleId });
            return;
          }
        }
        // Se não, abre uma nova janela
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen).then(client => {
              // Espera a janela estar pronta para enviar a mensagem
              // Isso é um fallback, a lógica principal estará na página
          });
        }
      })
  );
});
