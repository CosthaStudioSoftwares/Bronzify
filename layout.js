// Arquivo: layout.js
// Este script insere o menu lateral (sidebar) e o menu mobile em todas as páginas,
// evitando a repetição de código HTML.

// Importa a função de logout do Firebase Auth para que os botões de "Sair" funcionem.
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body');
    if (!body) return;

    // Pega o nome do arquivo atual para saber qual link do menu marcar como "ativo"
    const currentPage = window.location.pathname.split('/').pop();

    const sidebarHTML = `
        <aside class="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:flex flex-col">
            <div class="p-6">
                <h1 class="text-3xl text-center text-[#B76E79]">Bronzify</h1>
            </div>
            <nav class="mt-6 px-4 flex-1">
                <a href="./dashboard.html" class="sidebar-link ${currentPage === 'dashboard.html' ? 'active' : ''}"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                <a href="./configuracoes.html" class="sidebar-link ${currentPage === 'configuracoes.html' ? 'active' : ''}"><i data-lucide="settings"></i> Configurações</a>
                <a href="./estoque.html" class="sidebar-link ${currentPage === 'estoque.html' ? 'active' : ''}"><i data-lucide="archive"></i> Estoque</a>
                <a href="./vendas.html" class="sidebar-link ${currentPage === 'vendas.html' ? 'active' : ''}"><i data-lucide="shopping-cart"></i> Vendas</a>
                <a href="./clientes.html" class="sidebar-link ${currentPage === 'clientes.html' ? 'active' : ''}"><i data-lucide="users"></i> Clientes</a>
                <a href="./caixa.html" class="sidebar-link ${currentPage === 'caixa.html' ? 'active' : ''}"><i data-lucide="dollar-sign"></i> Caixa</a>
                <a href="./ordem-chegada.html" class="sidebar-link ${currentPage === 'ordem-chegada.html' ? 'active' : ''}"><i data-lucide="list-ordered"></i> Ordem de Chegada</a>
                <a href="./patio.html" class="sidebar-link ${currentPage === 'patio.html' ? 'active' : ''}"><i data-lucide="sun"></i> Pátio</a>
            </nav>
            <div class="p-4">
                 <button id="logout-btn-desktop" class="w-full flex items-center justify-center gap-2 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors duration-300"><i data-lucide="log-out"></i> Sair</button>
            </div>
        </aside>

        <div id="mobile-sidebar" class="fixed inset-0 z-40 flex lg:hidden sidebar-mobile">
            <aside class="w-64 bg-white shadow-lg flex-shrink-0 flex flex-col">
                <div class="p-6 flex justify-between items-center">
                    <h1 class="text-3xl text-center text-[#B76E79]">Bronzify</h1>
                    <button id="close-menu-btn" class="p-1">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
               <nav class="mt-6 px-4 flex-1">
                    <a href="./dashboard.html" class="sidebar-link ${currentPage === 'dashboard.html' ? 'active' : ''}"><i data-lucide="layout-dashboard"></i> Dashboard</a>
                    <a href="./configuracoes.html" class="sidebar-link ${currentPage === 'configuracoes.html' ? 'active' : ''}"><i data-lucide="settings"></i> Configurações</a>
                    <a href="./estoque.html" class="sidebar-link ${currentPage === 'estoque.html' ? 'active' : ''}"><i data-lucide="archive"></i> Estoque</a>
                    <a href="./vendas.html" class="sidebar-link ${currentPage === 'vendas.html' ? 'active' : ''}"><i data-lucide="shopping-cart"></i> Vendas</a>
                    <a href="./clientes.html" class="sidebar-link ${currentPage === 'clientes.html' ? 'active' : ''}"><i data-lucide="users"></i> Clientes</a>
                    <a href="./caixa.html" class="sidebar-link ${currentPage === 'caixa.html' ? 'active' : ''}"><i data-lucide="dollar-sign"></i> Caixa</a>
                    <a href="./ordem-chegada.html" class="sidebar-link ${currentPage === 'ordem-chegada.html' ? 'active' : ''}"><i data-lucide="list-ordered"></i> Ordem de Chegada</a>
                    <a href="./patio.html" class="sidebar-link ${currentPage === 'patio.html' ? 'active' : ''}"><i data-lucide="sun"></i> Pátio</a>
                </nav>
                <div class="p-4">
                      <button id="logout-btn-mobile" class="w-full flex items-center justify-center gap-2 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors duration-300">
                          <i data-lucide="log-out"></i> Sair
                      </button>
                </div>
            </aside>
            <div id="mobile-sidebar-overlay" class="flex-1 bg-black bg-opacity-50"></div>
        </div>
    `;

    // Insere o HTML do menu no início do container principal <div class="flex h-screen">
    const mainContainer = document.querySelector('.flex.h-screen');
    if (mainContainer) {
        mainContainer.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    // --- LÓGICA DO MENU MOBILE ---
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const openMenuBtn = document.getElementById('open-menu-btn'); // O botão que abre o menu deve estar no HTML principal de cada página
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileSidebarOverlay = document.getElementById('mobile-sidebar-overlay');

    function openSidebar() { if(mobileSidebar) mobileSidebar.classList.add('open'); }
    function closeSidebar() { if(mobileSidebar) mobileSidebar.classList.remove('open'); }

    if(openMenuBtn) openMenuBtn.addEventListener('click', openSidebar);
    if(closeMenuBtn) closeMenuBtn.addEventListener('click', closeSidebar);
    if(mobileSidebarOverlay) mobileSidebarOverlay.addEventListener('click', closeSidebar);

    // --- LÓGICA DE LOGOUT ---
    const auth = getAuth();
    const logoutDesktop = document.getElementById('logout-btn-desktop');
    const logoutMobile = document.getElementById('logout-btn-mobile');
    
    const handleLogout = () => {
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
