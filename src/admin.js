import './style.css';
import { API } from './api.js';
import { StatusBadge } from './components/StatusBadge.js';
import { Button } from './components/Button.js';
import { Modal } from './components/Modal.js';
import { Input } from './components/Input.js'; // สมมติว่ามี Component Input ถ้าไม่มีใช้ HTML string ได้

// --- STATE MANAGEMENT (เก็บค่าชั่วคราวสำหรับ Modal) ---
let tempFields = []; // เก็บรายการข้อมูลที่ต้องกรอก (เช่น เบอร์โทร, โรคประจำตัว)
let tempDocs = [];   // เก็บรายการเอกสารที่ต้องอัปโหลด (เช่น Passport)

// --- AUTH GUARD ---
const adminUser = JSON.parse(localStorage.getItem('admin_user'));
if (!adminUser) {
    window.location.href = '/admin/login.html';
}

// --- INIT ---
async function init() {
    // รีเซ็ต state
    tempFields = []; 
    tempDocs = [];

    // ดึงข้อมูล
    const [projectsRes, applicantsRes] = await Promise.all([
        API.getProjects(),
        // API.getApplicants() || Promise.resolve({ data: [] }) // รอ API จริง
        Promise.resolve({ data: [] }) 
    ]);

    renderDashboard(projectsRes.data || [], applicantsRes.data || []);
}

// --- RENDER DASHBOARD ---
function renderDashboard(projects, applicants) {
    const container = document.getElementById('admin-content');
    
    // Inject Modal HTML (Hidden by default)
    const modalHtml = createProjectModal();

    container.innerHTML = `
        ${modalHtml}
        
        <div class="animate-fade-in space-y-8 pb-10">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                ${StatCard('โครงการทั้งหมด', projects.length, 'fa-layer-group', 'blue')}
                ${StatCard('ผู้สมัครรอตรวจ', 0, 'fa-clock', 'yellow')}
                ${StatCard('เอกสารไม่ครบ', 0, 'fa-circle-exclamation', 'red')}
                ${StatCard('อนุมัติแล้ว', 0, 'fa-check-circle', 'green')}
            </div>

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
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                            <tr>
                                <th class="px-6 py-3 font-medium">ชื่อโครงการ</th>
                                <th class="px-6 py-3 font-medium">สถานที่</th>
                                <th class="px-6 py-3 font-medium">สถานะ</th>
                                <th class="px-6 py-3 font-medium">ผู้สมัคร</th>
                                <th class="px-6 py-3 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            ${projects.length > 0 ? projects.map(p => `
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                            <img src="${p.image}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/150'">
                                        </div>
                                        ${p.title}
                                    </td>
                                    <td class="px-6 py-4 text-gray-500 text-sm">${p.location || '-'}</td>
                                    <td class="px-6 py-4">${StatusBadge(p.status)}</td>
                                    <td class="px-6 py-4 text-gray-500 text-sm">0 / ${p.quota}</td>
                                    <td class="px-6 py-4 text-right">
                                        <button class="text-gray-400 hover:text-primary transition p-2"><i class="fa-solid fa-pen-to-square"></i></button>
                                        <button class="text-gray-400 hover:text-red-500 transition p-2"><i class="fa-solid fa-trash-can"></i></button>
                                    </td>
                                </tr>
                            `).join('') : `<tr><td colspan="5" class="p-8 text-center text-gray-400">ยังไม่มีโครงการ</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// --- MODAL & FORM LOGIC ---

function createProjectModal() {
    // เราใช้ Grid 2 Columns: ซ้าย (Info) ขวา (Config)
    return Modal({
        id: 'create-project-modal',
        title: '<i class="fa-solid fa-folder-plus text-primary mr-2"></i> สร้างโครงการใหม่',
        content: `
            <form id="create-project-form" onsubmit="handleCreateProject(event)" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div class="space-y-4">
                    <h4 class="font-bold text-gray-700 border-b pb-2 mb-4">1. ข้อมูลทั่วไป</h4>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">ชื่อโครงการ <span class="text-red-500">*</span></label>
                        <input type="text" name="title" required class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="เช่น Summer Camp UK 2025">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">สถานที่</label>
                            <input type="text" name="location" class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="เช่น London">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">จำนวนรับ (คน)</label>
                            <input type="number" name="quota" class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="20">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">ค่าเข้าร่วม</label>
                            <input type="text" name="price" class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="120,000">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">วันปิดรับสมัคร <span class="text-red-500">*</span></label>
                            <input type="date" name="deadline" required class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">URL รูปภาพปก</label>
                        <input type="url" name="image" class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="https://...">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">รายละเอียด</label>
                        <textarea name="description" rows="4" class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="รายละเอียดโครงการ..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">สถานะ</label>
                        <select name="status" class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none">
                            <option value="open">เปิดรับสมัคร</option>
                            <option value="coming">เร็วๆ นี้</option>
                            <option value="closed">ปิดรับสมัคร</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-6 bg-gray-50 p-5 rounded-xl border border-gray-200 h-fit">
                    
                    <div>
                        <h4 class="font-bold text-blue-600 border-b border-blue-200 pb-2 mb-3 text-sm uppercase">2. ข้อมูลที่ให้นักเรียนกรอกเพิ่ม</h4>
                        <p class="text-xs text-gray-400 mb-3">* ชื่อ, นามสกุล, เบอร์โทร มีให้อยู่แล้ว</p>
                        
                        <div id="field-list-container" class="space-y-2 mb-3">
                            </div>

                        <div class="flex gap-2">
                            <input type="text" id="new-field-input" placeholder="เช่น โรคประจำตัว, ไซส์เสื้อ" class="flex-1 text-sm border rounded px-2 py-1.5 outline-none focus:border-blue-500">
                            <button type="button" onclick="addTempField()" class="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                    <div>
                        <h4 class="font-bold text-green-600 border-b border-green-200 pb-2 mb-3 text-sm uppercase">3. เอกสารที่ต้องอัปโหลด</h4>
                        
                        <div id="doc-list-container" class="space-y-2 mb-3">
                             </div>

                        <div class="flex gap-2">
                            <input type="text" id="new-doc-input" placeholder="เช่น สำเนา Passport" class="flex-1 text-sm border rounded px-2 py-1.5 outline-none focus:border-green-500">
                            <button type="button" onclick="addTempDoc()" class="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>

                </div>

                <div class="col-span-1 lg:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                    <button type="button" onclick="closeModal('create-project-modal')" class="px-5 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100">ยกเลิก</button>
                    <button type="submit" class="px-6 py-2.5 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover shadow-lg shadow-blue-200">บันทึกโครงการ</button>
                </div>
            </form>
        `
    });
}

// --- DYNAMIC LIST LOGIC (Global Scope) ---

// 1. Manage Form Fields
window.renderFieldList = () => {
    const el = document.getElementById('field-list-container');
    if (!el) return;
    el.innerHTML = tempFields.map((f, i) => `
        <div class="flex justify-between items-center bg-white p-2 border rounded shadow-sm text-sm">
            <span class="text-gray-700"><i class="fa-solid fa-pen-to-square text-blue-300 mr-2"></i> ${f.label}</span>
            <button type="button" onclick="removeTempField(${i})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');
};

window.addTempField = () => {
    const input = document.getElementById('new-field-input');
    const val = input.value.trim();
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

// 2. Manage Documents
window.renderDocList = () => {
    const el = document.getElementById('doc-list-container');
    if (!el) return;
    el.innerHTML = tempDocs.map((d, i) => `
        <div class="flex justify-between items-center bg-white p-2 border rounded shadow-sm text-sm border-l-4 border-l-green-400">
            <span class="text-gray-700"><i class="fa-solid fa-file text-green-500 mr-2"></i> ${d}</span>
            <button type="button" onclick="removeTempDoc(${i})" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');
};

window.addTempDoc = () => {
    const input = document.getElementById('new-doc-input');
    const val = input.value.trim();
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

// --- HANDLERS ---

window.openCreateProjectModal = () => {
    // รีเซ็ตค่าก่อนเปิด
    tempFields = [ {label: 'อีเมล', type: 'email'} ]; // Default ตัวอย่าง
    tempDocs = [ 'สำเนาบัตรประชาชน' ]; // Default ตัวอย่าง
    
    // ต้องรอ Modal เปิดก่อนถึงจะ Render List ได้ (เพราะ Element เพิ่งถูกสร้าง)
    openModal('create-project-modal');
    
    // ใช้ setTimeout นิดนึงเพื่อให้ DOM มาครบ
    setTimeout(() => {
        renderFieldList();
        renderDocList();
    }, 50);
};

window.handleCreateProject = async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังบันทึก...';
    btn.disabled = true;

    const formData = new FormData(form);
    
    // รวมร่างข้อมูล
    const data = {
        title: formData.get('title'),
        location: formData.get('location'),
        quota: formData.get('quota'),
        price: formData.get('price'),
        deadline: formData.get('deadline'),
        image: formData.get('image'),
        desc: formData.get('description'),
        status: formData.get('status'),
        
        // ใส่ Dynamic Config ลงไปด้วย
        formConfig: JSON.stringify(tempFields), 
        docConfig: JSON.stringify(tempDocs)
    };

    try {
        // ใน api.js ต้องมีฟังก์ชัน createProject รองรับ
        // ถ้ายังไม่มีใน API ให้ใช้ console.log(data) ดูโครงสร้างก่อน
        // const res = await API.createProject(data); 
        
        console.log("Sending Data:", data); // Debug ดูข้อมูล
        
        // Mock Success ไว้ก่อน (ต้องไปแก้ api.js และ GAS ให้รับค่าเหล่านี้)
        alert('ส่งข้อมูลเรียบร้อย (Mock)! \nข้อมูล: ' + JSON.stringify(data, null, 2));
        closeModal('create-project-modal');
        form.reset();
        
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

function StatCard(title, value, icon, color) {
    const colors = {
        blue: "text-blue-600 bg-blue-100",
        yellow: "text-yellow-600 bg-yellow-100",
        red: "text-red-600 bg-red-100",
        green: "text-green-600 bg-green-100"
    };
    return `
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition duration-300">
            <div>
                <p class="text-sm text-gray-500 font-medium mb-1">${title}</p>
                <h4 class="text-3xl font-bold text-gray-800">${value}</h4>
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl ${colors[color]}">
                <i class="fa-solid ${icon}"></i>
            </div>
        </div>
    `;
}

init();