export function Input({ label, name, type = 'text', required = false, value = '', placeholder = '' }) {
    return `
        <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-gray-700">
                ${label} ${required ? '<span class="text-danger">*</span>' : ''}
            </label>
            <input 
                type="${type}" 
                name="${name}" 
                value="${value}"
                placeholder="${placeholder}"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                ${required ? 'required' : ''}
            >
        </div>
    `;
}