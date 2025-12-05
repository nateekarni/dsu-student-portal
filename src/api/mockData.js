/**
 * Mock Data for Offline Development
 * แยก mock data ออกมาเพื่อให้ง่ายต่อการจัดการและเปลี่ยนเป็น API จริงในอนาคต
 */

// ===== Projects =====
export const MOCK_PROJECTS = [
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

// ===== Admin Users =====
export const MOCK_ADMINS = [
  { id: 1, username: 'admin', password: '1234', name: 'Admin', role: 'admin' },
  { id: 2, username: 'teacher', password: '1234', name: 'อาจารย์ประจำ', role: 'teacher' },
  { id: 3, username: 'staff', password: '1234', name: 'เจ้าหน้าที่', role: 'staff' },
];

// ===== Applicants (ผู้สมัคร) =====
export const MOCK_APPLICANTS = [
  {
    id: 'app-001',
    projectId: 'jp-summer-2026',
    projectTitle: 'โครงการแลกเปลี่ยนญี่ปุ่น ฤดูร้อน',
    student: {
      id: 'std-001',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      studentId: '65001',
      email: 'somchai@student.school.ac.th',
      phone: '081-234-5678',
      class: 'ม.5/1',
      dob: '2008-05-15',
    },
    status: 'pending',
    appliedAt: '2025-12-01T10:30:00',
    documents: [
      { id: 'doc-001', name: 'สำเนาบัตรประชาชน', fileName: 'id_card_somchai.pdf', fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg', status: 'pending', uploadedAt: '2025-12-01T10:30:00' },
      { id: 'doc-002', name: 'ใบ ปพ.1', fileName: 'transcript_somchai.pdf', fileUrl: 'https://graduateschool.bu.ac.th/images/content/form/form-03.jpg', status: 'pending', uploadedAt: '2025-12-01T10:32:00' },
      { id: 'doc-003', name: 'สำเนาพาสปอร์ต', fileName: 'passport_somchai.jpg', fileUrl: 'https://www.immigration.go.th/wp-content/uploads/2021/06/passport.jpg', status: 'pending', uploadedAt: '2025-12-01T10:35:00' },
    ],
    notes: '',
  },
  {
    id: 'app-002',
    projectId: 'jp-summer-2026',
    projectTitle: 'โครงการแลกเปลี่ยนญี่ปุ่น ฤดูร้อน',
    student: {
      id: 'std-002',
      firstName: 'สมหญิง',
      lastName: 'รักเรียน',
      studentId: '65002',
      email: 'somying@student.school.ac.th',
      phone: '089-876-5432',
      class: 'ม.4/2',
      dob: '2009-08-22',
    },
    status: 'reviewing',
    appliedAt: '2025-11-28T14:20:00',
    documents: [
      { id: 'doc-004', name: 'สำเนาบัตรประชาชน', fileName: 'id_card_somying.pdf', fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg', status: 'approved', uploadedAt: '2025-11-28T14:20:00', reviewedAt: '2025-11-29T09:00:00' },
      { id: 'doc-005', name: 'ใบ ปพ.1', fileName: 'transcript_somying.pdf', fileUrl: 'https://graduateschool.bu.ac.th/images/content/form/form-03.jpg', status: 'approved', uploadedAt: '2025-11-28T14:22:00', reviewedAt: '2025-11-29T09:05:00' },
      { id: 'doc-006', name: 'สำเนาพาสปอร์ต', fileName: null, fileUrl: null, status: 'missing', uploadedAt: null },
    ],
    notes: 'รอเอกสารพาสปอร์ต',
  },
  {
    id: 'app-003',
    projectId: 'jp-summer-2026',
    projectTitle: 'โครงการแลกเปลี่ยนญี่ปุ่น ฤดูร้อน',
    student: {
      id: 'std-003',
      firstName: 'วิชัย',
      lastName: 'เก่งกาจ',
      studentId: '65003',
      email: 'wichai@student.school.ac.th',
      phone: '062-111-2222',
      class: 'ม.6/1',
      dob: '2007-01-10',
    },
    status: 'approved',
    appliedAt: '2025-11-25T09:15:00',
    documents: [
      { id: 'doc-007', name: 'สำเนาบัตรประชาชน', fileName: 'id_card_wichai.pdf', fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg', status: 'approved', uploadedAt: '2025-11-25T09:15:00', reviewedAt: '2025-11-26T10:00:00' },
      { id: 'doc-008', name: 'ใบ ปพ.1', fileName: 'transcript_wichai.pdf', fileUrl: 'https://graduateschool.bu.ac.th/images/content/form/form-03.jpg', status: 'approved', uploadedAt: '2025-11-25T09:18:00', reviewedAt: '2025-11-26T10:05:00' },
      { id: 'doc-009', name: 'สำเนาพาสปอร์ต', fileName: 'passport_wichai.jpg', fileUrl: 'https://www.immigration.go.th/wp-content/uploads/2021/06/passport.jpg', status: 'approved', uploadedAt: '2025-11-25T09:20:00', reviewedAt: '2025-11-26T10:10:00' },
    ],
    notes: 'เอกสารครบ พร้อมเข้าร่วม',
  },
  {
    id: 'app-004',
    projectId: 'sg-immersion',
    projectTitle: 'Singapore Immersion Program',
    student: {
      id: 'std-004',
      firstName: 'พิมพ์ใจ',
      lastName: 'สว่างจิต',
      studentId: '65010',
      email: 'pimjai@student.school.ac.th',
      phone: '095-555-6666',
      class: 'ม.5/3',
      dob: '2008-11-30',
    },
    status: 'pending',
    appliedAt: '2025-12-03T16:45:00',
    documents: [
      { id: 'doc-010', name: 'สำเนาบัตรประชาชน', fileName: 'id_card_pimjai.pdf', fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg', status: 'pending', uploadedAt: '2025-12-03T16:45:00' },
      { id: 'doc-011', name: 'ใบ ปพ.1', fileName: 'transcript_pimjai.pdf', fileUrl: 'https://graduateschool.bu.ac.th/images/content/form/form-03.jpg', status: 'pending', uploadedAt: '2025-12-03T16:48:00' },
    ],
    notes: '',
  },
  {
    id: 'app-005',
    projectId: 'jp-summer-2026',
    projectTitle: 'โครงการแลกเปลี่ยนญี่ปุ่น ฤดูร้อน',
    student: {
      id: 'std-005',
      firstName: 'ธนกร',
      lastName: 'มั่งมี',
      studentId: '65015',
      email: 'thanakorn@student.school.ac.th',
      phone: '088-999-0000',
      class: 'ม.4/1',
      dob: '2009-03-18',
    },
    status: 'rejected',
    appliedAt: '2025-11-20T11:00:00',
    documents: [
      { id: 'doc-012', name: 'สำเนาบัตรประชาชน', fileName: 'id_card_thanakorn.pdf', fileUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.jpg', status: 'rejected', uploadedAt: '2025-11-20T11:00:00', reviewedAt: '2025-11-21T14:00:00', rejectReason: 'ภาพไม่ชัด' },
      { id: 'doc-013', name: 'ใบ ปพ.1', fileName: 'transcript_thanakorn.pdf', fileUrl: 'https://graduateschool.bu.ac.th/images/content/form/form-03.jpg', status: 'rejected', uploadedAt: '2025-11-20T11:05:00', reviewedAt: '2025-11-21T14:05:00', rejectReason: 'เอกสารไม่ตรงกับชื่อผู้สมัคร' },
    ],
    notes: 'เอกสารไม่ผ่าน กรุณาอัปโหลดใหม่',
  },
];
