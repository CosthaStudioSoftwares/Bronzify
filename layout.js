// Arquivo: layout.js

// Importa as funções do Firebase Auth para o botão "Sair" funcionar
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// O "evento" que garante que o HTML carregou antes de o script rodar
document.addEventListener('DOMContentLoaded', () => {

    // 1. Descobre qual é a página atual para o menu saber qual item destacar
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // 2. Define o HTML do menu lateral (sidebar)
    const sidebarHTML = `
        <aside id="sidebar" class="w-64 bg-white shadow-md flex-shrink-0 lg:block fixed lg:relative z-20 h-full flex flex-col sidebar-mobile">
            <div class="p-6">
                <h1 class="text-3xl text-[#B76E79]">Bronzify</h1>
            </div>
            <nav class="mt-6 px-4 flex-1">
                <a href="./dashboard.html" class="sidebar-link ${currentPage === 'dashboard.html' ? 'active' : ''}"><i data-lucide="layout-dashboard"></i> <span>Dashboard</span></a>
                <a href="./clientes.html" class="sidebar-link ${currentPage === 'clientes.html' ? 'active' : ''}"><i data-lucide="users"></i> <span>Clientes</span></a>
                <a href="./caixa.html" class="sidebar-link ${currentPage === 'caixa.html' ? 'active' : ''}"><i data-lucide="dollar-sign"></i> <span>Caixa</span></a>
                <a href="./vendas.html" class="sidebar-link ${currentPage === 'vendas.html' ? 'active' : ''}"><i data-lucide="shopping-cart"></i> <span>Vendas</span></a>
                <a href="./ordem-chegada.html" class="sidebar-link ${currentPage === 'ordem-chegada.html' ? 'active' : ''}"><i data-lucide="list-ordered"></i> <span>Ordem de Chegada</span></a>
                <a href="./patio.html" class="sidebar-link ${currentPage === 'patio.html' ? 'active' : ''}"><i data-lucide="sun"></i> <span>Pátio</span></a>
                <a href="#" id="whatsapp-support-link" class="sidebar-link"><i data-lucide="message-circle"></i> <span>Suporte Whatsapp</span></a>
            </nav>
            <div class="p-4">
                <button id="logout-btn-desktop" class="w-full flex items-center justify-center gap-2 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors duration-300"><i data-lucide="log-out"></i> Sair</button>
            </div>
        </aside>
        
        <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-10 hidden lg:hidden"></div>
    `;

    // 3. Insere o HTML do menu no container que criamos no Passo 1
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
    }

    // 4. Ativa os ícones do Lucide que acabamos de adicionar
    lucide.createIcons();

    // 5. Adiciona a lógica para os botões e links funcionarem
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-menu-btn');
    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const whatsappLink = document.getElementById('whatsapp-support-link');

    // Lógica para abrir/fechar no celular
    const closeSidebar = () => {
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.add('hidden');
        }
    };

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && overlay) {
                sidebar.classList.add('open');
                overlay.classList.remove('hidden');
            }
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Lógica para o botão de Sair
    if (logoutBtnDesktop) {
        logoutBtnDesktop.addEventListener('click', () => {
            const auth = getAuth();
            signOut(auth).then(() => {
                window.location.href = '/index.html';
            }).catch((error) => {
                console.error("Erro ao fazer logout:", error);
            });
        });
    }

    // ✅ LÓGICA PARA O LINK DO WHATSAPP (AQUI ESTÁ O LOCAL CORRETO)
    if (whatsappLink) {
        whatsappLink.addEventListener('click', async (e) => {
            e.preventDefault(); // Impede o link de navegar
            
            // Chama a sua função de confirmação (do utils.js)
            const userConfirmed = await showConfirm(
                'Você será redirecionado para o WhatsApp para iniciar uma conversa. Deseja continuar?', // Mensagem
                'Ir para o Suporte', // Título
                'Sim, continuar' // Texto do botão de confirmação
            );

            // Se o usuário confirmou, abre o link em uma nova aba
            if (userConfirmed) {
                const whatsappUrl = 'https://wa.me/5579996365824?text=Ol%C3%A1!%20preciso%20de%20ajuda%20com%20o%20Bronzify.';
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }
        });
    }
});
