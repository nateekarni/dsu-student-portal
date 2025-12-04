import './style.css';
import { API } from './api.js';

// 1. เช็คว่า Login อยู่แล้วหรือเปล่า? (ถ้าใช่ ดีดไปหน้า Dashboard เลย)
if (localStorage.getItem('admin_user')) {
    window.location.href = '/admin/';
}

const form = document.getElementById('admin-login-form');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI Loading State
    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังตรวจสอบ...';
    btn.disabled = true;
    errorMsg.classList.add('hidden');

    // Get Data
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        // Call API
        const res = await API.adminLogin(username, password);

        if (res.status === 'success') {
            // Save Session
            localStorage.setItem('admin_user', JSON.stringify(res.user));
            
            // Redirect to Dashboard
            window.location.href = '/admin/';
        } else {
            // Show Error
            throw new Error(res.message || 'รหัสผ่านไม่ถูกต้อง');
        }
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});