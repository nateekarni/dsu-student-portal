import './style.css';

// ============================================
// Admin Credentials (SHA-256 Hashed Password)
// ============================================
// วิธีสร้าง hash: ใช้ console.log(await hashPassword('your_password'))
// Default: username = "admin", password = "admin1234"
const ADMIN_CREDENTIALS = {
    username: 'admin',
    passwordHash: '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244' // hash ของ "admin1234"
};

// ฟังก์ชัน Hash Password ด้วย SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
        // Hash password และตรวจสอบกับ credentials
        const hashedPassword = await hashPassword(password);
        
        if (username === ADMIN_CREDENTIALS.username && hashedPassword === ADMIN_CREDENTIALS.passwordHash) {
            // Login สำเร็จ - Save Session
            localStorage.setItem('admin_user', JSON.stringify({ 
                username: username,
                loginAt: new Date().toISOString()
            }));
            
            // Redirect to Dashboard
            window.location.href = '/admin/';
        } else {
            // Show Error
            throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    } catch (err) {
        errorMsg.textContent = err.message;
        errorMsg.classList.remove('hidden');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});