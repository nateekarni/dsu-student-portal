/**
 * API Service
 * Centralized API calls - easily switch between mock and real API
 */
import { MOCK_PROJECTS, MOCK_ADMINS, MOCK_APPLICANTS } from './mockData.js';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = true; // Toggle this to switch between mock and real API

// ===== Helper: Simulate network delay =====
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// ===== Projects =====
export async function getProjects() {
  await delay();
  if (USE_MOCK) return MOCK_PROJECTS;
  // Real API call would go here
  const res = await fetch(`${API_URL}?action=getProjects`);
  return res.json();
}

export async function getProjectById(id) {
  await delay();
  if (USE_MOCK) return MOCK_PROJECTS.find(p => p.id === id) || null;
  const res = await fetch(`${API_URL}?action=getProject&id=${id}`);
  return res.json();
}

export async function createProject(data) {
  await delay(300);
  if (USE_MOCK) return { status: 'success', message: 'สร้างโครงการสำเร็จ (Mock)' };
  const res = await fetch(`${API_URL}?action=createProject`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateProject(data) {
  await delay(300);
  if (USE_MOCK) return { status: 'success', message: 'อัปเดตโครงการสำเร็จ (Mock)' };
  const res = await fetch(`${API_URL}?action=updateProject`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
}

// ===== Applicants =====
export async function getApplicants(projectId = null) {
  await delay();
  if (USE_MOCK) {
    return projectId 
      ? MOCK_APPLICANTS.filter(a => a.projectId === projectId)
      : MOCK_APPLICANTS;
  }
  const url = projectId 
    ? `${API_URL}?action=getApplicants&projectId=${projectId}`
    : `${API_URL}?action=getApplicants`;
  const res = await fetch(url);
  return res.json();
}

export async function getApplicantById(id) {
  await delay(150);
  if (USE_MOCK) return MOCK_APPLICANTS.find(a => a.id === id) || null;
  const res = await fetch(`${API_URL}?action=getApplicant&id=${id}`);
  return res.json();
}

export async function updateApplicantStatus(applicantId, status, notes = '') {
  await delay();
  if (USE_MOCK) return { status: 'success', message: `อัปเดตสถานะผู้สมัคร ${applicantId} เป็น ${status}` };
  const res = await fetch(`${API_URL}?action=updateApplicantStatus`, {
    method: 'POST',
    body: JSON.stringify({ applicantId, status, notes })
  });
  return res.json();
}

// ===== Documents =====
export async function updateDocStatus(docId, status, rejectReason = '') {
  await delay();
  if (USE_MOCK) return { status: 'success', message: `อัปเดตสถานะเอกสาร ${docId} เป็น ${status}` };
  const res = await fetch(`${API_URL}?action=updateDocStatus`, {
    method: 'POST',
    body: JSON.stringify({ docId, status, rejectReason })
  });
  return res.json();
}

// ===== Auth =====
export async function adminLogin(username, password) {
  await delay(300);
  if (USE_MOCK) {
    const user = MOCK_ADMINS.find(u => u.username === username && u.password === password);
    if (user) {
      return { status: 'success', user: { id: user.id, name: user.name, role: user.role } };
    }
    return { status: 'error', message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
  }
  const res = await fetch(`${API_URL}?action=adminLogin`, {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function studentLogin(email, password) {
  await delay(300);
  if (USE_MOCK) return { status: 'error', message: 'Offline mode' };
  const res = await fetch(`${API_URL}?action=login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function studentRegister(data) {
  await delay(300);
  if (USE_MOCK) return { status: 'error', message: 'Offline mode' };
  const res = await fetch(`${API_URL}?action=register`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
}

// ===== File Upload =====
export async function uploadFile(file, type) {
  await delay(500);
  if (USE_MOCK) return { status: 'error', message: 'Offline mode' };
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await fetch(`${API_URL}?action=upload`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

// ===== Legacy API object (for backward compatibility) =====
export const API = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  getApplicants,
  getApplicantById,
  updateApplicantStatus,
  updateDocStatus,
  adminLogin,
  login: studentLogin,
  register: studentRegister,
  upload: uploadFile,
  getSecureImage: async () => ({ status: 'error', message: 'Offline mode' }),
};

export default API;
