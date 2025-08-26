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
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

// Evento 'install': é disparado quando o Service Worker é instalado.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch': é disparado toda vez que a página faz uma requisição
self.addEventListener('fetch', event => {
  event.respondWith(
    // Procura a requisição no cache primeiro
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna a resposta do cache
        if (response) {
          return response;
        }
        // Se não encontrar, faz a requisição à rede
        return fetch(event.request);
      })
  );
});

// NOVO: Evento 'push' para lidar com notificações
self.addEventListener('push', event => {
    const data = event.data.json(); // Pega os dados enviados (título, corpo, etc.)
    const title = data.title || 'Bronzify';
    const options = {
        body: data.body,
        icon: './apple-touch-icon.png', // Ícone da notificação
        badge: './apple-touch-icon.png', // Ícone menor (Android)
        vibrate: [200, 100, 200], // Padrão de vibração
        sound: './notification-sound.mp3' // Adicione um som de notificação se desejar
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
