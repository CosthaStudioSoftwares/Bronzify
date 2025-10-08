// Arquivo: layout.js
// Este script insere o menu lateral (sidebar) e o menu mobile em todas as páginas,
// lendo as permissões do usuário para construir o menu dinamicamente.

import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    if (!body) return;

    // Pega o nome do arquivo atual para saber qual link do menu marcar como "ativo"
    const currentPage = window.location.pathname.split('/').pop();

    // --- LÓGICA DE PERMISSÕES (NOVO) ---
    const permissions = JSON.parse(sessionStorage.getItem('userPermissions')) || {};
    const businessId = sessionStorage.getItem('businessId');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    // O usuário é admin se o ID dele for o mesmo ID da empresa salvo na sessão.
    const isAdmin = currentUser ? currentUser.uid === businessId : false;

    // --- GERADOR DE LINKS DINÂMICOS (NOVO) ---
    const menuLinks = [
        { href: './dashboard.html', icon: 'layout-dashboard', text: 'Dashboard', id: 'dashboard' },
        { href: './configuracoes.html', icon: 'settings', text: 'Configurações', id: 'configuracoes' },
        { href: './estoque.html', icon: 'archive', text: 'Estoque', id: 'estoque' },
        { href: './vendas.html', icon: 'shopping-cart', text: 'Vendas', id: 'vendas' },
        { href: './clientes.html', icon: 'users', text: 'Clientes', id: 'clientes' },
        { href: './caixa.html', icon: 'dollar-sign', text: 'Caixa', id: 'caixa' },
        { href: './ordem-chegada.html', icon: 'list-ordered', text: 'Ordem de Chegada', id: 'ordem-chegada' },
        { href: './patio.html', icon: 'sun', text: 'Pátio', id: 'patio' }
    ];

    let navLinksHTML = '';
    menuLinks.forEach(link => {
        // Um link é mostrado se: 
        // 1. O usuário é o admin (isAdmin é true)
        // 2. Ou a permissão para aquele link não está explicitamente definida como 'false'
        if (isAdmin || permissions[link.id] !== false) {
            navLinksHTML += `<a href="${link.href}" class="sidebar-link ${currentPage === link.href.split('/').pop() ? 'active' : ''}"><i data-lucide="${link.icon}"></i> ${link.text}</a>`;
        }
    });

    // --- HTML FINAL DO MENU (COM OS LINKS DINÂMICOS) ---
    const sidebarHTML = `
        <aside class="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:flex flex-col">
            <div class="p-6">
                <h1 class="text-3xl text-center text-[#B76E79]">Bronzify</h1>
            </div>
            <nav class="mt-6 px-4 flex-1">${navLinksHTML}</nav>
            <div class="p-4">
                <button id="logout-btn-desktop" class="w-full flex items-center justify-center gap-2 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors duration-300"><i data-lucide="log-out"></i> Sair</button>
            </div>
        </aside>

        <div id="mobile-sidebar" class="fixed inset-0 z-50 flex lg:hidden sidebar-mobile">
            <aside class="w-64 bg-white shadow-lg flex-shrink-0 flex flex-col">
                <div class="p-6 flex justify-between items-center">
                    <h1 class="text-3xl text-center text-[#B76E79]">Bronzify</h1>
                    <button id="close-menu-btn" class="p-1"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
               <nav class="mt-6 px-4 flex-1">${navLinksHTML}</nav>
                <div class="p-4">
                    <button id="logout-btn-mobile" class="w-full flex items-center justify-center gap-2 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors duration-300">
                        <i data-lucide="log-out"></i> Sair
                    </button>
                </div>
            </aside>
            <div id="mobile-sidebar-overlay" class="flex-1 bg-black bg-opacity-50"></div>
        </div>
    `;

    // Insere o HTML do menu no início do container principal
    const mainContainer = document.querySelector('.flex.h-screen');
    if (mainContainer) {
        mainContainer.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    // --- LÓGICA DO MENU MOBILE (sem alterações) ---
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

    function openSidebar() { if(mobileSidebar) mobileSidebar.classList.add('open'); }
    function closeSidebar() { if(mobileSidebar) mobileSidebar.classList.remove('open'); }

    if(openMenuBtn) openMenuBtn.addEventListener('click', openSidebar);
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebar);
    if(mobileSidebarOverlay) mobileSidebarOverlay.addEventListener('click', closeSidebar);

    // --- LÓGICA DE LOGOUT (sem alterações) ---
    const logoutDesktop = document.getElementById('logout-btn-desktop');
    const logoutMobile = document.getElementById('logout-btn-mobile');
    
    const handleLogout = () => {
        // Limpa a sessão para garantir que o businessId seja removido
        sessionStorage.clear();
        signOut(auth).then(() => {
            window.location.href = './index.html';
        }).catch(error => {
            console.error("Erro ao fazer logout:", error);
        });
    };

    if(logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
    if(logoutMobile) logoutMobile.addEventListener('click', handleLogout);

    // Renderiza os ícones após inserir o HTML
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

