const API_URL = import.meta.env.VITE_API_URL;

// ===== Mock Data (Offline) =====
const MOCK_PROJECTS = [
  {
    id: 'jp-summer-2026',
    title: 'โครงการแลกเปลี่ยนญี่ปุ่น ฤดูร้อน',
    desc: 'ทัศนศึกษาและเรียนรู้วัฒนธรรมญี่ปุ่น 2 สัปดาห์ ณ โตเกียวและพื้นที่ใกล้เคียง พร้อมเวิร์กช็อปภาษาและกิจกรรมกับนักเรียนท้องถิ่น',
    image: 'https://picsum.photos/id/1015/1200/675',
    gallery: [
      'https://picsum.photos/id/1021/400/250',
      'https://picsum.photos/id/1039/400/250',
      'https://picsum.photos/id/1043/400/250',
      'https://picsum.photos/id/1050/400/250'
    ],
    city: 'โตเกียว',
    country: 'ญี่ปุ่น',
    quota: 20,
    price: 85000,
    start_date: '2026-06-10',
    end_date: '2026-06-24',
    deadline: '2026-04-30',
    status: 'open',
    created_at: '2025-11-20',
    category: 'exchange',
    conditions: 'รับนักเรียน ม.ปลาย เกรดเฉลี่ย 2.75+ สามารถสื่อสารภาษาอังกฤษพื้นฐาน',
    benefits: [
      'กิจกรรมแลกเปลี่ยนกับนักเรียนท้องถิ่น',
      'พัฒนาทักษะภาษาและความเข้าใจวัฒนธรรม',
      'ทีมงานดูแลตลอดการเดินทาง'
    ],
    requirements: [
      'สำเนาบัตรประชาชนและ ปพ.1',
      'หนังสือรับรองจากโรงเรียน',
      'สำเนาพาสปอร์ต (ถ้ามี)'
    ],
    fee_detail: '<ul class="list-disc ml-6 space-y-1"><li>รวม: ที่พัก, อาหารเช้า, เวิร์กช็อป, ประกันเดินทาง</li><li>ไม่รวม: ตั๋วเครื่องบิน, อาหารกลางวัน/เย็น</li></ul>'
  },
  {
    id: 'kr-winter-camp',
    title: 'ค่ายวิชาการเกาหลี ฤดูหนาว',
    desc: 'ค่ายวิทยาศาสตร์และเทคโนโลยี ที่กรุงโซล 10 วัน พร้อมเข้าชมห้องแลบและมหาวิทยาลัยชั้นนำ',
    image: 'https://picsum.photos/id/1005/1200/675',
    city: 'โซล',
    country: 'เกาหลีใต้',
    quota: 30,
    price: 65000,
    start_date: '2026-12-05',
    end_date: '2026-12-15',
    deadline: '2026-10-15',
    status: 'soon',
    created_at: '2025-10-02',
    category: 'camp'
  },
  {
    id: 'sg-immersion',
    title: 'Singapore Immersion Program',
    desc: 'เปิดโลกธุรกิจและเทคโนโลยีสิงคโปร์ 1 สัปดาห์ เยี่ยมชมสตาร์ทอัพและมหาวิทยาลัย',
    image: 'https://picsum.photos/id/1012/1200/675',
    city: 'สิงคโปร์',
    country: 'สิงคโปร์',
    quota: 15,
    price: 42000,
    start_date: '2026-08-12',
    end_date: '2026-08-19',
    deadline: '2026-06-30',
    status: 'open',
    created_at: '2025-09-12',
    category: 'exchange'
  }
];

// Wrapper สำหรับ Fetch (ปิดใช้งานภายนอกชั่วคราว)
async function fetchAPI(action, params = {}, method = 'GET', body = null) {
  // ชั่วคราว: ปิดการเรียก API จริง เพื่อใช้งาน Offline
  // สามารถเปิดกลับโดยคืนโค้ดเดิม
  return { status: 'offline' };
}

export const API = {
  // ใช้ Mock แทน
  getProjects: async () => {
    // จำลองดีเลย์ให้เหมือนโหลดข้อมูล
    await new Promise(r => setTimeout(r, 200));
    return MOCK_PROJECTS;
  },
  // ส่วนอื่น ๆ ปิดไว้ชั่วคราว ให้คืน error
  login: async () => ({ status: 'error', message: 'Offline mode' }),
  register: async () => ({ status: 'error', message: 'Offline mode' }),
  upload: async () => ({ status: 'error', message: 'Offline mode' }),
  getSecureImage: async () => ({ status: 'error', message: 'Offline mode' }),
  // Admin Only
  getApplicants: async () => ({ status: 'error', message: 'Offline mode' }),
  updateDocStatus: async () => ({ status: 'error', message: 'Offline mode' }),
  adminLogin: async () => ({ status: 'error', message: 'Offline mode' }),
  createProject: async () => ({ status: 'error', message: 'Offline mode' }),
};