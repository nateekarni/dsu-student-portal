/**
 * EmptyState Component - แสดงเมื่อไม่มีข้อมูล
 * @param {object} props
 * @param {string} props.icon - Font Awesome icon
 * @param {string} props.title - ข้อความหลัก
 * @param {string} props.description - ข้อความรอง
 * @param {string} props.action - HTML button (optional)
 */
export function EmptyState({ icon = 'folder-open', title = 'ไม่พบข้อมูล', description = '', action = '' }) {
    return `
        <div class="text-center py-16 px-4">
            <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-${icon} text-4xl text-gray-300"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-600 mb-1">${title}</h3>
            ${description ? `<p class="text-sm text-gray-400 mb-4">${description}</p>` : ''}
            ${action}
        </div>
    `;
}

/**
 * LoadingSpinner Component
 * @param {object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.text - Loading text
 */
export function LoadingSpinner({ size = 'md', text = '' }) {
    const sizes = {
        sm: 'text-xl',
        md: 'text-3xl',
        lg: 'text-5xl'
    };
    
    return `
        <div class="flex flex-col items-center justify-center py-12">
            <i class="fa-solid fa-circle-notch fa-spin text-primary ${sizes[size]} mb-2"></i>
            ${text ? `<p class="text-sm text-gray-400">${text}</p>` : ''}
        </div>
    `;
}

/**
 * Avatar Component
 * @param {object} props
 * @param {string} props.name - ชื่อ (จะเอาตัวแรกมาแสดง)
 * @param {string} props.src - URL รูป (optional)
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.color - bg color class
 */
export function Avatar({ name = '', src = '', size = 'md', color = 'bg-primary' }) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };
    
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    
    if (src) {
        return `<img src="${src}" alt="${name}" class="${sizes[size]} rounded-full object-cover">`;
    }
    
    return `
        <div class="${sizes[size]} ${color} text-white rounded-full flex items-center justify-center font-bold">
            ${initial}
        </div>
    `;
}
