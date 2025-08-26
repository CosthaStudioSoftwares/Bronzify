// Define um nome e versão para o cache
const CACHE_NAME = 'bronzify-cache-v2'; // Mudei a versão para forçar a atualização
const DATA_CACHE_NAME = 'bronzify-data-cache-v1';

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
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

// Evento 'install': é disparado quando o Service Worker é instalado.
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


// Evento 'activate': limpa caches antigos
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


// --- LÓGICA DE FETCH CORRIGIDA E MELHORADA ---
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Estratégia "Network First" para as páginas HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se a rede funcionar, clona a resposta, salva no cache e retorna
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Se a rede falhar, busca no cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estratégia "Cache First" para todos os outros recursos (CSS, JS, Imagens, Fontes)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna
        if (response) {
          return response;
        }
        // Se não, busca na rede, salva no cache e retorna
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


// Evento 'push' para lidar com notificações
self.addEventListener('push', event => {
    const data = event.data.json();
    const title = data.title || 'Bronzify';
    const options = {
        body: data.body,
        icon: './apple-touch-icon.png',
        badge: './apple-touch-icon.png',
        vibrate: [200, 100, 200],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
