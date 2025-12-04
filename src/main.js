/**
 * Main.js - หน้าแสดงรายการโครงการสำหรับนักเรียน
 */
import './style.css';
import { API } from './api.js';
import { 
    Button, 
    Modal, 
    initModalSystem,
    FeedCard, 
    FeedCardCompact, 
    EmptyState 
} from './components/index.js';
import { getStorage, removeStorage } from './utils.js';

// ===== STATE =====
let currentUser = getStorage('student_user');
let allProjects = [];

// ===== INITIALIZATION =====
async function init() {
    initModalSystem();
    renderAuth();
    await loadFeed();
    setupModals();
    setupFilters();
}

// ===== AUTH SECTION =====
function renderAuth() {
    const el = document.getElementById('auth-section');
    if (!el) return;
    
    if (currentUser) {
        el.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-600 hidden sm:inline">สวัสดี, ${currentUser.name}</span>
                ${Button({ text: 'สถานะสมัคร', variant: 'outline', onClick: 'viewDashboard()', className: 'text-xs px-3 py-1.5' })}
                ${Button({ text: '<i class="fa-solid fa-right-from-bracket"></i>', variant: 'secondary', onClick: 'logout()', className: 'px-2 py-1.5 text-danger border-none shadow-none' })}
            </div>
        `;
    } else {
        el.innerHTML = Button({ 
            text: 'เข้าสู่ระบบ', 
            onClick: "openModal('auth-modal')", 
            variant: 'primary', 
            className: 'text-sm px-4 py-1.5' 
        });
    }
}

// ===== FEED SECTION =====
async function loadFeed() {
    const container = document.getElementById('app-container');
    if (!container) return;
    
    try {
        const res = await API.getProjects();
        allProjects = Array.isArray(res) ? res : (res.data || []);
        
        renderProjects(allProjects);
        renderDeadlineProjects(allProjects);
    } catch (err) {
        console.error('Load feed error:', err);
        container.innerHTML = EmptyState({
            icon: 'exclamation-triangle',
            title: 'เกิดข้อผิดพลาด',
            description: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'
        });
    }
}

function renderProjects(projects) {
    const container = document.getElementById('app-container');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = EmptyState({
            icon: 'folder-open',
            title: 'ไม่พบโครงการ',
            description: 'ยังไม่มีโครงการที่เปิดรับสมัครในขณะนี้'
        });
        return;
    }

    container.innerHTML = `
        <div class="space-y-4 animate-fade-in">
            ${projects.map(p => FeedCard(p)).join('')}
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
    
    container.innerHTML = sorted.map(p => FeedCardCompact(p)).join('');
}

// ===== FILTERS =====
function setupFilters() {
    // Desktop sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveFilter(link, '.sidebar-link');
            filterProjects(link.dataset.filter);
        });
    });
    
    // Mobile filter links
    document.querySelectorAll('.mobile-filter-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveFilter(link, '.mobile-filter-link');
            filterProjects(link.dataset.filter);
            toggleMobileFilter();
        });
    });
}

function setActiveFilter(activeLink, selector) {
    document.querySelectorAll(selector).forEach(l => l.classList.remove('active'));
    activeLink.classList.add('active');
}

function filterProjects(filter) {
    const filters = {
        'exchange': p => p.category === 'exchange' || (p.country && !p.country.includes('ไทย')),
        'camp': p => p.category === 'camp',
        'favorite': () => false,
        'applied': () => false,
        'all': () => true
    };
    
    const filterFn = filters[filter] || filters['all'];
    const filtered = allProjects.filter(filterFn);
    
    renderProjects(filtered);
}

// ===== MODALS =====
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

// ===== GLOBAL FUNCTIONS =====
window.toggleMobileFilter = () => {
    const modal = document.getElementById('mobile-filter-modal');
    if (modal) modal.classList.toggle('hidden');
};

window.openProjectDetail = (id) => {
    // ไปยังหน้าแสดงรายละเอียดโครงการ พร้อม query id
    location.href = `/project.html?id=${encodeURIComponent(id)}`;
};

window.viewDashboard = () => alert('เปิดหน้าสถานะการสมัคร');
window.logout = () => { removeStorage('student_user'); location.reload(); };
window.openRegister = () => { closeModal('auth-modal'); };
window.openLogin = () => { closeModal('auth-modal'); };

// ===== START =====
init();