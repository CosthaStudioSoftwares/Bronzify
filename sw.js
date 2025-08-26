// service-worker.js

// Define um nome e versão para o cache (incremente a versão para forçar a atualização)
const CACHE_NAME = 'bronzify-cache-v2';

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
  '/frente.png', // Adicione as imagens que você usa
  '/costas.png',
  '/lado_esquerdo.png',
  '/lado_direito.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap'
];

// Evento 'install': guarda os arquivos essenciais em cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto e arquivos salvos.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'activate': limpa caches antigos para evitar conflitos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});


// Evento 'fetch': responde com o cache primeiro (offline-first).
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

// --- NOVA FUNCIONALIDADE: NOTIFICAÇÕES ---

// 1. Escuta mensagens vindas da página (patio.html)
self.addEventListener('message', event => {
  const data = event.data;

  if (data.command === 'scheduleNotification') {
    const { clientName, delay, saleId } = data;
    console.log(`Service Worker: Notificação para ${clientName} agendada em ${delay / 1000} segundos.`);
    
    setTimeout(() => {
      self.registration.showNotification('Bronzify - Posição Concluída!', {
        body: `O tempo da cliente ${clientName} acabou. É hora de trocar a posição!`,
        icon: '/apple-touch-icon.png', // Use um ícone do seu app
        badge: '/apple-touch-icon.png', // Ícone para a barra de status (Android)
        vibrate: [200, 100, 200], // Padrão de vibração
        tag: `timer-end-${saleId}`, // Agrupa notificações para o mesmo cliente
        data: {
            url: `/patio.html?saleId=${saleId}` // URL para abrir ao clicar
        }
      });
    }, delay);
  }
});

// 2. Define o que acontece quando o usuário clica na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close(); // Fecha a notificação

  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Se a janela do Pátio já estiver aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes('/patio.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
