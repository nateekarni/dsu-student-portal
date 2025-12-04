/**
 * Admin.js - Admin Dashboard
 */
import './style.css';
import { API } from './api.js';
import { 
    Button, 
    Input, 
    Select,
    Textarea,
    Modal, 
    initModalSystem,
    StatusBadge, 
    StatCard,
    Table,
    EmptyState 
} from './components/index.js';
import { getStorage, setStorage, removeStorage } from './utils.js';

// ===== STATE =====
let tempFields = [];
let tempDocs = [];

// ===== AUTH CHECK =====
const adminUser = getStorage('admin_user');
if (!adminUser) {
    window.location.href = '/admin/login.html';
}

// ===== INITIALIZATION =====
async function init() {
    initModalSystem();
    setupGlobalHandlers();
    await loadDashboard();
}

// ===== GLOBAL HANDLERS =====
function setupGlobalHandlers() {
    // Create Project Modal
    window.openCreateProjectModal = () => {
        tempFields = [{ label: 'อีเมล', type: 'email' }];
        tempDocs = ['สำเนาบัตรประชาชน'];
        
        window.openModal('create-project-modal');
        
        setTimeout(() => {
            renderFieldList();
            renderDocList();
        }, 100);
    };

    // Dynamic Field List
    window.addTempField = () => {
        const input = document.getElementById('new-field-input');
        const val = input?.value.trim();
        if (val) {
            tempFields.push({ label: val, type: 'text' });
            input.value = '';
            renderFieldList();
        }
    };

    window.removeTempField = (index) => {
        tempFields.splice(index, 1);
        renderFieldList();
    };

    // Dynamic Doc List
    window.addTempDoc = () => {
        const input = document.getElementById('new-doc-input');
        const val = input?.value.trim();
        if (val) {
            tempDocs.push(val);
            input.value = '';
            renderDocList();
        }
    };

    window.removeTempDoc = (index) => {
        tempDocs.splice(index, 1);
        renderDocList();
    };

    // Form Submit
    window.handleCreateProject = handleCreateProject;
    
    // Logout
    window.adminLogout = () => {
        removeStorage('admin_user');
        window.location.href = '/admin/login.html';
    };
}

// ===== RENDER DYNAMIC LISTS =====
function renderFieldList() {
    const el = document.getElementById('field-list-container');
    if (!el) return;
    
    el.innerHTML = tempFields.map((f, i) => `
        <div class="flex justify-between items-center bg-white p-2 border rounded shadow-sm text-sm">
            <span class="text-gray-700">
                <i class="fa-solid fa-pen-to-square text-blue-300 mr-2"></i> ${f.label}
            </span>
            <button type="button" onclick="removeTempField(${i})" class="text-red-400 hover:text-red-600">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');
}

function renderDocList() {
    const el = document.getElementById('doc-list-container');
    if (!el) return;
    
    el.innerHTML = tempDocs.map((d, i) => `
        <div class="flex justify-between items-center bg-white p-2 border rounded shadow-sm text-sm border-l-4 border-l-green-400">
            <span class="text-gray-700">
                <i class="fa-solid fa-file text-green-500 mr-2"></i> ${d}
            </span>
            <button type="button" onclick="removeTempDoc(${i})" class="text-red-400 hover:text-red-600">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');
}

// ===== FORM HANDLER =====
async function handleCreateProject(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังบันทึก...';
    btn.disabled = true;

    const formData = new FormData(form);
    const data = {
        title: formData.get('title'),
        city: formData.get('city'),
        country: formData.get('country'),
        quota: formData.get('quota'),
        price: formData.get('price'),
        deadline: formData.get('deadline'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        image: formData.get('image'),
        desc: formData.get('description'),
        status: formData.get('status'),
        formConfig: JSON.stringify(tempFields),
        docConfig: JSON.stringify(tempDocs)
    };

    try {
        await API.createProject(data);
        window.closeModal('create-project-modal');
        form.reset();
        await loadDashboard(); // Refresh data
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const results = await Promise.allSettled([
            API.getProjects(),
        ]);

        const projectsRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
        
        if (results[0].status === 'rejected') {
            console.error("API Error:", results[0].reason);
        }

        renderDashboard(projectsRes.data || [], []);
    } catch (err) {
        console.error("Critical Error:", err);
        renderDashboard([], []);
    }
}

function renderDashboard(projects, applicants) {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        ${createProjectModal()}
        
        <div class="animate-fade-in space-y-8 pb-10">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                ${StatCard({ title: 'โครงการทั้งหมด', value: projects.length, icon: 'fa-layer-group', color: 'blue' })}
                ${StatCard({ title: 'ผู้สมัครรอตรวจ', value: 0, icon: 'fa-clock', color: 'yellow' })}
                ${StatCard({ title: 'เอกสารไม่ครบ', value: 0, icon: 'fa-circle-exclamation', color: 'red' })}
                ${StatCard({ title: 'อนุมัติแล้ว', value: 0, icon: 'fa-check-circle', color: 'green' })}
            </div>

            <!-- Projects Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-800">รายการโครงการล่าสุด</h3>
                    ${Button({ 
                        text: 'สร้างโครงการ', 
                        icon: 'fa-plus', 
                        className: 'text-sm py-2 shadow-sm', 
                        onClick: 'openCreateProjectModal()' 
                    })}
                </div>
                ${Table({
                    headers: ['ชื่อโครงการ', 'สถานะ', 'จัดการ'],
                    rows: projects.map(p => [
                        `<span class="font-medium text-gray-900">${p.title}</span>`,
                        StatusBadge(p.status),
                        `<button class="text-gray-400 hover:text-primary transition p-2"><i class="fa-solid fa-pen-to-square"></i></button>`
                    ]),
                    emptyText: 'ยังไม่มีโครงการ หรือโหลดข้อมูลไม่สำเร็จ',
                    alignLast: 'right'
                })}
            </div>
        </div>
    `;
}

// ===== MODALS =====
function createProjectModal() {
    const statusOptions = [
        { value: 'open', label: 'เปิดรับสมัคร' },
        { value: 'closed', label: 'ปิดรับสมัคร' }
    ];

    return Modal({
        id: 'create-project-modal',
        title: '<i class="fa-solid fa-folder-plus text-blue-600 mr-2"></i> สร้างโครงการใหม่',
        maxWidth: 'max-w-5xl',
        content: `
            <form id="create-project-form" onsubmit="handleCreateProject(event)" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-4">
                    <h4 class="font-bold text-gray-700 border-b pb-2 mb-4">1. ข้อมูลทั่วไป</h4>
                    ${Input({ label: 'ชื่อโครงการ', name: 'title', required: true, placeholder: 'ชื่อโครงการ' })}
                    <div class="grid grid-cols-2 gap-4">
                        ${Input({ label: 'เมือง (City)', name: 'city', placeholder: 'เช่น London, Tokyo' })}
                        ${Input({ label: 'ประเทศ (Country)', name: 'country', placeholder: 'เช่น UK, Japan' })}
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        ${Input({ label: 'จำนวนรับ', name: 'quota', type: 'number' })}
                        ${Input({ label: 'ค่าใช้จ่าย', name: 'price', placeholder: '0 = ฟรี' })}
                    </div>
                    ${Input({ label: 'วันปิดรับสมัคร', name: 'deadline', type: 'date', required: true })}
                    <div class="grid grid-cols-2 gap-4">
                        ${Input({ label: 'วันเริ่มโครงการ', name: 'start_date', type: 'date' })}
                        ${Input({ label: 'วันสิ้นสุดโครงการ', name: 'end_date', type: 'date' })}
                    </div>
                    ${Input({ label: 'URL รูปปก', name: 'image', placeholder: 'https://...' })}
                    ${Textarea({ label: 'รายละเอียด', name: 'description', rows: 3 })}
                    ${Select({ label: 'สถานะ', name: 'status', options: statusOptions })}
                </div>

                <div class="space-y-6 bg-gray-50 p-5 rounded-xl border border-gray-200 h-fit">
                    <div>
                        <h4 class="font-bold text-blue-600 border-b border-blue-200 pb-2 mb-3 text-sm">2. ข้อมูลที่ให้กรอกเพิ่ม</h4>
                        <div id="field-list-container" class="space-y-2 mb-3"></div>
                        <div class="flex gap-2">
                            ${Input({ id: 'new-field-input', placeholder: 'เช่น ไซส์เสื้อ', className: 'flex-1 text-sm' })}
                            ${Button({ text: '<i class="fa-solid fa-plus"></i>', onClick: 'addTempField()', className: 'px-3 py-1' })}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold text-green-600 border-b border-green-200 pb-2 mb-3 text-sm">3. เอกสารที่ต้องอัปโหลด</h4>
                        <div id="doc-list-container" class="space-y-2 mb-3"></div>
                        <div class="flex gap-2">
                            ${Input({ id: 'new-doc-input', placeholder: 'เช่น ปพ.1', className: 'flex-1 text-sm' })}
                            ${Button({ text: '<i class="fa-solid fa-plus"></i>', onClick: 'addTempDoc()', variant: 'success', className: 'px-3 py-1' })}
                        </div>
                    </div>
                </div>

                <div class="col-span-1 lg:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                    ${Button({ text: 'ยกเลิก', variant: 'outline', onClick: "closeModal('create-project-modal')" })}
                    ${Button({ text: 'บันทึกโครงการ', type: 'submit', className: 'shadow-lg shadow-blue-200' })}
                </div>
            </form>
        `
    });
}

// ===== START =====
init();