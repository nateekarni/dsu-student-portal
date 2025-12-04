import './style.css';
import { API } from './api.js';
import { StatusBadge } from './components/StatusBadge.js';
import { Button } from './components/Button.js';

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
                    ${Button({ text: 'สร้างโครงการ', icon: 'fa-plus', className: 'text-sm py-1.5' })}
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

init();