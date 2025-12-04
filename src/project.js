/**
 * Project Details Page - แสดงรายละเอียดโครงการแบบสินค้าออนไลน์
 */
import './style.css';
import { API } from './api.js';
import { Button, Modal, initModalSystem } from './components/index.js';
import { formatDateRange, formatLocation, formatCurrency, getStorage, removeStorage } from './utils.js';

let currentUser = getStorage('student_user');
let project = null;

function getParam(key) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function renderAuth() {
  const el = document.getElementById('auth-section');
  if (!el) return;
  if (currentUser) {
    el.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 hidden sm:inline">สวัสดี, ${currentUser.name}</span>
        ${Button({ text: 'สถานะสมัคร', variant: 'outline', onClick: 'viewDashboard()', className: 'text-xs px-3 py-1.5' })}
        ${Button({ text: '<i class=\"fa-solid fa-right-from-bracket\"></i>', variant: 'secondary', onClick: 'logout()', className: 'px-2 py-1.5 text-danger border-none shadow-none' })}
      </div>
    `;
  } else {
    el.innerHTML = Button({ text: 'เข้าสู่ระบบ', onClick: "openModal('auth-modal')", variant: 'primary', className: 'text-sm px-4 py-1.5' });
  }
}

// ===== Mock & Normalizer =====
const MOCK_PROJECT = {
  id: 'chengdu-exchange-2026',
  title: 'โครงการแลกเปลี่ยนวัฒนธรรมจีน ณ มหาวิทยาลัยเฉิงตู',
  subtitle: '7 วัน 6 คืน',
  desc: 'เปิดประสบการณ์แลกเปลี่ยนวัฒนธรรมจีนแท้ๆ ณ มหาวิทยาลัยเฉิงตู มณฑลเสฉวน ร่วมเรียนรู้ภาษาจีนกลาง ศิลปะการชงชา ศิลปะการเขียนพู่กันจีน และทัศนศึกษาสถานที่สำคัญทางประวัติศาสตร์ พร้อมสัมผัสวิถีชีวิตนักศึกษาจีนอย่างใกล้ชิด',
  image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&h=675&fit=crop',
  gallery: [
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1537531383496-f4749edbb651?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=400&h=250&fit=crop',
  ],
  city: 'เฉิงตู',
  country: 'จีน',
  flag: '🇨🇳',
  duration: '7 วัน 6 คืน',
  quota: 25,
  price: 45000,
  start_date: '2026-03-15',
  end_date: '2026-03-21',
  deadline: '2026-02-01',
  category_badge: 'Cultural Exchange',
  conditions: 'นักเรียนระดับ ม.4-6 เกรดเฉลี่ย 2.50 ขึ้นไป มีความสนใจภาษาและวัฒนธรรมจีน',
  highlights: [
    { icon: 'fa-graduation-cap', label: 'เรียนรู้ภาษาจีนกลางกับอาจารย์เจ้าของภาษา' },
    { icon: 'fa-paw', label: 'เยี่ยมชมศูนย์อนุรักษ์แพนด้ายักษ์' },
    { icon: 'fa-landmark', label: 'ทัศนศึกษาสถานที่ประวัติศาสตร์' },
    { icon: 'fa-utensils', label: 'สัมผัสอาหารเสฉวนต้นตำรับ' },
  ],
  benefits: [
    'ประกาศนียบัตรจากมหาวิทยาลัยเฉิงตู',
    'พัฒนาทักษะภาษาจีนกลางเบื้องต้น',
    'เรียนรู้ศิลปะการชงชาและเขียนพู่กันจีน',
    'สร้างเครือข่ายเพื่อนต่างชาติ',
    'ประสบการณ์ที่ช่วยเสริม Portfolio',
  ],
  requirements: [
    'สำเนาบัตรประชาชน',
    'สำเนาทะเบียนบ้าน',
    'หนังสือเดินทาง (Passport) อายุเหลือ 6 เดือนขึ้นไป',
    'รูปถ่ายสี 2 นิ้ว 2 รูป',
    'ใบรับรองผลการเรียน (ปพ.1)',
    'หนังสือยินยอมจากผู้ปกครอง',
  ],
  fee_includes: [
    'ตั๋วเครื่องบินไป-กลับ กรุงเทพฯ - เฉิงตู',
    'ที่พักในมหาวิทยาลัย 6 คืน',
    'อาหาร 3 มื้อตลอดโปรแกรม',
    'ค่าเข้าชมสถานที่ทั้งหมด',
    'ประกันการเดินทาง',
    'รถรับ-ส่งตลอดทริป',
    'ค่าวีซ่าจีน',
  ],
  fee_excludes: [
    'ค่าใช้จ่ายส่วนตัว',
    'ค่าน้ำหนักกระเป๋าเกิน 20 กก.',
    'ค่าอาหารและเครื่องดื่มนอกรายการ',
  ],
  activities: [
    { icon: 'fa-language', title: 'เรียนภาษาจีนกลาง', desc: 'คอร์สเรียนภาษาจีนเบื้องต้นกับอาจารย์เจ้าของภาษา' },
    { icon: 'fa-mug-hot', title: 'ศิลปะการชงชา', desc: 'เรียนรู้วัฒนธรรมการชงชาแบบจีนดั้งเดิม' },
    { icon: 'fa-paintbrush', title: 'เขียนพู่กันจีน', desc: 'ฝึกเขียนอักษรจีนด้วยพู่กันแบบโบราณ' },
    { icon: 'fa-users', title: 'กิจกรรมแลกเปลี่ยน', desc: 'ร่วมกิจกรรมกับนักศึกษาจีนในมหาวิทยาลัย' },
  ],
  agenda: [
    { day: 'วันที่ 1', title: 'เดินทางสู่เฉิงตู', desc: 'ออกเดินทางจากสนามบินสุวรรณภูมิ → ถึงเฉิงตู → เช็คอินหอพักมหาวิทยาลัย → ต้อนรับและปฐมนิเทศ' },
    { day: 'วันที่ 2', title: 'เรียนรู้ภาษาและวัฒนธรรม', desc: 'เรียนภาษาจีนภาคเช้า → ศิลปะการชงชาภาคบ่าย → กิจกรรมแลกเปลี่ยนกับนักศึกษาจีน' },
    { day: 'วันที่ 3', title: 'ทัศนศึกษาในเมือง', desc: 'วัดเหวินซู → ถนนโบราณจิ่นหลี่ → ชมการแสดงเปลี่ยนหน้ากากเสฉวน' },
    { day: 'วันที่ 4', title: 'ศูนย์อนุรักษ์แพนด้า', desc: 'เยี่ยมชมศูนย์อนุรักษ์แพนด้ายักษ์ → เรียนรู้การอนุรักษ์สัตว์ป่า → ช้อปปิ้งย่านชุนซี' },
    { day: 'วันที่ 5', title: 'ศิลปะและประวัติศาสตร์', desc: 'เรียนเขียนพู่กันจีน → พิพิธภัณฑ์เสฉวน → สวนสาธารณะประชาชน' },
    { day: 'วันที่ 6', title: 'กิจกรรมอำลา', desc: 'นำเสนอผลงาน → พิธีมอบประกาศนียบัตร → งานเลี้ยงอำลา' },
    { day: 'วันที่ 7', title: 'เดินทางกลับ', desc: 'เช็คเอาท์ → เดินทางสู่สนามบิน → กลับถึงกรุงเทพฯ โดยสวัสดิภาพ' },
  ],
  contact: {
    phone: '02-xxx-xxxx',
    line: '@schooltrip',
    email: 'exchange@school.ac.th',
  },
  locations: ['เฉิงตู', 'มหาวิทยาลัยเฉิงตู', 'ศูนย์แพนด้า'],
};

function isEmptyVal(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim().length === 0;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function withMock(data, mock) {
  const out = { ...mock };
  const keys = new Set([...Object.keys(mock), ...Object.keys(data || {})]);
  for (const k of keys) {
    const val = data ? data[k] : undefined;
    out[k] = isEmptyVal(val) ? mock[k] : val;
  }
  return out;
}

async function loadProject() {
  const id = getParam('id');
  const root = document.getElementById('project-root');
  if (!root) return;

  try {
    const res = await API.getProjects();
    const list = Array.isArray(res) ? res : (res?.data || []);

    let selected = null;
    if (id) {
      selected = list.find(p => String(p.id) === String(id)) || null;
    } else {
      selected = list[0] || null;
    }

    project = withMock(selected || {}, MOCK_PROJECT);
    renderProject(project);
  } catch (e) {
    console.error(e);
    // แสดง Mock ทันทีเมื่อโหลดไม่ได้
    project = { ...MOCK_PROJECT };
    renderProject(project);
  }
}

function renderProject(p) {
  const root = document.getElementById('project-root');
  const {
    title, subtitle, desc, image, gallery = [], city, country, flag, duration, quota, price,
    start_date, end_date, deadline, conditions, benefits, requirements,
    category_badge, highlights = [], activities = [], agenda = [],
    fee_includes = [], fee_excludes = [], contact = {}, locations = []
  } = p;

  const location = formatLocation(city, country);
  const dateRange = formatDateRange(start_date, end_date);
  const pictures = [image, ...(Array.isArray(gallery) ? gallery : [])].filter(Boolean);

  root.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- Breadcrumb & Back -->
      <div class="flex items-center justify-between text-sm">
        <a href="/" class="text-gray-500 hover:text-primary flex items-center gap-1"><i class="fa-solid fa-angle-left"></i> กลับ</a>
        <span class="font-medium text-gray-700">รายละเอียดโครงการ</span>
        <div class="w-12"></div>
      </div>

      <!-- Hero Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Cover Image Only -->
        <div class="aspect-[21/9]">
          <img src="${image || MOCK_PROJECT.image}" alt="${title || MOCK_PROJECT.title}" class="w-full h-full object-cover">
        </div>

        <!-- Project Info -->
        <div class="p-6 space-y-4">
          ${category_badge || MOCK_PROJECT.category_badge ? `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">${category_badge || MOCK_PROJECT.category_badge}</span>` : ''}
          <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">${title || MOCK_PROJECT.title}</h1>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span class="inline-flex items-center gap-2"><span class="text-lg">${flag || MOCK_PROJECT.flag || '🌏'}</span> ${location || formatLocation(MOCK_PROJECT.city, MOCK_PROJECT.country)}</span>
            <span class="inline-flex items-center gap-2"><i class="fa-regular fa-calendar text-gray-400"></i> ${dateRange || formatDateRange(MOCK_PROJECT.start_date, MOCK_PROJECT.end_date)}</span>
            <span class="inline-flex items-center gap-2"><i class="fa-solid fa-clock text-gray-400"></i> ${duration || MOCK_PROJECT.duration}</span>
            <span class="inline-flex items-center gap-2"><i class="fa-solid fa-users text-gray-400"></i> รับ ${quota || MOCK_PROJECT.quota} คน</span>
          </div>
        </div>

        <!-- Price & CTA -->
        <div class="p-4 bg-slate-50 border-t border-gray-100">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p class="text-xs text-gray-500">ค่าใช้จ่ายทั้งหมด</p>
              <p class="text-2xl font-extrabold text-primary">฿${formatCurrency(price ?? MOCK_PROJECT.price)}<span class="text-sm font-normal text-gray-500"> /คน</span></p>
              <p class="text-xs text-gray-400 mt-0.5"><i class="fa-regular fa-clock mr-1"></i> ปิดรับสมัคร ${deadline ? new Date(deadline).toLocaleDateString('th-TH') : new Date(MOCK_PROJECT.deadline).toLocaleDateString('th-TH')}</p>
            </div>
            <div class="flex gap-2">
              ${Button({ text: '<i class="fa-regular fa-heart"></i>', variant: 'secondary', onClick: 'toggleFavorite()', className: 'px-3' })}
              ${Button({ text: 'สมัครเข้าร่วม <i class="fa-solid fa-arrow-right ml-1"></i>', onClick: 'applyProject()', className: 'font-bold px-5' })}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Info Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-users"></i></div>
          <p class="text-xs text-gray-500">รับจำนวน</p>
          <p class="font-bold text-gray-800">${quota || MOCK_PROJECT.quota} คน</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><i class="fa-solid fa-baht-sign"></i></div>
          <p class="text-xs text-gray-500">ค่าใช้จ่าย</p>
          <p class="font-bold text-gray-800">฿${formatCurrency(price ?? MOCK_PROJECT.price)}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><i class="fa-solid fa-plane-departure"></i></div>
          <p class="text-xs text-gray-500">ระยะเวลา</p>
          <p class="font-bold text-gray-800">${duration || MOCK_PROJECT.duration}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><i class="fa-solid fa-calendar-xmark"></i></div>
          <p class="text-xs text-gray-500">ปิดรับสมัคร</p>
          <p class="font-bold text-gray-800">${deadline ? new Date(deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : new Date(MOCK_PROJECT.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      <!-- Highlights -->
      ${(highlights.length || MOCK_PROJECT.highlights?.length) ? `
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h2 class="font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fa-solid fa-star text-yellow-500"></i> ไฮไลท์โครงการ</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${(highlights.length ? highlights : MOCK_PROJECT.highlights).map(h => `
            <div class="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3">
              <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm"><i class="fa-solid ${h.icon}"></i></div>
              <span class="text-sm text-gray-700">${h.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- About -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-info-circle text-primary"></i> เกี่ยวกับโครงการ</h2>
        <p class="text-gray-600 leading-relaxed">${desc || MOCK_PROJECT.desc}</p>
      </div>

      <!-- Key Activities -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><i class="fa-solid fa-bolt text-amber-500"></i> กิจกรรมหลัก</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${(activities.length ? activities : MOCK_PROJECT.activities).map(a => `
            <div class="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><i class="fa-solid ${a.icon}"></i></div>
              <div>
                <p class="font-semibold text-gray-800">${a.title}</p>
                <p class="text-sm text-gray-500">${a.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Itinerary / Agenda -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><i class="fa-solid fa-route text-green-600"></i> กำหนดการเดินทาง</h2>
        <div class="relative pl-6 border-l-2 border-primary/30 space-y-6">
          ${(agenda.length ? agenda : MOCK_PROJECT.agenda).map((g, idx) => `
            <div class="relative">
              <span class="absolute -left-[29px] w-4 h-4 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-gray-300'} border-4 border-white"></span>
              <div>
                <p class="text-xs font-bold text-primary uppercase tracking-wide">${g.day}</p>
                <p class="font-semibold text-gray-800 mt-0.5">${g.title}</p>
                <p class="text-sm text-gray-500 mt-1">${g.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Benefits -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-gift text-pink-500"></i> สิ่งที่จะได้รับ</h2>
        <ul class="space-y-2">
          ${(benefits?.length ? benefits : MOCK_PROJECT.benefits).map(b => `
            <li class="flex items-start gap-2 text-gray-600"><i class="fa-solid fa-check text-green-500 mt-1"></i> ${b}</li>
          `).join('')}
        </ul>
      </div>

      <!-- Requirements & Fee Details Combined -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <!-- Left: Requirements -->
          <div class="p-6">
            <h2 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-clipboard-list text-indigo-500"></i> คุณสมบัติผู้สมัคร</h2>
            <p class="text-gray-600 mb-4 text-sm">${conditions || MOCK_PROJECT.conditions}</p>
            <h3 class="font-semibold text-gray-700 mb-2 text-sm">เอกสารที่ต้องเตรียม</h3>
            <ul class="space-y-2">
              ${(requirements?.length ? requirements : MOCK_PROJECT.requirements).map(r => `
                <li class="flex items-start gap-2 text-sm text-gray-600"><i class="fa-regular fa-file text-gray-400 mt-0.5"></i> ${r}</li>
              `).join('')}
            </ul>
          </div>
          <!-- Right: Fee Details -->
          <div class="p-6">
            <h2 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-receipt text-teal-500"></i> รายละเอียดค่าใช้จ่าย</h2>
            <ul class="space-y-2">
              ${(fee_includes?.length ? fee_includes : MOCK_PROJECT.fee_includes).map(f => `
                <li class="flex items-start gap-2 text-sm text-green-700"><i class="fa-solid fa-circle-check text-green-500 mt-0.5"></i> ${f}</li>
              `).join('')}
              ${(fee_excludes?.length ? fee_excludes : MOCK_PROJECT.fee_excludes).map(f => `
                <li class="flex items-start gap-2 text-sm text-red-700"><i class="fa-solid fa-circle-xmark text-red-500 mt-0.5"></i> ${f}</li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>

      <!-- Locations Tags -->
      ${(locations?.length || MOCK_PROJECT.locations?.length) ? `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-red-500"></i> สถานที่ในโปรแกรม</h2>
        <div class="flex flex-wrap gap-2">
          ${(locations?.length ? locations : MOCK_PROJECT.locations).map(loc => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm"><i class="fa-solid fa-location-dot text-red-400"></i> ${loc}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}

    </div>
  `;
}

// Simple image swapper
window.swapMainImage = (src) => {
  const main = document.querySelector('#pd-main-image');
  if (main) main.src = src;
};

// Add navigation to apply workflow page
function navigateToApply(projectId) {
  const pid = projectId || getParam('id') || 'mock-project';
  location.href = `/apply.html?projectId=${pid}`;
}

// Ensure apply action uses navigateToApply
window.applyProject = function(projectId) {
  navigateToApply(projectId);
}

// Stub actions
window.toggleFavorite = () => {
  alert('ฟังก์ชันบันทึกเป็นรายการโปรด - ตัวอย่างข้อมูล');
}

// Auth globals
window.viewDashboard = () => alert('เปิดหน้าสถานะการสมัคร');
window.logout = () => { removeStorage('student_user'); location.reload(); };

function setupModals() {
  const container = document.getElementById('modal-container');
  if (!container) return;
  container.innerHTML = `
    ${Modal({
      id: 'auth-modal',
      title: 'เข้าสู่ระบบ / สมัครสมาชิก',
      content: `
        <div class="space-y-4">
          <p class="text-center text-gray-500 text-sm">กรุณาเลือกรายการ</p>
          ${Button({ text: 'ยังไม่เคยสมัคร (ลงทะเบียนใหม่)', onClick: "openRegister()", className: 'w-full py-3', variant: 'primary' })}
          ${Button({ text: 'เคยสมัครแล้ว (เข้าสู่ระบบ)', onClick: "openLogin()", className: 'w-full py-3', variant: 'secondary' })}
        </div>
      `
    })}
  `;
}
window.openRegister = () => { closeModal('auth-modal'); };
window.openLogin = () => { closeModal('auth-modal'); };

function init() {
  initModalSystem();
  renderAuth();
  setupModals();
  loadProject();
}

init();
