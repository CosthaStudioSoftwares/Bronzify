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

// Lógica para notificações em segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log("[sw.js] Mensagem recebida em segundo plano: ", payload);

    const notificationTitle = payload.data.title || "Novo Agendamento";
    const notificationOptions = {
        body: payload.data.body || "Você tem uma nova solicitação no Bronzify.",
        icon: payload.data.icon || "icon-192x192.png",
        data: {
            url: payload.data.click_action || "./clientes.html"
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// --- LÓGICA DE CACHE ATUALIZADA ---
const CACHE_NAME = 'bronzify-cache-v6'; // Incrementei para v6 para forçar atualização
const URLS_TO_CACHE = [
    './',
    './index.html',
    './pedido.html',
    './status-cliente.html',
    './assinatura.html',
    './configuracoes.html',
    './estoque.html',
    './caixa.html',
    './clientes.html',
    './dashboard.html',
    './ordem-chegada.html',
    './patio.html',
    './vendas.html',
    './config.js',
    './layout.js',
    './utils.js',
    './agendar.html' // ADICIONEI o agendar.html ao cache também
];

// Evento de instalação
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Evento de ativação
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

// Evento de fetch
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
