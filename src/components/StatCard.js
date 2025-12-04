/**
 * StatCard Component - แสดงสถิติแบบ Dashboard Card
 * @param {object} props
 * @param {string} props.title - ชื่อสถิติ
 * @param {number|string} props.value - ค่าสถิติ
 * @param {string} props.icon - Font Awesome icon (ไม่ต้องใส่ fa-)
 * @param {string} props.color - 'blue' | 'yellow' | 'red' | 'green' | 'purple'
 * @param {string} props.trend - ข้อความแสดง trend (optional)
 * @param {boolean} props.trendUp - trend ขึ้นหรือลง
 */
export function StatCard({ title, value, icon, color = 'blue', trend = '', trendUp = true }) {
    const colorStyles = {
        blue: { icon: 'text-blue-600 bg-blue-100', trend: 'text-blue-600' },
        yellow: { icon: 'text-yellow-600 bg-yellow-100', trend: 'text-yellow-600' },
        red: { icon: 'text-red-600 bg-red-100', trend: 'text-red-600' },
        green: { icon: 'text-green-600 bg-green-100', trend: 'text-green-600' },
        purple: { icon: 'text-purple-600 bg-purple-100', trend: 'text-purple-600' }
    };
    
    const styles = colorStyles[color] || colorStyles.blue;
    
    return `
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition duration-300">
            <div>
                <p class="text-sm text-gray-500 font-medium mb-1">${title}</p>
                <h4 class="text-3xl font-bold text-gray-800">${value}</h4>
                ${trend ? `
                    <p class="text-xs ${styles.trend} mt-1">
                        <i class="fa-solid fa-arrow-${trendUp ? 'up' : 'down'} mr-1"></i>${trend}
                    </p>
                ` : ''}
            </div>
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl ${styles.icon}">
                <i class="fa-solid fa-${icon}"></i>
            </div>
        </div>
    `;
}
