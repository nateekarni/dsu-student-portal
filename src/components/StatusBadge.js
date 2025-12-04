export function StatusBadge(status) {
    const styles = {
        open: "bg-green-100 text-green-800 border-green-200",
        closed: "bg-red-100 text-red-800 border-red-200",
        coming: "bg-yellow-100 text-yellow-800 border-yellow-200",
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        approved: "bg-green-50 text-green-700 border-green-200",
        returned: "bg-red-50 text-red-700 border-red-200"
    };
    
    const labels = {
        open: "เปิดรับสมัคร", closed: "ปิดรับสมัคร", coming: "เร็วๆ นี้",
        pending: "รอตรวจสอบ", approved: "อนุมัติแล้ว", returned: "แก้ไขเอกสาร"
    };

    const s = status.toLowerCase();
    const style = styles[s] || "bg-gray-100 text-gray-800";
    const label = labels[s] || status;

    return `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}">${label}</span>`;
}