/**
 * Admin.js - Admin Dashboard
 */
import './style.css';
import { API } from './api/index.js';
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
import { getStorage, setStorage, removeStorage } from './utils/index.js';

// ===== STATE =====
let tempFields = [];
let tempDocs = [];
let cachedProjects = [];
let cachedApplicants = [];
let currentView = 'dashboard'; // dashboard, applicants, review

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
    window.handleEditProject = handleEditProject;
    window.openEditProjectModal = openEditProjectModal;
    
    // Applicant & Document Review
    window.showApplicantList = showApplicantList;
    window.showDocumentReview = showDocumentReview;
    window.backToDashboard = backToDashboard;
    window.approveDocument = approveDocument;
    window.openRejectDocModal = openRejectDocModal;
    window.handleRejectDoc = handleRejectDoc;
    window.approveApplicant = approveApplicant;
    window.openRejectApplicantModal = openRejectApplicantModal;
    window.handleRejectApplicant = handleRejectApplicant;
    window.previewDocument = previewDocument;
    window.closePreviewModal = closePreviewModal;
    
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
            API.getApplicants(),
        ]);

        const projectsRes = results[0].status === 'fulfilled' ? results[0].value : [];
        const applicantsRes = results[1].status === 'fulfilled' ? results[1].value : [];
        
        // รองรับทั้ง Array และ { data: [...] }
        cachedProjects = Array.isArray(projectsRes) ? projectsRes : (projectsRes.data || []);
        cachedApplicants = Array.isArray(applicantsRes) ? applicantsRes : (applicantsRes.data || []);

        renderDashboard(cachedProjects, cachedApplicants);
    } catch (err) {
        console.error("Critical Error:", err);
        renderDashboard([], []);
    }
}

function renderDashboard(projects, applicants) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    currentView = 'dashboard';

    // คำนวณสถิติจาก applicants
    const pendingCount = applicants.filter(a => a.status === 'pending').length;
    const missingDocsCount = applicants.filter(a => a.documents?.some(d => d.status === 'missing' || d.status === 'rejected')).length;
    const approvedCount = applicants.filter(a => a.status === 'approved').length;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    const formatDateRange = (start, end) => {
        if (!start || !end) return '-';
        const s = new Date(start);
        const e = new Date(end);
        const sStr = s.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        const eStr = e.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        return `${sStr} - ${eStr}`;
    };

    container.innerHTML = `
        ${createProjectModal()}
        ${createEditProjectModal()}
        
        <div class="animate-fade-in space-y-8 pb-10">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                ${StatCard({ title: 'โครงการทั้งหมด', value: projects.length, icon: 'fa-layer-group', color: 'blue' })}
                ${StatCard({ title: 'ผู้สมัครรอตรวจ', value: pendingCount, icon: 'fa-clock', color: 'yellow', onClick: 'showApplicantList("pending")' })}
                ${StatCard({ title: 'เอกสารไม่ครบ', value: missingDocsCount, icon: 'fa-circle-exclamation', color: 'red', onClick: 'showApplicantList("missing")' })}
                ${StatCard({ title: 'อนุมัติแล้ว', value: approvedCount, icon: 'fa-check-circle', color: 'green', onClick: 'showApplicantList("approved")' })}
            </div>

            <!-- Projects Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-800">รายการโครงการ</h3>
                    ${Button({ 
                        text: 'สร้างโครงการ', 
                        icon: 'fa-plus', 
                        className: 'text-sm py-2 shadow-sm', 
                        onClick: 'openCreateProjectModal()' 
                    })}
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                            <tr>
                                <th class="px-4 py-3 font-medium">ชื่อโครงการ</th>
                                <th class="px-4 py-3 font-medium">สถานที่</th>
                                <th class="px-4 py-3 font-medium">ช่วงเวลา</th>
                                <th class="px-4 py-3 font-medium text-center">จำนวนรับ</th>
                                <th class="px-4 py-3 font-medium">ปิดรับสมัคร</th>
                                <th class="px-4 py-3 font-medium text-center">สถานะ</th>
                                <th class="px-4 py-3 font-medium text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            ${projects.length > 0 ? projects.map(p => `
                                <tr class="hover:bg-gray-50 transition">
                                    <td class="px-4 py-4">
                                        <span class="font-medium text-gray-900">${p.title}</span>
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-600">
                                        ${p.city || '-'}, ${p.country || '-'}
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-600">
                                        ${formatDateRange(p.start_date, p.end_date)}
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-600 text-center">
                                        ${p.quota || '-'} คน
                                    </td>
                                    <td class="px-4 py-4 text-sm text-gray-600">
                                        ${formatDate(p.deadline)}
                                    </td>
                                    <td class="px-4 py-4 text-center">
                                        ${StatusBadge(p.status)}
                                    </td>
                                    <td class="px-4 py-4 text-right">
                                        <button onclick="openEditProjectModal('${p.id}')" class="text-gray-400 hover:text-primary transition p-2" title="แก้ไข">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="7" class="p-8 text-center text-gray-400">
                                        ยังไม่มีโครงการ
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ===== APPLICANT LIST =====
function showApplicantList(filter = 'all') {
    console.log('showApplicantList called with filter:', filter);
    console.log('cachedApplicants:', cachedApplicants);
    
    const container = document.getElementById('admin-content');
    if (!container) return;
    currentView = 'applicants';

    let filteredApplicants = cachedApplicants;
    let filterTitle = 'ผู้สมัครทั้งหมด';
    
    if (filter === 'pending') {
        filteredApplicants = cachedApplicants.filter(a => a.status === 'pending');
        filterTitle = 'ผู้สมัครรอตรวจ';
    } else if (filter === 'missing') {
        filteredApplicants = cachedApplicants.filter(a => a.documents?.some(d => d.status === 'missing' || d.status === 'rejected'));
        filterTitle = 'เอกสารไม่ครบ';
    } else if (filter === 'approved') {
        filteredApplicants = cachedApplicants.filter(a => a.status === 'approved');
        filterTitle = 'อนุมัติแล้ว';
    }

    // Group by project
    const groupedByProject = {};
    filteredApplicants.forEach(a => {
        const key = a.projectId;
        if (!groupedByProject[key]) {
            groupedByProject[key] = {
                projectId: a.projectId,
                projectTitle: a.projectTitle,
                applicants: []
            };
        }
        groupedByProject[key].applicants.push(a);
    });
    const projectGroups = Object.values(groupedByProject);

    const getStatusBadge = (status) => {
        const badges = {
            'pending': '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">รอตรวจ</span>',
            'reviewing': '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">กำลังตรวจ</span>',
            'approved': '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">อนุมัติ</span>',
            'rejected': '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">ไม่ผ่าน</span>'
        };
        return badges[status] || badges['pending'];
    };

    const getDocSummary = (docs) => {
        if (!docs || docs.length === 0) return '<span class="text-gray-400">ไม่มีเอกสาร</span>';
        const approved = docs.filter(d => d.status === 'approved').length;
        const pending = docs.filter(d => d.status === 'pending').length;
        const rejected = docs.filter(d => d.status === 'rejected').length;
        const missing = docs.filter(d => d.status === 'missing').length;
        
        let html = '<div class="flex gap-2 flex-wrap">';
        if (approved > 0) html += `<span class="text-xs text-green-600"><i class="fa-solid fa-check"></i> ${approved}</span>`;
        if (pending > 0) html += `<span class="text-xs text-yellow-600"><i class="fa-solid fa-clock"></i> ${pending}</span>`;
        if (rejected > 0) html += `<span class="text-xs text-red-600"><i class="fa-solid fa-times"></i> ${rejected}</span>`;
        if (missing > 0) html += `<span class="text-xs text-gray-400"><i class="fa-solid fa-minus"></i> ${missing}</span>`;
        html += '</div>';
        return html;
    };

    const renderApplicantCard = (a) => `
        <div onclick="showDocumentReview('${a.id}')" class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary/30 transition cursor-pointer">
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        ${a.student.firstName.charAt(0)}${a.student.lastName.charAt(0)}
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${a.student.firstName} ${a.student.lastName}</h4>
                        <p class="text-sm text-gray-500">${a.student.studentId} • ${a.student.class}</p>
                    </div>
                </div>
                <div class="text-right">
                    ${getStatusBadge(a.status)}
                    <div class="mt-2">${getDocSummary(a.documents)}</div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="animate-fade-in space-y-6 pb-10">
            <!-- Header -->
            <div class="flex items-center gap-4">
                <button onclick="backToDashboard()" class="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition">
                    <i class="fa-solid fa-arrow-left text-gray-600"></i>
                </button>
                <div>
                    <h2 class="text-xl font-bold text-gray-800">${filterTitle}</h2>
                    <p class="text-sm text-gray-500">${filteredApplicants.length} รายการ จาก ${projectGroups.length} โครงการ</p>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-2 flex-wrap">
                <button onclick="showApplicantList('all')" class="px-4 py-2 text-sm rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">
                    ทั้งหมด
                </button>
                <button onclick="showApplicantList('pending')" class="px-4 py-2 text-sm rounded-lg ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">
                    รอตรวจ
                </button>
                <button onclick="showApplicantList('missing')" class="px-4 py-2 text-sm rounded-lg ${filter === 'missing' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">
                    เอกสารไม่ครบ
                </button>
                <button onclick="showApplicantList('approved')" class="px-4 py-2 text-sm rounded-lg ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}">
                    อนุมัติแล้ว
                </button>
            </div>

            <!-- Applicants grouped by Project -->
            ${filteredApplicants.length === 0 ? `
                <div class="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <i class="fa-solid fa-inbox text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">ไม่มีรายการ</p>
                </div>
            ` : projectGroups.map(group => `
                <div class="space-y-3">
                    <!-- Project Header -->
                    <div class="flex items-center gap-3 px-1">
                        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <i class="fa-solid fa-folder-open text-primary"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-gray-800">${group.projectTitle}</h3>
                            <p class="text-xs text-gray-500">${group.applicants.length} คน</p>
                        </div>
                    </div>
                    <!-- Applicant Cards -->
                    <div class="grid gap-3 pl-11">
                        ${group.applicants.map(a => renderApplicantCard(a)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== DOCUMENT REVIEW =====
function showDocumentReview(applicantId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    currentView = 'review';

    const applicant = cachedApplicants.find(a => a.id === applicantId);
    if (!applicant) {
        alert('ไม่พบข้อมูลผู้สมัคร');
        return;
    }

    const { student, documents, projectTitle, status, appliedAt } = applicant;

    const getDocStatusBadge = (status) => {
        const badges = {
            'pending': '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700"><i class="fa-solid fa-clock mr-1"></i>รอตรวจ</span>',
            'approved': '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"><i class="fa-solid fa-check mr-1"></i>ผ่าน</span>',
            'rejected': '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"><i class="fa-solid fa-times mr-1"></i>ไม่ผ่าน</span>',
            'missing': '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500"><i class="fa-solid fa-minus mr-1"></i>ยังไม่อัปโหลด</span>'
        };
        return badges[status] || badges['pending'];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    container.innerHTML = `
        ${createRejectModal()}
        
        <div class="animate-fade-in space-y-6 pb-10">
            <!-- Header -->
            <div class="flex items-center gap-4">
                <button onclick="showApplicantList('pending')" class="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition">
                    <i class="fa-solid fa-arrow-left text-gray-600"></i>
                </button>
                <div>
                    <h2 class="text-xl font-bold text-gray-800">ตรวจสอบเอกสาร</h2>
                    <p class="text-sm text-gray-500">${student.firstName} ${student.lastName}</p>
                </div>
            </div>

            <!-- Main Content: 2 Columns -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Column: Info -->
                <div class="lg:col-span-1 space-y-4">
                    <!-- Project Info -->
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-folder-open text-primary"></i>
                            ข้อมูลโครงการ
                        </h3>
                        <div class="space-y-2 text-sm">
                            <p class="text-gray-600">
                                <span class="text-gray-400">โครงการ:</span><br>
                                <span class="font-medium text-gray-800">${projectTitle}</span>
                            </p>
                            <p class="text-gray-600">
                                <span class="text-gray-400">วันที่สมัคร:</span><br>
                                <span class="font-medium text-gray-800">${formatDate(appliedAt)}</span>
                            </p>
                        </div>
                    </div>

                    <!-- Student Info -->
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-user text-primary"></i>
                            ข้อมูลนักศึกษา
                        </h3>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                            </div>
                            <div>
                                <h4 class="font-semibold text-gray-800">${student.firstName} ${student.lastName}</h4>
                                <p class="text-sm text-gray-500">${student.class}</p>
                            </div>
                        </div>
                        <div class="space-y-3 text-sm border-t border-gray-100 pt-4">
                            <div class="flex justify-between">
                                <span class="text-gray-400">รหัสนักศึกษา</span>
                                <span class="font-medium text-gray-800">${student.studentId}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">วันเกิด</span>
                                <span class="font-medium text-gray-800">${student.dob || '-'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">อีเมล</span>
                                <span class="font-medium text-gray-800 text-xs">${student.email}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">เบอร์โทร</span>
                                <span class="font-medium text-gray-800">${student.phone}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Overall Actions -->
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-gavel text-primary"></i>
                            การอนุมัติ
                        </h3>
                        <div class="space-y-3">
                            <button onclick="approveApplicant('${applicantId}')" class="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2">
                                <i class="fa-solid fa-check-circle"></i>
                                อนุมัติใบสมัคร
                            </button>
                            <button onclick="openRejectApplicantModal('${applicantId}')" class="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2">
                                <i class="fa-solid fa-times-circle"></i>
                                ไม่อนุมัติใบสมัคร
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Documents -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 class="font-bold text-gray-700 flex items-center gap-2">
                                <i class="fa-solid fa-file-alt text-primary"></i>
                                เอกสารที่อัปโหลด
                                <span class="text-sm font-normal text-gray-400">(${documents.length} รายการ)</span>
                            </h3>
                        </div>
                        <div class="divide-y divide-gray-100">
                            ${documents.length === 0 ? `
                                <div class="p-8 text-center text-gray-400">
                                    <i class="fa-solid fa-folder-open text-4xl mb-3"></i>
                                    <p>ยังไม่มีเอกสารที่อัปโหลด</p>
                                </div>
                            ` : documents.map(doc => `
                                <div class="p-5">
                                    <div class="flex items-start justify-between gap-4">
                                        <div class="flex items-start gap-4 flex-1">
                                            <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <i class="fa-solid fa-file-pdf text-blue-500 text-xl"></i>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <h4 class="font-medium text-gray-800">${doc.name}</h4>
                                                <p class="text-sm text-gray-500 truncate">${doc.fileName || '-'}</p>
                                                <div class="flex items-center gap-3 mt-2">
                                                    ${getDocStatusBadge(doc.status)}
                                                    ${doc.uploadedAt ? `<span class="text-xs text-gray-400">${formatDate(doc.uploadedAt)}</span>` : ''}
                                                </div>
                                                ${doc.rejectReason ? `
                                                    <div class="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                                                        <i class="fa-solid fa-exclamation-circle mr-1"></i>
                                                        ${doc.rejectReason}
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2 flex-shrink-0">
                                            ${doc.status !== 'missing' ? `
                                                <button onclick="previewDocument('${applicantId}', '${doc.id}')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition" title="ดูเอกสาร">
                                                    <i class="fa-solid fa-eye"></i>
                                                </button>
                                            ` : ''}
                                            ${doc.status === 'pending' || doc.status === 'rejected' ? `
                                                <button onclick="approveDocument('${applicantId}', '${doc.id}')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition" title="อนุมัติ">
                                                    <i class="fa-solid fa-check"></i>
                                                </button>
                                            ` : ''}
                                            ${doc.status === 'pending' || doc.status === 'approved' ? `
                                                <button onclick="openRejectDocModal('${applicantId}', '${doc.id}', '${doc.name}')" class="w-9 h-9 flex items-center justify-center rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition" title="ไม่อนุมัติ">
                                                    <i class="fa-solid fa-times"></i>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== REJECT MODAL =====
function createRejectModal() {
    return Modal({
        id: 'reject-doc-modal',
        title: '<i class="fa-solid fa-times-circle text-red-500 mr-2"></i> ไม่อนุมัติเอกสาร',
        maxWidth: 'max-w-md',
        content: `
            <form id="reject-doc-form" onsubmit="handleRejectDoc(event)" class="space-y-4">
                <input type="hidden" id="reject-applicant-id" />
                <input type="hidden" id="reject-doc-id" />
                <p class="text-gray-600">คุณกำลังจะไม่อนุมัติเอกสาร: <strong id="reject-doc-name"></strong></p>
                ${Textarea({ 
                    label: 'เหตุผลที่ไม่อนุมัติ', 
                    name: 'reject_reason', 
                    id: 'reject-reason-input',
                    rows: 3, 
                    required: true,
                    placeholder: 'กรุณาระบุเหตุผล เช่น เอกสารไม่ชัด, ข้อมูลไม่ถูกต้อง...'
                })}
                <div class="flex justify-end gap-3 pt-2">
                    ${Button({ text: 'ยกเลิก', variant: 'outline', onClick: "closeModal('reject-doc-modal')" })}
                    ${Button({ text: 'ยืนยันไม่อนุมัติ', type: 'submit', variant: 'danger', className: 'shadow-lg' })}
                </div>
            </form>
        `
    }) + Modal({
        id: 'reject-applicant-modal',
        title: '<i class="fa-solid fa-user-times text-red-500 mr-2"></i> ไม่อนุมัติใบสมัคร',
        maxWidth: 'max-w-md',
        content: `
            <form id="reject-applicant-form" onsubmit="handleRejectApplicant(event)" class="space-y-4">
                <input type="hidden" id="reject-applicant-id-main" />
                <p class="text-gray-600">คุณกำลังจะไม่อนุมัติใบสมัครของผู้สมัครรายนี้ การดำเนินการนี้จะแจ้งให้ผู้สมัครทราบทางอีเมล</p>
                ${Textarea({ 
                    label: 'เหตุผลที่ไม่อนุมัติ', 
                    name: 'reject_applicant_reason', 
                    id: 'reject-applicant-reason-input',
                    rows: 3, 
                    required: true,
                    placeholder: 'กรุณาระบุเหตุผล...'
                })}
                <div class="flex justify-end gap-3 pt-2">
                    ${Button({ text: 'ยกเลิก', variant: 'outline', onClick: "closeModal('reject-applicant-modal')" })}
                    ${Button({ text: 'ยืนยันไม่อนุมัติ', type: 'submit', variant: 'danger', className: 'shadow-lg' })}
                </div>
            </form>
        `
    });
}

// ===== DOCUMENT ACTIONS =====
async function approveDocument(applicantId, docId) {
    try {
        await API.updateDocStatus(docId, 'approved');
        
        // Update local cache
        const applicant = cachedApplicants.find(a => a.id === applicantId);
        if (applicant) {
            const doc = applicant.documents.find(d => d.id === docId);
            if (doc) {
                doc.status = 'approved';
                doc.reviewedAt = new Date().toISOString();
            }
        }
        
        // Refresh view
        showDocumentReview(applicantId);
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}

function openRejectDocModal(applicantId, docId, docName) {
    document.getElementById('reject-applicant-id').value = applicantId;
    document.getElementById('reject-doc-id').value = docId;
    document.getElementById('reject-doc-name').textContent = docName;
    document.getElementById('reject-reason-input').value = '';
    window.openModal('reject-doc-modal');
}

async function handleRejectDoc(e) {
    e.preventDefault();
    const applicantId = document.getElementById('reject-applicant-id').value;
    const docId = document.getElementById('reject-doc-id').value;
    const reason = document.getElementById('reject-reason-input').value.trim();

    if (!reason) {
        alert('กรุณาระบุเหตุผล');
        return;
    }

    try {
        await API.updateDocStatus(docId, 'rejected', reason);
        
        // Update local cache
        const applicant = cachedApplicants.find(a => a.id === applicantId);
        if (applicant) {
            const doc = applicant.documents.find(d => d.id === docId);
            if (doc) {
                doc.status = 'rejected';
                doc.rejectReason = reason;
                doc.reviewedAt = new Date().toISOString();
            }
        }
        
        window.closeModal('reject-doc-modal');
        showDocumentReview(applicantId);
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}

// ===== APPLICANT ACTIONS =====
async function approveApplicant(applicantId) {
    if (!confirm('ยืนยันอนุมัติใบสมัครนี้?')) return;
    
    try {
        await API.updateApplicantStatus(applicantId, 'approved');
        
        // Update local cache
        const applicant = cachedApplicants.find(a => a.id === applicantId);
        if (applicant) {
            applicant.status = 'approved';
        }
        
        alert('อนุมัติใบสมัครเรียบร้อยแล้ว');
        showApplicantList('approved');
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}

function openRejectApplicantModal(applicantId) {
    document.getElementById('reject-applicant-id-main').value = applicantId;
    document.getElementById('reject-applicant-reason-input').value = '';
    window.openModal('reject-applicant-modal');
}

async function handleRejectApplicant(e) {
    e.preventDefault();
    const applicantId = document.getElementById('reject-applicant-id-main').value;
    const reason = document.getElementById('reject-applicant-reason-input').value.trim();

    if (!reason) {
        alert('กรุณาระบุเหตุผล');
        return;
    }

    try {
        await API.updateApplicantStatus(applicantId, 'rejected', reason);
        
        // Update local cache
        const applicant = cachedApplicants.find(a => a.id === applicantId);
        if (applicant) {
            applicant.status = 'rejected';
            applicant.notes = reason;
        }
        
        window.closeModal('reject-applicant-modal');
        alert('ไม่อนุมัติใบสมัครเรียบร้อยแล้ว');
        showApplicantList('pending');
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
}

function previewDocument(applicantId, docId) {
    // หา document จาก cache
    const applicant = cachedApplicants.find(a => a.id === applicantId);
    if (!applicant) return;
    
    const doc = applicant.documents.find(d => d.id === docId);
    if (!doc || !doc.fileUrl) {
        alert('ไม่พบไฟล์เอกสาร');
        return;
    }
    
    // สร้าง modal สำหรับแสดงรูป
    const existingModal = document.getElementById('preview-doc-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'preview-doc-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/70" onclick="closePreviewModal()"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div>
                    <h3 class="font-bold text-gray-800">${doc.name}</h3>
                    <p class="text-sm text-gray-500">${doc.fileName || ''}</p>
                </div>
                <button onclick="closePreviewModal()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition">
                    <i class="fa-solid fa-times text-gray-600 text-xl"></i>
                </button>
            </div>
            <div class="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-gray-100">
                <img src="${doc.fileUrl}" alt="${doc.name}" class="max-w-full h-auto mx-auto rounded-lg shadow-lg" onerror="this.onerror=null; this.src='https://via.placeholder.com/800x600?text=ไม่สามารถโหลดรูปได้';" />
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closePreviewModal() {
    const modal = document.getElementById('preview-doc-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function backToDashboard() {
    renderDashboard(cachedProjects, cachedApplicants);
}

// ===== MODALS =====
function createProjectModal() {
    const statusOptions = [
        { value: 'open', label: 'เปิดรับสมัคร' },
        { value: 'closed', label: 'ปิดรับสมัคร' },
        { value: 'soon', label: 'เร็วๆ นี้' }
    ];

    return Modal({
        id: 'create-project-modal',
        title: '<i class="fa-solid fa-folder-plus text-blue-600 mr-2"></i> สร้างโครงการใหม่',
        maxWidth: 'max-w-5xl',
        content: `
            <form id="create-project-form" onsubmit="handleCreateProject(event)" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-4">
                    <h4 class="font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4">1. ข้อมูลทั่วไป</h4>
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

                <div class="col-span-1 lg:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-200 mt-2">
                    ${Button({ text: 'ยกเลิก', variant: 'outline', onClick: "closeModal('create-project-modal')" })}
                    ${Button({ text: 'บันทึกโครงการ', type: 'submit', className: 'shadow-lg shadow-blue-200' })}
                </div>
            </form>
        `
    });
}

function createEditProjectModal() {
    const statusOptions = [
        { value: 'open', label: 'เปิดรับสมัคร' },
        { value: 'closed', label: 'ปิดรับสมัคร' },
        { value: 'soon', label: 'เร็วๆ นี้' }
    ];

    return Modal({
        id: 'edit-project-modal',
        title: '<i class="fa-solid fa-pen-to-square text-blue-600 mr-2"></i> แก้ไขโครงการ',
        maxWidth: 'max-w-3xl',
        content: `
            <form id="edit-project-form" onsubmit="handleEditProject(event)" class="space-y-6">
                <input type="hidden" name="project_id" id="edit-project-id" />
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Input({ label: 'ชื่อโครงการ', name: 'title', id: 'edit-title', required: true })}
                    ${Select({ label: 'สถานะ', name: 'status', id: 'edit-status', options: statusOptions })}
                </div>

                <div class="grid grid-cols-2 gap-4">
                    ${Input({ label: 'เมือง (City)', name: 'city', id: 'edit-city' })}
                    ${Input({ label: 'ประเทศ (Country)', name: 'country', id: 'edit-country' })}
                </div>

                <div class="grid grid-cols-2 gap-4">
                    ${Input({ label: 'จำนวนรับ', name: 'quota', id: 'edit-quota', type: 'number' })}
                    ${Input({ label: 'ค่าใช้จ่าย (บาท)', name: 'price', id: 'edit-price', type: 'number' })}
                </div>

                <div class="grid grid-cols-3 gap-4">
                    ${Input({ label: 'วันปิดรับสมัคร', name: 'deadline', id: 'edit-deadline', type: 'date' })}
                    ${Input({ label: 'วันเริ่มโครงการ', name: 'start_date', id: 'edit-start-date', type: 'date' })}
                    ${Input({ label: 'วันสิ้นสุด', name: 'end_date', id: 'edit-end-date', type: 'date' })}
                </div>

                ${Input({ label: 'URL รูปปก', name: 'image', id: 'edit-image' })}
                ${Textarea({ label: 'รายละเอียด', name: 'description', id: 'edit-description', rows: 4 })}

                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    ${Button({ text: 'ยกเลิก', variant: 'outline', onClick: "closeModal('edit-project-modal')" })}
                    ${Button({ text: 'บันทึกการแก้ไข', type: 'submit', className: 'shadow-lg shadow-blue-200' })}
                </div>
            </form>
        `
    });
}

function openEditProjectModal(projectId) {
    const project = cachedProjects.find(p => p.id === projectId);
    if (!project) {
        alert('ไม่พบข้อมูลโครงการ');
        return;
    }

    // Fill form with project data
    setTimeout(() => {
        document.getElementById('edit-project-id').value = project.id;
        document.getElementById('edit-title').value = project.title || '';
        document.getElementById('edit-city').value = project.city || '';
        document.getElementById('edit-country').value = project.country || '';
        document.getElementById('edit-quota').value = project.quota || '';
        document.getElementById('edit-price').value = project.price || '';
        document.getElementById('edit-deadline').value = project.deadline || '';
        document.getElementById('edit-start-date').value = project.start_date || '';
        document.getElementById('edit-end-date').value = project.end_date || '';
        document.getElementById('edit-image').value = project.image || '';
        document.getElementById('edit-description').value = project.desc || '';
        document.getElementById('edit-status').value = project.status || 'open';
    }, 100);

    window.openModal('edit-project-modal');
}

async function handleEditProject(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังบันทึก...';
    btn.disabled = true;

    const formData = new FormData(form);
    const projectId = formData.get('project_id');
    const data = {
        id: projectId,
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
        status: formData.get('status')
    };

    try {
        await API.updateProject(data);
        
        // Update local cache
        const idx = cachedProjects.findIndex(p => p.id === projectId);
        if (idx !== -1) {
            cachedProjects[idx] = { ...cachedProjects[idx], ...data };
        }
        
        window.closeModal('edit-project-modal');
        renderDashboard(cachedProjects, cachedApplicants);
        alert('บันทึกการแก้ไขเรียบร้อยแล้ว');
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ===== START =====
init();