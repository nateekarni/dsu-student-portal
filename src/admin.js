import './style.css';
import { API } from './api.js';
import { StatusBadge } from './components/StatusBadge.js';
import { Button } from './components/Button.js';
import { Modal } from './components/Modal.js';
import { Input } from './components/Input.js';

// --- 1. GLOBAL HELPERS (ประกาศใส่ window ทันทีที่ไฟล์โหลด) ---

// Modal Logic
window.openModal = (id) => {
    const el = document.getElementById(id);
    if (!el) { console.error(`Modal #${id} not found`); return; }
    el.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    el.querySelector('div').classList.remove('scale-95');
    el.querySelector('div').classList.add('scale-100');
};

window.closeModal = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('opacity-0', 'pointer-events-none');
    el.querySelector('div').classList.add('scale-95');
    setTimeout(() => el.classList.add('hidden'), 300);
};

// Create Project Logic
window.openCreateProjectModal = () => {
    // รีเซ็ตค่า State
    window.tempFields = [ {label: 'อีเมล', type: 'email'} ]; 
    window.tempDocs = [ 'สำเนาบัตรประชาชน' ]; 
    
    // เปิด Modal
    window.openModal('create-project-modal');
    
    // Render List ข้างใน (รอ DOM สร้างเสร็จแป๊บนึง)
    setTimeout(() => {
        window.renderFieldList();
        window.renderDocList();
    }, 100);
};

// --- 2. DYNAMIC LIST STATE & LOGIC ---
window.tempFields = [];
window.tempDocs = [];

window.renderFieldList = () => {
    const el = document.getElementById('field-list-container');
    if (!el) return;
    el.innerHTML = window.tempFields.map((f, i) => `
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
        window.tempFields.push({ label: val, type: 'text' });
        input.value = '';
        window.renderFieldList();
    }
};

window.removeTempField = (index) => {
    window.tempFields.splice(index, 1);
    window.renderFieldList();
};

window.renderDocList = () => {
    const el = document.getElementById('doc-list-container');
    if (!el) return;
    el.innerHTML = window.tempDocs.map((d, i) => `
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
        window.tempDocs.push(val);
        input.value = '';
        window.renderDocList();
    }
};

window.removeTempDoc = (index) => {
    window.tempDocs.splice(index, 1);
    window.renderDocList();
};

// Form Submit Handler
window.handleCreateProject = async (e) => {
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
        formConfig: JSON.stringify(window.tempFields), 
        docConfig: JSON.stringify(window.tempDocs)
    };

    try {
        console.log("Sending Data:", data);
        const res = await API.createProject(data); // เรียก API จริง
        alert('Mock Submit Success!\n' + JSON.stringify(data, null, 2));
        window.closeModal('create-project-modal');
        form.reset();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// --- 3. INIT LOGIC ---

// Auth Check
const adminUser = JSON.parse(localStorage.getItem('admin_user'));
if (!adminUser) {
    window.location.href = '/admin/login.html';
}

async function init() {
    try {
        // ใช้ Promise.allSettled เพื่อให้หน้าเว็บไม่พังถ้า API ตัวใดตัวหนึ่ง error
        const results = await Promise.allSettled([
            API.getProjects(),
            // API.getApplicants() 
        ]);

        const projectsRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
        
        // ถ้า API Error ให้ Log ดู แต่ยัง Render หน้าเว็บต่อ
        if (results[0].status === 'rejected') {
            console.error("API Error:", results[0].reason);
        }

        renderDashboard(projectsRes.data || [], []);
        
    } catch (err) {
        console.error("Critical Error:", err);
        renderDashboard([], []); // Render หน้าว่างๆ ไปก่อน ดีกว่าหน้าขาว
    }
}

function renderDashboard(projects, applicants) {
    const container = document.getElementById('admin-content');
    
    // Inject Modal HTML (สร้าง Modal รอไว้เลย)
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
                        onClick: 'openCreateProjectModal()' // เรียก Global Function
                    })}
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                            <tr>
                                <th class="px-6 py-3 font-medium">ชื่อโครงการ</th>
                                <th class="px-6 py-3 font-medium">สถานะ</th>
                                <th class="px-6 py-3 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            ${projects.length > 0 ? projects.map(p => `
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="px-6 py-4 font-medium text-gray-900">${p.title}</td>
                                    <td class="px-6 py-4">${StatusBadge(p.status)}</td>
                                    <td class="px-6 py-4 text-right">
                                        <button class="text-gray-400 hover:text-primary transition p-2"><i class="fa-solid fa-pen-to-square"></i></button>
                                    </td>
                                </tr>
                            `).join('') : `<tr><td colspan="3" class="p-8 text-center text-gray-400">ยังไม่มีโครงการ หรือโหลดข้อมูลไม่สำเร็จ</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// --- COMPONENTS ---

function createProjectModal() {
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
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">รายละเอียด</label>
                        <textarea name="description" rows="3" class="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-1">สถานะ</label>
                        <select name="status" class="w-full border border-gray-300 rounded-lg p-2.5 outline-none">
                            <option value="open">เปิดรับสมัคร</option>
                            <option value="closed">ปิดรับสมัคร</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-6 bg-gray-50 p-5 rounded-xl border border-gray-200 h-fit">
                    <div>
                        <h4 class="font-bold text-blue-600 border-b border-blue-200 pb-2 mb-3 text-sm">2. ข้อมูลที่ให้กรอกเพิ่ม</h4>
                        <div id="field-list-container" class="space-y-2 mb-3"></div>
                        <div class="flex gap-2">
                            <input type="text" id="new-field-input" placeholder="เช่น ไซส์เสื้อ" class="flex-1 text-sm border rounded px-2 py-1.5 outline-none">
                            <button type="button" onclick="addTempField()" class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold text-green-600 border-b border-green-200 pb-2 mb-3 text-sm">3. เอกสารที่ต้องอัปโหลด</h4>
                        <div id="doc-list-container" class="space-y-2 mb-3"></div>
                        <div class="flex gap-2">
                            <input type="text" id="new-doc-input" placeholder="เช่น ปพ.1" class="flex-1 text-sm border rounded px-2 py-1.5 outline-none">
                            <button type="button" onclick="addTempDoc()" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"><i class="fa-solid fa-plus"></i></button>
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