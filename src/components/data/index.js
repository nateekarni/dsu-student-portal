/**
 * Data Display Components - Tables, cards, badges for showing data
 */

// ===== Table =====
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
          <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
            <tr>
              ${headers.map((h, i) => `
                <th class="px-4 py-3 font-medium ${i === headers.length - 1 && alignLast === 'right' ? 'text-right' : ''}">
                  ${h}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            ${rows.length > 0 ? rows.map(row => `
              <tr class="hover:bg-gray-50 transition">
                ${row.map((cell, i) => `
                  <td class="px-4 py-4 ${i === row.length - 1 && alignLast === 'right' ? 'text-right' : ''}">
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

  // columns/data format
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
          <tr>
            ${columns.map(col => `
              <th class="px-4 py-3 font-medium ${col.align === 'right' ? 'text-right' : ''} ${col.align === 'center' ? 'text-center' : ''}">
                ${col.label}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          ${data.length > 0 ? data.map(row => `
            <tr class="hover:bg-gray-50 transition">
              ${columns.map(col => `
                <td class="px-4 py-4 ${col.align === 'right' ? 'text-right' : ''} ${col.align === 'center' ? 'text-center' : ''}">
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

// ===== Card =====
export function Card({ title = '', content = '', headerAction = '', className = '' }) {
  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}">
      ${title || headerAction ? `
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
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

// ===== StatCard =====
export function StatCard({ title, value, icon, color = 'blue', trend = '', trendUp = true, onClick = '' }) {
  const colorStyles = {
    blue: { icon: 'text-blue-600 bg-blue-100', trend: 'text-blue-600' },
    yellow: { icon: 'text-yellow-600 bg-yellow-100', trend: 'text-yellow-600' },
    red: { icon: 'text-red-600 bg-red-100', trend: 'text-red-600' },
    green: { icon: 'text-green-600 bg-green-100', trend: 'text-green-600' },
    purple: { icon: 'text-purple-600 bg-purple-100', trend: 'text-purple-600' }
  };
  
  const styles = colorStyles[color] || colorStyles.blue;
  const clickable = onClick ? 'cursor-pointer hover:shadow-md' : '';
  const safeOnClick = onClick.replace(/"/g, "'");
  const onClickAttr = onClick ? `onclick="${safeOnClick}"` : '';
  
  return `
    <div ${onClickAttr} class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition duration-300 ${clickable}">
      <div>
        <p class="text-sm text-gray-500 font-medium mb-1">${title}</p>
        <h4 class="text-3xl font-bold text-gray-800">${value}</h4>
        ${trend ? `
          <p class="text-xs ${styles.trend} mt-1">
            <i class="fa-solid fa-arrow-${trendUp ? 'up' : 'down'} mr-1"></i>${trend}
          </p>
        ` : ''}
      </div>
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl ${styles.icon}">
        <i class="fa-solid fa-${icon}"></i>
      </div>
    </div>
  `;
}

// ===== StatusBadge =====
export function StatusBadge(status) {
  const styles = {
    open: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-red-100 text-red-800 border-red-200",
    coming: "bg-yellow-100 text-yellow-800 border-yellow-200",
    soon: "bg-amber-100 text-amber-800 border-amber-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    returned: "bg-red-50 text-red-700 border-red-200",
    rejected: "bg-red-50 text-red-700 border-red-200"
  };
  
  const labels = {
    open: "เปิดรับสมัคร", 
    closed: "ปิดรับสมัคร", 
    coming: "เร็วๆ นี้",
    soon: "เร็วๆ นี้",
    pending: "รอตรวจสอบ", 
    approved: "อนุมัติแล้ว", 
    returned: "แก้ไขเอกสาร",
    rejected: "ไม่อนุมัติ"
  };

  const s = status?.toLowerCase() || 'pending';
  const style = styles[s] || "bg-gray-100 text-gray-800";
  const label = labels[s] || status;

  return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}">${label}</span>`;
}

// ===== Tag =====
export function Tag({ icon, iconColor = 'text-gray-400', text, iconType = 'solid', className = '' }) {
  const iconClass = iconType === 'regular' ? 'fa-regular' : 'fa-solid';
  
  return `
    <span class="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 border border-gray-200 rounded-md text-xs text-gray-600 ${className}">
      <i class="${iconClass} fa-${icon} ${iconColor}"></i>
      ${text}
    </span>
  `;
}

// ===== StatusTag =====
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

// ===== Avatar =====
export function Avatar({ name = '', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };
  
  const initials = name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  
  return `
    <div class="${sizes[size] || sizes.md} rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold ${className}">
      ${initials || '?'}
    </div>
  `;
}

// ===== EmptyState =====
export function EmptyState({ icon = 'inbox', title = 'ไม่มีข้อมูล', message = '' }) {
  return `
    <div class="text-center py-12">
      <i class="fa-solid fa-${icon} text-4xl text-gray-300 mb-4"></i>
      <h4 class="text-gray-600 font-medium">${title}</h4>
      ${message ? `<p class="text-sm text-gray-400 mt-1">${message}</p>` : ''}
    </div>
  `;
}

// ===== LoadingSpinner =====
export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  
  return `
    <div class="flex flex-col items-center justify-center py-8">
      <div class="${sizes[size] || sizes.md} border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      ${text ? `<p class="text-sm text-gray-500 mt-3">${text}</p>` : ''}
    </div>
  `;
}
