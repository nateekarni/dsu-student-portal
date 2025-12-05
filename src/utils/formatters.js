/**
 * Formatter Utilities
 * Date, currency, and text formatting functions
 */

/**
 * Parse Thai date string (e.g., "30 เม.ย. 2026")
 * @param {string} str 
 * @returns {Date|null}
 */
export function parseThaiDate(str) {
  if (!str) return null;
  const thaiMonths = {
    'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3, 'พ.ค.': 4, 'มิ.ย.': 5,
    'ก.ค.': 6, 'ส.ค.': 7, 'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11
  };
  const parts = str.split(' ');
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = thaiMonths[parts[1]];
  const year = parseInt(parts[2]) - 543;
  return new Date(year, month, day);
}

/**
 * Format date range
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {string}
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '-';
  const options = { day: 'numeric', month: 'short' };
  const optionsWithYear = { day: 'numeric', month: 'short', year: '2-digit' };
  const start = new Date(startDate).toLocaleDateString('th-TH', options);
  const end = new Date(endDate).toLocaleDateString('th-TH', optionsWithYear);
  return `${start} - ${end}`;
}

/**
 * Format single date
 * @param {string} dateStr - ISO date string
 * @param {object} options - Intl options
 * @returns {string}
 */
export function formatDate(dateStr, options = { day: 'numeric', month: 'short', year: '2-digit' }) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', options);
}

/**
 * Format datetime
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get relative time (e.g., "2 ชั่วโมงที่แล้ว")
 * @param {string|Date} date 
 * @returns {string}
 */
export function getTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  const intervals = [
    { label: 'ปี', seconds: 31536000 },
    { label: 'เดือน', seconds: 2592000 },
    { label: 'วัน', seconds: 86400 },
    { label: 'ชั่วโมง', seconds: 3600 },
    { label: 'นาที', seconds: 60 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}ที่แล้ว`;
    }
  }
  return 'เมื่อสักครู่';
}

/**
 * Get days left until date
 * @param {string|Date} targetDate 
 * @returns {number}
 */
export function getDaysLeft(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format currency
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'THB') {
  if (amount === 0) return 'ฟรี';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format number with commas
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('th-TH').format(num);
}

/**
 * Get country flag emoji
 * @param {string} countryName 
 * @returns {string}
 */
export function getCountryFlag(countryName) {
  const flags = {
    'ญี่ปุ่น': '🇯🇵', 'japan': '🇯🇵',
    'เกาหลีใต้': '🇰🇷', 'south korea': '🇰🇷', 'korea': '🇰🇷',
    'สิงคโปร์': '🇸🇬', 'singapore': '🇸🇬',
    'จีน': '🇨🇳', 'china': '🇨🇳',
    'ไต้หวัน': '🇹🇼', 'taiwan': '🇹🇼',
    'อังกฤษ': '🇬🇧', 'uk': '🇬🇧', 'england': '🇬🇧',
    'อเมริกา': '🇺🇸', 'usa': '🇺🇸', 'united states': '🇺🇸',
    'ออสเตรเลีย': '🇦🇺', 'australia': '🇦🇺',
    'เยอรมนี': '🇩🇪', 'germany': '🇩🇪',
    'ฝรั่งเศส': '🇫🇷', 'france': '🇫🇷',
    'ไทย': '🇹🇭', 'thailand': '🇹🇭'
  };
  return flags[countryName?.toLowerCase()] || '🌍';
}

/**
 * Format location string
 * @param {string} city 
 * @param {string} country 
 * @returns {string}
 */
export function formatLocation(city, country) {
  const flag = getCountryFlag(country);
  if (city && country) return `${flag} ${city}, ${country}`;
  if (country) return `${flag} ${country}`;
  if (city) return city;
  return '-';
}

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 * @param {string} str 
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
