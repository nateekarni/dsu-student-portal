/**
 * Textarea Component
 * @param {object} props
 * @param {string} props.label - Label text
 * @param {string} props.name - Input name
 * @param {number} props.rows - Number of rows
 * @param {string} props.value - Default value
 * @param {string} props.placeholder
 * @param {boolean} props.required
 * @param {string} props.className
 */
export function Textarea({ label, name, rows = 3, value = '', placeholder = '', required = false, className = '' }) {
    return `
        <div class="flex flex-col gap-1.5 ${className}">
            ${label ? `
                <label class="text-sm font-bold text-gray-700">
                    ${label} ${required ? '<span class="text-danger">*</span>' : ''}
                </label>
            ` : ''}
            <textarea 
                name="${name}" 
                rows="${rows}"
                placeholder="${placeholder}"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white resize-none"
                ${required ? 'required' : ''}
            >${value}</textarea>
        </div>
    `;
}
