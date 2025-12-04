import { getStorage, setStorage } from './utils.js';
import './style.css';

// Simple Modal System for Apply page
function openModal({ title, content }) {
  // Remove existing modal if any
  const existing = document.getElementById('apply-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'apply-modal';
  modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform flex flex-col max-h-[90vh] border border-gray-200">
      <div class="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
        <h3 class="font-bold text-lg text-gray-800">${title}</h3>
        <button onclick="closeModal()" class="text-gray-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto">${content}</div>
    </div>
  `;
  document.body.appendChild(modal);
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('apply-modal');
  if (modal) modal.remove();
}

window.closeModal = closeModal;

// Mock project data for display
const MOCK_PROJECT_INFO = {
  title: 'โครงการแลกเปลี่ยนวัฒนธรรมจีน ณ มหาวิทยาลัยเฉิงตู',
  image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=400&fit=crop',
  location: 'เฉิงตู, จีน',
  flag: '🇨🇳',
  dateRange: '15 - 21 มี.ค. 2569',
  duration: '7 วัน 6 คืน',
};

// Mock task definitions with icons
const TASKS = [
  { key: 'personal_info', title: 'กรอกข้อมูลส่วนตัว', description: 'ชื่อ นามสกุล รหัสนักเรียน วันเดือนปีเกิด', icon: 'fa-user', type: 'form' },
  { key: 'passport_upload', title: 'อัปโหลดพาสปอร์ต', description: 'อัปโหลดไฟล์ภาพหรือ PDF ของหน้าข้อมูลพาสปอร์ต', icon: 'fa-passport', type: 'upload' },
  { key: 'academic_upload', title: 'อัปโหลดใบ ปพ.', description: 'อัปโหลดไฟล์ภาพหรือ PDF ของใบ ปพ.1 หรือระเบียนผลการเรียน', icon: 'fa-file-lines', type: 'upload' },
];

const STORAGE_KEY = 'apply_tasks_state';

function getParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

function initialState() {
  const projectId = getParam('projectId') || 'mock-project';
  const saved = getStorage(STORAGE_KEY) || {};
  return saved[projectId] || {
    projectId,
    tasks: {
      personal_info: { done: false, data: { firstName: '', lastName: '', studentId: '', dob: '' } },
      passport_upload: { done: false, fileName: '', uploadedAt: '' },
      academic_upload: { done: false, fileName: '', uploadedAt: '' },
    },
  };
}

function saveState(state) {
  const all = getStorage(STORAGE_KEY) || {};
  all[state.projectId] = state;
  setStorage(STORAGE_KEY, all);
}

function formatDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

function renderTaskItem(task, state, index) {
  const t = state.tasks[task.key];
  const done = t?.done;
  const statusBadge = done
    ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium"><i class="fa-solid fa-check text-[10px]"></i> เสร็จแล้ว</span>'
    : '<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-medium"><i class="fa-solid fa-clock text-[10px]"></i> รอดำเนินการ</span>';

  const lastUpdate = t?.uploadedAt ? `<p class="text-xs text-gray-400 mt-1"><i class="fa-regular fa-clock mr-1"></i> อัปเดตล่าสุด ${formatDateTime(t.uploadedAt)}</p>` : '';
  
  const fileName = t?.fileName ? `<p class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-paperclip mr-1"></i> ${t.fileName}</p>` : '';
  
  const personalData = task.key === 'personal_info' && t?.done && t?.data ? `
    <p class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-user mr-1"></i> ${t.data.firstName} ${t.data.lastName}</p>
  ` : '';

  return `
    <div class="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden">
      <div class="p-5 flex items-start gap-4">
        <!-- Step Number & Icon -->
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-xl ${done ? 'bg-green-500' : 'bg-primary'} text-white flex items-center justify-center shadow-lg">
            ${done ? '<i class="fa-solid fa-check text-lg"></i>' : `<i class="fa-solid ${task.icon} text-lg"></i>`}
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs text-gray-400 font-medium">ขั้นตอนที่ ${index + 1}</span>
            ${statusBadge}
          </div>
          <h3 class="font-semibold text-gray-900">${task.title}</h3>
          <p class="text-sm text-gray-500 mt-0.5">${task.description}</p>
          ${personalData}
          ${fileName}
          ${lastUpdate}
        </div>
        
        <!-- Actions -->
        <div class="flex-shrink-0 flex items-center gap-2">
          <button class="btn btn-primary text-sm px-3 py-2" onclick="openTask('${task.key}')">
            ${done ? '<i class="fa-solid fa-pen"></i>' : '<i class="fa-solid fa-arrow-right"></i>'}
          </button>
          ${done ? `<button class="btn text-sm px-3 py-2 text-gray-500 hover:text-red-500" onclick="resetTask('${task.key}')" title="ล้างข้อมูล"><i class="fa-solid fa-trash-can"></i></button>` : ''}
        </div>
      </div>
      ${done ? '<div class="h-1 bg-green-500"></div>' : '<div class="h-1 bg-gray-100"></div>'}
    </div>
  `;
}

function renderList(state) {
  const projectId = state.projectId;
  const completedCount = Object.values(state.tasks).filter(t => t.done).length;
  const totalCount = TASKS.length;
  const allDone = completedCount === totalCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Left: project summary, Right: checklist
  const actionBar = `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button class="btn text-sm" onclick="goBackToProject()"><i class="fa-solid fa-arrow-left mr-2"></i> กลับไปหน้าโครงการ</button>
        <button class="btn ${allDone ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} text-sm" onclick="submitApplication()" ${!allDone ? 'disabled' : ''}><i class="fa-solid fa-paper-plane mr-2"></i> ส่งใบสมัคร</button>
      </div>
    </div>
  `;

  const projectCard = `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div class="aspect-[21/9] relative">
        <img src="${MOCK_PROJECT_INFO.image}" alt="${MOCK_PROJECT_INFO.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-2">
            <i class="fa-solid fa-file-signature"></i> กำลังสมัคร
          </span>
          <h1 class="text-xl md:text-2xl font-bold">${MOCK_PROJECT_INFO.title}</h1>
          <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/80">
            <span><span class="mr-1">${MOCK_PROJECT_INFO.flag}</span> ${MOCK_PROJECT_INFO.location}</span>
            <span><i class="fa-regular fa-calendar mr-1"></i> ${MOCK_PROJECT_INFO.dateRange}</span>
            <span><i class="fa-solid fa-clock mr-1"></i> ${MOCK_PROJECT_INFO.duration}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const tasksHtml = TASKS.map((task, idx) => renderTaskItem(task, state, idx)).join('\n');

  const checklistCard = `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-lg font-bold text-gray-900">รายการที่ต้องทำ</h2>
          <p class="text-sm text-gray-500">ดำเนินการให้ครบทุกขั้นตอนเพื่อส่งใบสมัคร</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold ${allDone ? 'text-green-600' : 'text-primary'}">${completedCount}/${totalCount}</p>
          <p class="text-xs text-gray-400">ขั้นตอน</p>
        </div>
      </div>
      <div class="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div class="absolute inset-y-0 left-0 ${allDone ? 'bg-green-500' : 'bg-primary'} rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
      </div>
      <p class="text-xs text-gray-400 mb-4 text-center">${allDone ? '<i class="fa-solid fa-check-circle text-green-500 mr-1"></i> พร้อมส่งใบสมัครแล้ว!' : `เหลืออีก ${totalCount - completedCount} ขั้นตอน`}</p>
      <div class="space-y-3">${tasksHtml}</div>
    </div>
  `;

  document.getElementById('apply-root').innerHTML = `
    <div class="max-w-4xl mx-auto">
      ${actionBar}
      ${projectCard}
      ${checklistCard}
    </div>
  `;
}

function openTask(key) {
  const state = initialState();
  if (key === 'personal_info') return openPersonalInfo(state);
  if (key === 'passport_upload') return openUpload(state, key, 'พาสปอร์ต');
  if (key === 'academic_upload') return openUpload(state, key, 'ใบ ปพ.');
}

function openPersonalInfo(state) {
  const data = state.tasks.personal_info.data;
  const content = `
    <div class="space-y-5">
      <div class="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <i class="fa-solid fa-user"></i>
        </div>
        <div>
          <h2 class="font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>
          <p class="text-xs text-gray-500">กรุณากรอกข้อมูลให้ครบถ้วน</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ <span class="text-red-500">*</span></label>
          <input id="pi-firstName" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white" placeholder="กรอกชื่อ" value="${data.firstName}" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">นามสกุล <span class="text-red-500">*</span></label>
          <input id="pi-lastName" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white" placeholder="กรอกนามสกุล" value="${data.lastName}" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">รหัสนักเรียน <span class="text-red-500">*</span></label>
          <input id="pi-studentId" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white" placeholder="เช่น 12345" value="${data.studentId}" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">วัน/เดือน/ปีเกิด <span class="text-red-500">*</span></label>
          <input id="pi-dob" type="date" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white" value="${data.dob}" />
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button class="btn px-5" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-primary px-5" onclick="savePersonalInfo()"><i class="fa-solid fa-check mr-2"></i> บันทึก</button>
      </div>
    </div>
  `;
  openModal({ title: 'ข้อมูลส่วนตัว', content });
}

function savePersonalInfo() {
  const state = initialState();
  const data = {
    firstName: document.getElementById('pi-firstName').value.trim(),
    lastName: document.getElementById('pi-lastName').value.trim(),
    studentId: document.getElementById('pi-studentId').value.trim(),
    dob: document.getElementById('pi-dob').value,
  };
  state.tasks.personal_info = { done: true, data };
  saveState(state);
  closeModal();
  renderList(state);
}

function openUpload(state, key, label) {
  const current = state.tasks[key];
  const iconMap = {
    'พาสปอร์ต': 'fa-passport',
    'ใบ ปพ.': 'fa-file-lines',
  };
  const icon = iconMap[label] || 'fa-file';
  
  const content = `
    <div class="space-y-5">
      <div class="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <h2 class="font-semibold text-gray-900">อัปโหลด${label}</h2>
          <p class="text-xs text-gray-500">รองรับไฟล์ภาพ (.jpg, .png) หรือ PDF</p>
        </div>
      </div>
      
      <div class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
        <input id="upload-file" type="file" class="hidden" accept="image/*,.pdf" onchange="previewFile()" />
        <label for="upload-file" class="cursor-pointer">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-cloud-arrow-up text-2xl text-gray-400"></i>
          </div>
          <p class="text-sm text-gray-600 font-medium">คลิกเพื่อเลือกไฟล์</p>
          <p class="text-xs text-gray-400 mt-1">หรือลากไฟล์มาวางที่นี่</p>
        </label>
      </div>
      
      <div id="file-preview" class="hidden">
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <i class="fa-solid fa-file text-primary"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p id="preview-filename" class="text-sm font-medium text-gray-900 truncate"></p>
            <p id="preview-filesize" class="text-xs text-gray-400"></p>
          </div>
          <button onclick="clearFilePreview()" class="text-gray-400 hover:text-red-500">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      </div>
      
      ${current?.fileName ? `
        <div class="flex items-center gap-2 text-sm text-gray-500 bg-green-50 p-3 rounded-lg">
          <i class="fa-solid fa-check-circle text-green-500"></i>
          <span>ไฟล์ปัจจุบัน: <strong>${current.fileName}</strong></span>
        </div>
      ` : ''}
      
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button class="btn px-5" onclick="closeModal()">ยกเลิก</button>
        <button class="btn btn-primary px-5" onclick="saveUpload('${key}','${label}')"><i class="fa-solid fa-check mr-2"></i> บันทึก</button>
      </div>
    </div>
  `;
  openModal({ title: `อัปโหลด${label}`, content });
}

function previewFile() {
  const input = document.getElementById('upload-file');
  const preview = document.getElementById('file-preview');
  const filename = document.getElementById('preview-filename');
  const filesize = document.getElementById('preview-filesize');
  
  if (input.files && input.files[0]) {
    const file = input.files[0];
    filename.textContent = file.name;
    filesize.textContent = formatFileSize(file.size);
    preview.classList.remove('hidden');
  }
}

function clearFilePreview() {
  const input = document.getElementById('upload-file');
  const preview = document.getElementById('file-preview');
  input.value = '';
  preview.classList.add('hidden');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

window.previewFile = previewFile;
window.clearFilePreview = clearFilePreview;

function saveUpload(key, label) {
  const state = initialState();
  const input = document.getElementById('upload-file');
  const file = input.files[0];
  const fileName = file ? file.name : `${label}-mock.pdf`;
  state.tasks[key] = { done: true, fileName, uploadedAt: Date.now() };
  saveState(state);
  closeModal();
  renderList(state);
}

function resetTask(key) {
  const state = initialState();
  if (key === 'personal_info') state.tasks.personal_info = { done: false, data: { firstName: '', lastName: '', studentId: '', dob: '' } };
  if (key === 'passport_upload') state.tasks.passport_upload = { done: false, fileName: '', uploadedAt: '' };
  if (key === 'academic_upload') state.tasks.academic_upload = { done: false, fileName: '', uploadedAt: '' };
  saveState(state);
  renderList(state);
}

function goBackToProject() {
  const projectId = getParam('projectId') || 'mock-project';
  location.href = `/project.html?id=${projectId}`;
}

function submitApplication() {
  const state = initialState();
  const allDone = Object.values(state.tasks).every(t => t.done);
  const content = allDone ? `
    <div class="text-center py-4">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-check text-3xl text-green-500"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">ส่งใบสมัครเรียบร้อย!</h3>
      <p class="text-gray-500 mb-6">ระบบได้บันทึกข้อมูลของคุณแล้ว<br>กรุณารอการติดต่อกลับจากทีมงาน</p>
      <div class="flex justify-center gap-3">
        <button class="btn" onclick="closeModal()">ปิด</button>
        <button class="btn btn-primary" onclick="goBackToProject()"><i class="fa-solid fa-arrow-left mr-2"></i> กลับหน้าโครงการ</button>
      </div>
    </div>
  ` : `
    <div class="text-center py-4">
      <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-exclamation text-3xl text-amber-500"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">ยังทำรายการไม่ครบ</h3>
      <p class="text-gray-500 mb-6">กรุณาดำเนินการให้ครบทุกขั้นตอน<br>ก่อนส่งใบสมัคร</p>
      <div class="flex justify-center">
        <button class="btn btn-primary" onclick="closeModal()">ตกลง</button>
      </div>
    </div>
  `;
  openModal({ title: 'สถานะการสมัคร', content });
}

window.openTask = openTask;
window.savePersonalInfo = savePersonalInfo;
window.saveUpload = saveUpload;
window.resetTask = resetTask;
window.goBackToProject = goBackToProject;
window.submitApplication = submitApplication;

function init() {
  const state = initialState();
  renderList(state);
}

init();
