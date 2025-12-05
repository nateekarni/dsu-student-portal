/**
 * Admin Login Page
 */
import './style.css';
import { API } from './api/index.js';
import { getStorage, setStorage } from './utils/index.js';

// ===== AUTH CHECK =====
if (getStorage('admin_user')) {
    window.location.href = '/admin/';
}

// ===== FORM HANDLER =====
const form = document.getElementById('admin-login-form');
const errorMsg = document.getElementById('error-msg');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;
        
        // UI Loading State
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังตรวจสอบ...';
        btn.disabled = true;
        errorMsg?.classList.add('hidden');

        // Get Data
        const formData = new FormData(form);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const res = await API.adminLogin(username, password);

            if (res.status === 'success') {
                setStorage('admin_user', res.user);
                window.location.href = '/admin/';
            } else {
                throw new Error(res.message || 'รหัสผ่านไม่ถูกต้อง');
            }
        } catch (err) {
            if (errorMsg) {
                errorMsg.textContent = err.message;
                errorMsg.classList.remove('hidden');
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}