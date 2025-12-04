import './style.css';
import { API } from './api.js';
import { StatusBadge } from './components/StatusBadge.js';
import { Button } from './components/Button.js';
import { Modal } from './components/Modal.js';

const adminUser = JSON.parse(localStorage.getItem('admin_user'));
if (!adminUser) {
    // ถ้าไม่มีข้อมูล Admin ให้ดีดกลับไปหน้า Login ทันที
    window.location.href = '/admin/login.html';
}
async function init() {
    // 1. ดึงข้อมูลโครงการและผู้สมัคร
    const [projectsRes, applicantsRes] = await Promise.all([
        API.getProjects(),
        // API.getApplicants() // ต้องไปเพิ่มใน GAS ก่อน
        Promise.resolve({ data: [] }) // Mock ไปก่อนถ้ายังไม่แก้ GAS
    ]);

    renderDashboard(projectsRes.data || [], applicantsRes.data || []);
}

function renderDashboard(projects, applicants) {
    const container = document.getElementById('admin-content');
    
    container.innerHTML = `
        ${createProjectModal()}
        <div class="animate-fade-in space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                ${StatCard('โครงการทั้งหมด', projects.length, 'fa-layer-group', 'blue')}
                ${StatCard('ผู้สมัครรอตรวจ', 5, 'fa-clock', 'yellow')}
                ${StatCard('เอกสารไม่ครบ', 2, 'fa-circle-exclamation', 'red')}
                ${StatCard('อนุมัติแล้ว', 12, 'fa-check-circle', 'green')}
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-gray-800">รายการโครงการล่าสุด</h3>
                    ${Button({ text: 'สร้างโครงการ', icon: 'fa-plus', className: 'text-sm py-1.5', onClick: 'openCreateProjectModal()' })}
                </div>
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th class="px-6 py-3 font-medium">ชื่อโครงการ</th>
                            <th class="px-6 py-3 font-medium">สถานะ</th>
                            <th class="px-6 py-3 font-medium">ผู้สมัคร</th>
                            <th class="px-6 py-3 font-medium text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${projects.map(p => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 font-medium text-gray-800">${p.title}</td>
                                <td class="px-6 py-4">${StatusBadge(p.status)}</td>
                                <td class="px-6 py-4 text-gray-500">0 คน</td>
                                <td class="px-6 py-4 text-right">
                                    <button class="text-primary hover:text-blue-800 transition"><i class="fa-solid fa-pen-to-square"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Local Component สำหรับ Admin
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

// Modal Functions
window.openModal = (id) => {
    const el = document.getElementById(id);
    el.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    el.querySelector('div').classList.remove('scale-95');
    el.querySelector('div').classList.add('scale-100');
};

window.closeModal = (id) => {
    const el = document.getElementById(id);
    el.classList.add('opacity-0', 'pointer-events-none');
    el.querySelector('div').classList.add('scale-95');
    setTimeout(() => el.classList.add('hidden'), 300);
};

window.openCreateProjectModal = () => {
    openModal('create-project-modal');
};

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
        description: formData.get('description'),
        status: formData.get('status') || 'active',
        deadline: formData.get('deadline')
    };

    try {
        const res = await API.createProject(data);
        if (res.status === 'success') {
            closeModal('create-project-modal');
            form.reset();
            init(); // Refresh data
            alert('สร้างโครงการสำเร็จ!');
        } else {
            alert(res.message || 'เกิดข้อผิดพลาด');
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

function createProjectModal() {
    return Modal({
        id: 'create-project-modal',
        title: 'สร้างโครงการใหม่',
        content: `
            <form id="create-project-form" onsubmit="handleCreateProject(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">ชื่อโครงการ</label>
                    <input type="text" name="title" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" required placeholder="กรอกชื่อโครงการ">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">รายละเอียด</label>
                    <textarea name="description" rows="3" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none" placeholder="รายละเอียดโครงการ"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">วันหมดเขต</label>
                    <input type="date" name="deadline" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">สถานะ</label>
                    <select name="status" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none">
                        <option value="active">เปิดรับสมัคร</option>
                        <option value="inactive">ปิดรับสมัคร</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeModal('create-project-modal')" class="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                    <button type="submit" class="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-hover shadow-md">บันทึก</button>
                </div>
            </form>
        `
    });
}

init();