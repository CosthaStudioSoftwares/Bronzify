// Define um nome e versão para o cache
const CACHE_NAME = 'bronzify-cache-v2'; // Versão incrementada para forçar a atualização

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
  'lado_direito.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

// Evento 'install': é disparado quando o Service Worker é instalado.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Evento 'activate': Limpa caches antigos
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
});

// Evento 'fetch': responde com o cache se disponível
self.addEventListener('fetch', event => {
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
        // Se a janela do pátio já estiver aberta, foca nela e envia a mensagem
        for (const client of clientList) {
          if (new URL(client.url).pathname === '/patio.html' && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NOTIFICATION_CLICK', saleId: saleId });
            return;
          }
        }
        // Se não, abre uma nova janela
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen).then(client => {
              if (client) {
                // A página patio.html tem uma lógica para solicitar o modal ao carregar,
                // mas podemos enviar a mensagem para garantir.
                // A melhor abordagem é a página, ao carregar, verificar se precisa abrir um modal.
              }
          });
        }
      })
  );
});

// Ouve mensagens da página para mostrar notificações
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
