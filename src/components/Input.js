/**
 * Input Component - ช่องกรอกข้อมูล
 * @param {object} props
 * @param {string} props.label - ป้ายชื่อ (ไม่ใส่จะไม่แสดง)
 * @param {string} props.name - name attribute
 * @param {string} props.id - id attribute
 * @param {string} props.type - input type (text, email, password, number, date, etc.)
 * @param {boolean} props.required - required field
 * @param {string} props.value - ค่าเริ่มต้น
 * @param {string} props.placeholder - placeholder text
 * @param {string} props.className - custom className
 */
export function Input({ 
    label = '', 
    name = '', 
    id = '',
    type = 'text', 
    required = false, 
    value = '', 
    placeholder = '',
    className = ''
}) {
    const inputId = id || name;
    const inputClass = `w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white ${className}`;
    
    // ถ้าไม่มี label ให้ return แค่ input
    if (!label) {
        return `
            <input 
                type="${type}" 
                ${name ? `name="${name}"` : ''}
                ${inputId ? `id="${inputId}"` : ''}
                value="${value}"
                placeholder="${placeholder}"
                class="${inputClass}"
                ${required ? 'required' : ''}
            >
        `;
    }
    
    return `
        <div class="flex flex-col gap-1.5">
            <label ${inputId ? `for="${inputId}"` : ''} class="text-sm font-bold text-gray-700">
                ${label} ${required ? '<span class="text-danger">*</span>' : ''}
            </label>
            <input 
                type="${type}" 
                ${name ? `name="${name}"` : ''}
                ${inputId ? `id="${inputId}"` : ''}
                value="${value}"
                placeholder="${placeholder}"
                class="${inputClass}"
                ${required ? 'required' : ''}
            >
        </div>
    `;
}