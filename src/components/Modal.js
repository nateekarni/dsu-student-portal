/**
 * Modal Component
 * @param {object} props
 * @param {string} props.id - Modal ID
 * @param {string} props.title - หัวข้อ
 * @param {string} props.content - เนื้อหา HTML
 * @param {string} props.footer - Footer HTML (optional)
 * @param {string} props.maxWidth - max width class
 */
export function Modal({ id, title, content, footer = '', maxWidth = 'max-w-lg' }) {
    return `
        <div id="${id}" class="fixed inset-0 z-50 hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none">
            <div class="bg-white rounded-2xl shadow-2xl w-full ${maxWidth} transform scale-95 transition-transform duration-300 flex flex-col max-h-[90vh]">
                
                <div class="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 class="font-bold text-lg text-gray-800">${title}</h3>
                    <button onclick="closeModal('${id}')" class="text-gray-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <div class="p-6 overflow-y-auto custom-scrollbar">
                    ${content}
                </div>
                
                ${footer ? `<div class="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">${footer}</div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Modal Helper Functions - ต้อง inject ลง window
 */
export function initModalSystem() {
    window.openModal = (id) => {
        const el = document.getElementById(id);
        if (!el) { console.error(`Modal #${id} not found`); return; }
        el.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        const inner = el.querySelector('div');
        if (inner) {
            inner.classList.remove('scale-95');
            inner.classList.add('scale-100');
        }
    };

    window.closeModal = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('opacity-0', 'pointer-events-none');
        const inner = el.querySelector('div');
        if (inner) {
            inner.classList.add('scale-95');
            inner.classList.remove('scale-100');
        }
        setTimeout(() => el.classList.add('hidden'), 300);
    };
}

// Legacy support
export const modalScripts = `
    window.openModal = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        const inner = el.querySelector('div');
        if (inner) {
            inner.classList.remove('scale-95');
            inner.classList.add('scale-100');
        }
    };
    window.closeModal = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('opacity-0', 'pointer-events-none');
        const inner = el.querySelector('div');
        if (inner) {
            inner.classList.add('scale-95');
            inner.classList.remove('scale-100');
        }
        setTimeout(() => el.classList.add('hidden'), 300);
    };
`;