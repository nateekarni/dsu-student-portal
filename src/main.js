import './style.css';
import { API } from './api.js';
import { Button } from './components/Button.js';
import { StatusBadge } from './components/StatusBadge.js';
import { Modal, modalScripts } from './components/Modal.js';
import { Input } from './components/Input.js';

// Inject Global Scripts
const script = document.createElement('script');
script.textContent = modalScripts;
document.body.appendChild(script);

let currentUser = JSON.parse(localStorage.getItem('student_user'));
let allProjects = [];

async function init() {
    renderAuth();
    await loadFeed();
    setupModals();
    setupFilters();
}

function renderAuth() {
    const el = document.getElementById('auth-section');
    if (currentUser) {
        el.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-600 hidden sm:inline">สวัสดี, ${currentUser.name}</span>
                ${Button({ text: 'สถานะสมัคร', variant: 'outline', onClick: 'viewDashboard()', className: 'text-xs px-3 py-1.5' })}
                ${Button({ text: '<i class="fa-solid fa-right-from-bracket"></i>', variant: 'secondary', onClick: 'logout()', className: 'px-2 py-1.5 text-danger border-none shadow-none' })}
            </div>
        `;
    } else {
        el.innerHTML = Button({ text: 'เข้าสู่ระบบ', onClick: "openModal('auth-modal')", variant: 'primary', className: 'text-sm px-4 py-1.5' });
    }
}

async function loadFeed() {
    const container = document.getElementById('app-container');
    const res = await API.getProjects();
    allProjects = Array.isArray(res) ? res : (res.data || []);

    renderProjects(allProjects);
    renderDeadlineProjects(allProjects);
}

function renderProjects(projects) {
    const container = document.getElementById('app-container');
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20 text-gray-400">
                <i class="fa-solid fa-folder-open text-5xl mb-4"></i>
                <p>ไม่พบโครงการ</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="space-y-4 animate-fade-in">
            ${projects.map(p => renderFeedCard(p)).join('')}
        </div>
    `;
}

function renderFeedCard(p) {
    const statusMap = {
        'active': { label: 'เปิดรับสมัคร', class: 'bg-blue-100 text-blue-600' },
        'soon': { label: 'เร็วๆ นี้', class: 'bg-amber-100 text-amber-600' },
        'closed': { label: 'ปิดรับสมัคร', class: 'bg-gray-100 text-gray-500' }
    };
    const status = statusMap[p.status] || statusMap['active'];
    const timeAgo = getTimeAgo(p.created_at || new Date());
    
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
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${status.class}">${status.label}</span>
            </div>
            
            <!-- Content -->
            <div class="px-4 pb-3">
                <h3 class="font-bold text-lg text-gray-800 mb-1">
                    ${p.title}
                </h3>
                <p class="text-gray-500 text-sm line-clamp-2 mb-3">${p.desc || ''}</p>
                
                <!-- Meta Info -->
                <div class="flex flex-wrap gap-2 text-xs text-gray-600">
                    ${(p.city || p.country) ? `<span class="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 border border-gray-200 rounded-md"><i class="fa-solid fa-location-dot text-red-400"></i> ${[p.city, p.country].filter(Boolean).join(', ')}</span>` : ''}
                    <span class="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 border border-gray-200 rounded-md"><i class="fa-solid fa-users text-blue-400"></i> รับ ${p.quota || '-'} คน</span>
                    <span class="inline-flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200"><i class="fa-regular fa-calendar text-orange-400"></i> ${formatDateRange(p.start_date, p.end_date)}</span>
                </div>
            </div>
            
            <!-- Image -->
            ${p.image ? `
                <div class="relative">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-64 object-cover">
                </div>
            ` : ''}
            
            <!-- Price & Action -->
            <div class="p-4 flex items-center justify-between border-t border-gray-100">
                <div>
                    ${p.price ? `<div class="flex-row"><p class="text-xs text-gray-400">ค่าเข้าร่วม</p><span class="text-lg font-bold text-primary">${Number(p.price).toLocaleString()} บ.</span></div>` : '<span class="text-sm text-green-600 font-medium">ฟรี ไม่มีค่าใช้จ่าย</span>'}
                </div>
                ${Button({ text: 'รายละเอียด', onClick: `openProjectDetail('${p.id}')`, className: 'text-sm px-5' })}
            </div>
        </div>
    `;
}

function renderDeadlineProjects(projects) {
    const container = document.getElementById('deadline-projects');
    if (!container) return;
    
    const sorted = [...projects]
        .filter(p => p.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400">ไม่มีโครงการ</p>';
        return;
    }
    
    container.innerHTML = sorted.map(p => `
        <div class="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition" onclick="openProjectDetail('${p.id}')">
            <img src="${p.image || 'https://via.placeholder.com/80x60'}" alt="" class="w-16 h-12 object-cover rounded-lg">
            <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-gray-800 line-clamp-1">${p.title}</p>
                <p class="text-xs text-red-500 font-medium">เหลือ ${getDaysLeft(p.deadline)} วัน</p>
            </div>
        </div>
    `).join('');
}

function setupFilters() {
    // Desktop sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            filterProjects(link.dataset.filter);
        });
    });
    
    // Mobile filter links
    document.querySelectorAll('.mobile-filter-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.mobile-filter-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            filterProjects(link.dataset.filter);
            toggleMobileFilter();
        });
    });
}

function filterProjects(filter) {
    let filtered = allProjects;
    
    switch(filter) {
        case 'exchange':
            filtered = allProjects.filter(p => p.category === 'exchange' || (p.location && !p.location.includes('ไทย')));
            break;
        case 'camp':
            filtered = allProjects.filter(p => p.category === 'camp');
            break;
        case 'favorite':
            filtered = [];
            break;
        case 'applied':
            filtered = [];
            break;
        default:
            filtered = allProjects;
    }
    
    renderProjects(filtered);
}

// Helper Functions
function getTimeAgo(date) {
    if (!date) return 'เมื่อสักครู่';
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
}

function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate) return '-';
    
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const day = d.getDate();
        const month = thaiMonths[d.getMonth()];
        const year = (d.getFullYear() + 543) % 100;
        return { day, month, year, fullMonth: d.getMonth() };
    };
    
    if (startDate && endDate) {
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        
        if (start.fullMonth === end.fullMonth) {
            return `${start.day}-${end.day} ${end.month} ${end.year}`;
        }
        return `${start.day} ${start.month} - ${end.day} ${end.month} ${end.year}`;
    }
    
    if (startDate) {
        const start = formatDate(startDate);
        return `${start.day} ${start.month} ${start.year}`;
    }
    
    return '-';
}

function getDaysLeft(deadline) {
    if (!deadline) return 0;
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// Global Functions
window.toggleMobileFilter = () => {
    const modal = document.getElementById('mobile-filter-modal');
    modal.classList.toggle('hidden');
};

window.openProjectDetail = (id) => {
    const project = allProjects.find(p => p.id === id);
    if (project) {
        alert(`เปิดรายละเอียดโครงการ: ${project.title}\n\n(ใส่ Logic Modal รายละเอียดที่นี่)`);
    }
};

window.viewDashboard = () => { alert('เปิดหน้าสถานะการสมัคร'); };

function setupModals() {
    const container = document.getElementById('modal-container');
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

// Global Functions for HTML onclick
window.logout = () => { localStorage.removeItem('student_user'); location.reload(); };
window.openRegister = () => { closeModal('auth-modal'); /* open register logic */ };
window.openLogin = () => { closeModal('auth-modal'); /* open login logic */ };

init();