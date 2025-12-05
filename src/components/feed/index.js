/**
 * Feed Components - Cards for displaying project/content feeds
 */
import { formatDateRange, getTimeAgo, formatLocation, formatCurrency } from '../../utils/index.js';

// ===== FeedCard =====
export function FeedCard(project, options = {}) {
  const {
    id, title, desc, image, city, country, quota, price,
    start_date, end_date, status, created_at
  } = project;
  
  const { onClickAction = `openProjectDetail('${id}')` } = options;
  
  const statusConfig = {
    'active': { label: 'เปิดรับสมัคร', class: 'bg-blue-100 text-blue-600' },
    'open': { label: 'เปิดรับสมัคร', class: 'bg-blue-100 text-blue-600' },
    'soon': { label: 'เร็วๆ นี้', class: 'bg-amber-100 text-amber-600' },
    'closed': { label: 'ปิดรับสมัคร', class: 'bg-gray-100 text-gray-500' }
  };
  
  const statusInfo = statusConfig[status] || statusConfig['active'];
  const timeAgo = getTimeAgo(created_at);
  const location = formatLocation(city, country);
  const dateRange = formatDateRange(start_date, end_date);
  
  // Inline Tag component to avoid circular dependency
  const tag = (icon, iconColor, text, iconType = 'solid') => `
    <span class="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 border border-gray-200 rounded-md text-xs text-gray-600">
      <i class="fa-${iconType} fa-${icon} ${iconColor}"></i>
      ${text}
    </span>
  `;
  
  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      <!-- Header -->
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">งานแนะแนวโรงเรียน</p>
            <p class="text-xs text-gray-400">${timeAgo} · <i class="fa-solid fa-earth-asia"></i></p>
          </div>
        </div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.class}">${statusInfo.label}</span>
      </div>
      
      <!-- Content -->
      <div class="px-4 pb-3">
        <h3 class="font-bold text-lg text-gray-800 mb-1">${title}</h3>
        <p class="text-gray-500 text-sm line-clamp-2 mb-3">${desc || ''}</p>
        
        <!-- Meta Tags -->
        <div class="flex flex-wrap gap-2">
          ${location ? tag('location-dot', 'text-red-400', location) : ''}
          ${tag('users', 'text-blue-400', `รับ ${quota || '-'} คน`)}
          ${tag('calendar', 'text-orange-400', dateRange, 'regular')}
        </div>
      </div>
      
      <!-- Image -->
      ${image ? `
        <div class="relative">
          <img src="${image}" alt="${title}" class="w-full h-64 object-cover">
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div class="p-4 flex items-center justify-between border-t border-gray-100">
        <div>
          ${price ? `
            <p class="text-xs text-gray-400">ค่าเข้าร่วม</p>
            <span class="text-lg font-bold text-primary">${formatCurrency(price)}</span>
          ` : '<span class="text-sm text-green-600 font-medium">ฟรี ไม่มีค่าใช้จ่าย</span>'}
        </div>
        <button onclick="${onClickAction}" class="px-5 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition">
          รายละเอียด
        </button>
      </div>
    </div>
  `;
}

// ===== FeedCardCompact =====
export function FeedCardCompact(project, options = {}) {
  const { id, title, image, deadline } = project;
  const { onClick = `openProjectDetail('${id}')` } = options;
  
  const daysLeft = (() => {
    if (!deadline) return 0;
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();
  
  return `
    <div class="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition" onclick="${onClick}">
      <img src="${image || 'https://via.placeholder.com/80x60'}" alt="" class="w-16 h-12 object-cover rounded-lg">
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm text-gray-800 line-clamp-1">${title}</p>
        <p class="text-xs text-red-500 font-medium">เหลือ ${daysLeft} วัน</p>
      </div>
    </div>
  `;
}
