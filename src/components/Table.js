/**
 * Table Component - ตารางข้อมูล
 * รองรับ 2 แบบ:
 * 1. columns + data (object-based)
 * 2. headers + rows (array-based)
 * 
 * @param {object} props
 * @param {Array} props.columns - [{key, label, align, render}]
 * @param {Array} props.data - ข้อมูล objects
 * @param {Array} props.headers - ['col1', 'col2', ...]
 * @param {Array} props.rows - [['val1', 'val2'], ...]
 * @param {string} props.emptyText - ข้อความเมื่อไม่มีข้อมูล
 * @param {string} props.alignLast - alignment ของ column สุดท้าย ('left', 'center', 'right')
 */
export function Table({ 
    columns = [], 
    data = [], 
    headers = [], 
    rows = [],
    emptyText = 'ไม่พบข้อมูล',
    alignLast = ''
}) {
    // ถ้าใช้ headers/rows format
    if (headers.length > 0) {
        return `
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                        <tr>
                            ${headers.map((h, i) => `
                                <th class="px-6 py-3 font-medium ${i === headers.length - 1 && alignLast === 'right' ? 'text-right' : ''}">
                                    ${h}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        ${rows.length > 0 ? rows.map(row => `
                            <tr class="hover:bg-gray-50 transition">
                                ${row.map((cell, i) => `
                                    <td class="px-6 py-4 ${i === row.length - 1 && alignLast === 'right' ? 'text-right' : ''}">
                                        ${cell}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="${headers.length}" class="p-8 text-center text-gray-400">
                                    ${emptyText}
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ถ้าใช้ columns/data format (original)
    return `
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                    <tr>
                        ${columns.map(col => `
                            <th class="px-6 py-3 font-medium ${col.align === 'right' ? 'text-right' : ''} ${col.align === 'center' ? 'text-center' : ''}">
                                ${col.label}
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                    ${data.length > 0 ? data.map(row => `
                        <tr class="hover:bg-gray-50 transition">
                            ${columns.map(col => `
                                <td class="px-6 py-4 ${col.align === 'right' ? 'text-right' : ''} ${col.align === 'center' ? 'text-center' : ''}">
                                    ${col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                                </td>
                            `).join('')}
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="${columns.length}" class="p-8 text-center text-gray-400">
                                ${emptyText}
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Card Component - กล่องเนื้อหา
 * @param {object} props
 * @param {string} props.title - หัวข้อ
 * @param {string} props.content - เนื้อหา HTML
 * @param {string} props.headerAction - HTML button ด้านขวา
 * @param {string} props.className
 */
export function Card({ title = '', content = '', headerAction = '', className = '' }) {
    return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}">
            ${title || headerAction ? `
                <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    ${title ? `<h3 class="font-bold text-gray-800">${title}</h3>` : '<div></div>'}
                    ${headerAction}
                </div>
            ` : ''}
            <div class="${title || headerAction ? '' : 'p-6'}">
                ${content}
            </div>
        </div>
    `;
}
