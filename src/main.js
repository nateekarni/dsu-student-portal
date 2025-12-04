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

async function init() {
    renderAuth();
    loadFeed();
    setupModals();
}

function renderAuth() {
    const el = document.getElementById('auth-section');
    if (currentUser) {
        el.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-600 hidden sm:inline">สวัสดี, ${currentUser.name}</span>
                ${Button({ text: 'สถานะสมัคร', variant: 'outline', onClick: 'viewDashboard()', className: 'text-xs px-3 py-1' })}
                ${Button({ text: '<i class="fa-solid fa-right-from-bracket"></i>', variant: 'secondary', onClick: 'logout()', className: 'px-2 py-1 text-danger border-none shadow-none' })}
            </div>
        `;
    } else {
        el.innerHTML = Button({ text: 'เข้าสู่ระบบ', onClick: "openModal('auth-modal')", variant: 'primary', className: 'text-sm' });
    }
}

async function loadFeed() {
    const container = document.getElementById('app-container');
    const res = await API.getProjects();
    // รองรับทั้งกรณี GAS ส่ง Array ตรงๆ หรือ wrap ใน { data: [...] }
    const projects = Array.isArray(res) ? res : (res.data || []);

    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <h1 class="text-2xl font-bold text-gray-800 border-l-4 border-primary pl-3">โครงการที่เปิดรับสมัคร</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${projects.map(p => `
                    <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden group flex flex-col border border-gray-100">
                        <div class="relative h-48 overflow-hidden">
                            <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                            <div class="absolute top-3 right-3 shadow-sm">${StatusBadge(p.status)}</div>
                        </div>
                        <div class="p-5 flex-1 flex flex-col">
                            <h3 class="font-bold text-lg mb-2 text-gray-800 line-clamp-1" title="${p.title}">${p.title}</h3>
                            <p class="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">${p.desc}</p>
                            <div class="flex justify-between items-center text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                                <span><i class="fa-solid fa-users text-primary"></i> ${p.quota} คน</span>
                                <span><i class="fa-regular fa-clock text-accent"></i> ${p.deadline}</span>
                            </div>
                            ${Button({ text: 'ดูรายละเอียด / สมัคร', onClick: `alert('Logic สมัครแบบเดียวกับที่เคยทำครับ แต่ใช้ Component นี้')`, className: 'w-full' })}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function setupModals() {
    const container = document.getElementById('modal-container');
    // เพิ่ม Modal Login และ Modal Register ที่นี่ โดยใช้ Component Modal() และ Input()
    // (ใช้ Logic เดิมที่เคยทำ แต่เปลี่ยนมาใช้ ${Input(...)} แทน HTML ดิบ)
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