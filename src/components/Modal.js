export function Modal({ id, title, content, footer = '' }) {
    return `
        <div id="${id}" class="fixed inset-0 z-50 hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 opacity-0 pointer-events-none">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 transition-transform duration-300 flex flex-col max-h-[90vh]">
                <div class="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 class="font-bold text-lg text-gray-800">${title}</h3>
                    <button onclick="closeModal('${id}')" class="text-gray-400 hover:text-danger w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition"><i class="fa-solid fa-times"></i></button>
                </div>
                <div class="p-6 overflow-y-auto custom-scrollbar">
                    ${content}
                </div>
                ${footer ? `<div class="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">${footer}</div>` : ''}
            </div>
        </div>
    `;
}

// Helper JS สำหรับใส่ใน main.js
export const modalScripts = `
    window.openModal = (id) => {
        const el = document.getElementById(id);
        el.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        el.querySelector('div').classList.remove('scale-95');
        el.querySelector('div').classList.add('scale-100');
    };
    window.closeModal = (id) => {
        const el = document.getElementById(id);
        el.classList.add('opacity-0', 'pointer-events-none');
        el.querySelector('div').classList.add('scale-95');
        setTimeout(() => el.classList.add('hidden'), 300);
    };
`;