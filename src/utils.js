/**
 * Utility Functions - ฟังก์ชันช่วยเหลือที่ใช้ร่วมกันทั้งโปรเจค
 */

// ===== DATE UTILITIES =====

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

/**
 * แปลงวันที่เป็นรูปแบบไทย
 * @param {string|Date} dateStr - วันที่
 * @returns {object} { day, month, year, fullMonth }
 */
export function parseThaiDate(dateStr) {
    const d = new Date(dateStr);
    return {
        day: d.getDate(),
        month: THAI_MONTHS[d.getMonth()],
        year: (d.getFullYear() + 543) % 100,
        fullMonth: d.getMonth()
    };
}

/**
 * แสดงช่วงวันที่ในรูปแบบไทย
 * @param {string} startDate - วันเริ่ม
 * @param {string} endDate - วันสิ้นสุด
 * @returns {string} เช่น "12-17 ม.ค. 68"
 */
export function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate) return '-';
    
    if (startDate && endDate) {
        const start = parseThaiDate(startDate);
        const end = parseThaiDate(endDate);
        
        if (start.fullMonth === end.fullMonth) {
            return `${start.day}-${end.day} ${end.month} ${end.year}`;
        }
        return `${start.day} ${start.month} - ${end.day} ${end.month} ${end.year}`;
    }
    
    if (startDate) {
        const start = parseThaiDate(startDate);
        return `${start.day} ${start.month} ${start.year}`;
    }
    
    return '-';
}

/**
 * คำนวณเวลาที่ผ่านไป
 * @param {string|Date} date - วันที่
 * @returns {string} เช่น "2 ชั่วโมงที่แล้ว"
 */
export function getTimeAgo(date) {
    if (!date) return 'เมื่อสักครู่';
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
}

/**
 * คำนวณจำนวนวันที่เหลือ
 * @param {string} deadline - วันหมดเขต
 * @returns {number} จำนวนวัน
 */
export function getDaysLeft(deadline) {
    if (!deadline) return 0;
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// ===== COUNTRY UTILITIES =====

const COUNTRY_FLAGS = {
    'uk': '🇬🇧', 'england': '🇬🇧', 'britain': '🇬🇧', 'อังกฤษ': '🇬🇧',
    'japan': '🇯🇵', 'ญี่ปุ่น': '🇯🇵',
    'china': '🇨🇳', 'จีน': '🇨🇳',
    'korea': '🇰🇷', 'เกาหลี': '🇰🇷',
    'usa': '🇺🇸', 'america': '🇺🇸', 'อเมริกา': '🇺🇸',
    'thai': '🇹🇭', 'ไทย': '🇹🇭', 'thailand': '🇹🇭',
    'france': '🇫🇷', 'ฝรั่งเศส': '🇫🇷',
    'germany': '🇩🇪', 'เยอรมัน': '🇩🇪',
    'australia': '🇦🇺', 'ออสเตรเลีย': '🇦🇺',
    'singapore': '🇸🇬', 'สิงคโปร์': '🇸🇬',
    'taiwan': '🇹🇼', 'ไต้หวัน': '🇹🇼'
};

/**
 * แปลงชื่อประเทศเป็นธงชาติ
 * @param {string} country - ชื่อประเทศ
 * @returns {string} emoji ธงชาติ
 */
export function getCountryFlag(country) {
    if (!country) return '🌏';
    const c = country.toLowerCase();
    
    for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
        if (c.includes(key)) return flag;
    }
    return '🌏';
}

/**
 * รวม city และ country เป็น string
 * @param {string} city - เมือง
 * @param {string} country - ประเทศ
 * @returns {string} เช่น "London, UK"
 */
export function formatLocation(city, country) {
    return [city, country].filter(Boolean).join(', ');
}

// ===== NUMBER UTILITIES =====

/**
 * แปลงตัวเลขเป็นรูปแบบเงิน
 * @param {number} num - ตัวเลข
 * @returns {string} เช่น "120,000"
 */
export function formatCurrency(num) {
    return Number(num).toLocaleString();
}

// ===== STORAGE UTILITIES =====

/**
 * อ่านข้อมูลจาก localStorage
 * @param {string} key - key
 * @returns {any} parsed JSON or null
 */
export function getStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

/**
 * บันทึกข้อมูลลง localStorage
 * @param {string} key - key
 * @param {any} value - value
 */
export function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * ลบข้อมูลจาก localStorage
 * @param {string} key - key
 */
export function removeStorage(key) {
    localStorage.removeItem(key);
}

// ===== DOM UTILITIES =====

/**
 * Inject script ลงใน document
 * @param {string} code - JavaScript code
 */
export function injectScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
}
