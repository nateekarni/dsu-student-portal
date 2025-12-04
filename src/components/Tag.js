/**
 * Tag Component - แสดง meta info แบบ pill/badge
 * @param {object} props
 * @param {string} props.icon - Font Awesome icon class (ไม่ต้องใส่ fa-solid)
 * @param {string} props.iconColor - Tailwind text color class
 * @param {string} props.text - ข้อความ
 * @param {string} props.iconType - 'solid' | 'regular' (default: 'solid')
 * @param {string} props.className - class เพิ่มเติม
 */
export function Tag({ icon, iconColor = 'text-gray-400', text, iconType = 'solid', className = '' }) {
    const iconClass = iconType === 'regular' ? 'fa-regular' : 'fa-solid';
    
    return `
        <span class="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 border border-gray-200 rounded-md text-xs text-gray-600 ${className}">
            <i class="${iconClass} fa-${icon} ${iconColor}"></i>
            ${text}
        </span>
    `;
}

/**
 * StatusTag Component - แสดงสถานะแบบ colored pill
 */
export function StatusTag({ status, label }) {
    const statusStyles = {
        'active': 'bg-blue-100 text-blue-600',
        'open': 'bg-green-100 text-green-600',
        'soon': 'bg-amber-100 text-amber-600',
        'closed': 'bg-gray-100 text-gray-500',
        'pending': 'bg-yellow-100 text-yellow-600',
        'approved': 'bg-green-100 text-green-600',
        'rejected': 'bg-red-100 text-red-600'
    };
    
    const style = statusStyles[status] || 'bg-gray-100 text-gray-600';
    
    return `
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${style}">
            ${label || status}
        </span>
    `;
}
