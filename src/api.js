const API_URL = import.meta.env.VITE_API_URL;

// Wrapper สำหรับ Fetch เพื่อลดโค้ดซ้ำ
async function fetchAPI(action, params = {}, method = 'GET', body = null) {
    let url = `${API_URL}?action=${action}`;
    if (method === 'GET') {
        const query = new URLSearchParams(params).toString();
        if(query) url += `&${query}`;
    }
    
    const options = { method };
    if (body) options.body = JSON.stringify({ action, ...body });

    try {
        const res = await fetch(url, options);
        return await res.json();
    } catch (e) {
        console.error("API Error:", e);
        return { status: 'error', message: 'Connection Failed' };
    }
}

export const API = {
    getProjects: () => fetchAPI('getProjects'),
    login: (id, dob) => fetchAPI('login', { id, dob }),
    register: (data) => fetchAPI('registerAndApply', {}, 'POST', data),
    upload: (data) => fetchAPI('uploadFile', {}, 'POST', data),
    getSecureImage: (fileId) => fetchAPI('getSecureImage', { fileId }),
    // Admin Only
    getApplicants: () => fetchAPI('getApplicants'), // ต้องไปเพิ่มใน GAS
    updateDocStatus: (data) => fetchAPI('updateDocStatus', {}, 'POST', data),
    adminLogin: (username, password) => {
        return fetchAPI('adminLogin', {}, 'POST', { username, password })
    }
};