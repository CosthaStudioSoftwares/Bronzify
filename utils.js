// Arquivo: utils.js
// Este script cria funções globais para exibir notificações (toasts) e modais de confirmação
// com o mesmo estilo do site, substituindo os alertas padrão do navegador.

/**
 * Insere os elementos HTML necessários para as notificações e modais na página.
 * Esta função é chamada automaticamente quando o script é carregado.
 */
function createUIElements() {
    // Container para as notificações (toasts) que aparecerão no canto da tela.
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'fixed top-5 right-5 z-[100] space-y-3 w-full max-w-xs';
    document.body.appendChild(notificationContainer);

    // Estrutura HTML para o modal de confirmação.
    const confirmModalHTML = `
        <div id="confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[99] hidden modal-backdrop">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center modal-content transform scale-95 transition-transform duration-200">
                <h3 id="confirm-modal-title" class="text-xl text-gray-800 mb-4 font-bold">Confirmar Ação</h3>
                <p id="confirm-modal-text" class="text-gray-600 mb-6"></p>
                <div class="flex justify-center gap-4">
                    <button type="button" id="cancel-confirm-btn" class="px-6 py-2 text-gray-600 rounded-lg hover:bg-gray-100">Cancelar</button>
                    <button type="button" id="confirm-confirm-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:opacity-90">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', confirmModalHTML);
}

// Garante que os elementos sejam criados assim que o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', createUIElements);

/**
 * Exibe uma notificação estilo "toast" no canto da tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {string} type O tipo de notificação ('success', 'error', 'info').
 * @param {number} duration Duração em milissegundos para a notificação desaparecer.
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const icons = {
        success: '<i data-lucide="check-circle" class="w-6 h-6 text-green-500"></i>',
        error: '<i data-lucide="x-circle" class="w-6 h-6 text-red-500"></i>',
        info: '<i data-lucide="info" class="w-6 h-6 text-blue-500"></i>'
    };

    const colors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200'
    };

    const notification = document.createElement('div');
    notification.className = `flex items-center gap-4 p-4 rounded-lg border shadow-lg transform translate-x-full opacity-0 transition-all duration-300 ease-out ${colors[type]}`;
    
    notification.innerHTML = `
        ${icons[type]}
        <p class="font-medium text-gray-700">${message}</p>
    `;

    container.appendChild(notification);
    lucide.createIcons();

    // Animação de entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Animação de saída
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        notification.addEventListener('transitionend', () => notification.remove());
    }, duration);
}

/**
 * Exibe um modal de confirmação e retorna uma promessa que resolve com true ou false.
 * @param {string} message A mensagem de confirmação.
 * @param {string} [title='Confirmar Ação'] O título do modal.
 * @param {string} [confirmButtonText='Confirmar'] O texto do botão de confirmação.
 * @returns {Promise<boolean>} Uma promessa que resolve para `true` se confirmado, `false` caso contrário.
 */
function showConfirm(message, title = 'Confirmar Ação', confirmButtonText = 'Confirmar') {
    return new Promise(resolve => {
        const modal = document.getElementById('confirm-modal');
        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = document.getElementById('confirm-modal-title');
        const modalText = document.getElementById('confirm-modal-text');
        const confirmBtn = document.getElementById('confirm-confirm-btn');
        const cancelBtn = document.getElementById('cancel-confirm-btn');

        if (!modal || !modalText || !confirmBtn || !cancelBtn) {
            resolve(false); // Failsafe
            return;
        }

        modalTitle.textContent = title;
        modalText.textContent = message;
        confirmBtn.textContent = confirmButtonText;

        modal.classList.remove('hidden');
        setTimeout(() => modalContent.classList.remove('scale-95'), 10);

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modalContent.classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 200);
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

// Anexa as funções ao objeto window para que possam ser usadas globalmente
window.showNotification = showNotification;
window.showConfirm = showConfirm;
