/**
 * Select Component - Dropdown select
 * @param {object} props
 * @param {string} props.label - Label text
 * @param {string} props.name - Input name
 * @param {Array} props.options - [{value, label}]
 * @param {string} props.value - Selected value
 * @param {boolean} props.required
 * @param {string} props.className
 */
export function Select({ label, name, options = [], value = '', required = false, className = '' }) {
    return `
        <div class="flex flex-col gap-1.5 ${className}">
            ${label ? `
                <label class="text-sm font-bold text-gray-700">
                    ${label} ${required ? '<span class="text-danger">*</span>' : ''}
                </label>
            ` : ''}
            <select 
                name="${name}" 
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                ${required ? 'required' : ''}
            >
                ${options.map(opt => `
                    <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                        ${opt.label}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
}
