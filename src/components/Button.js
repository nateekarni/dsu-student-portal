export function Button({ text, onClick, variant = 'primary', type = 'button', className = '', icon = '' }) {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-blue-200",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        danger: "bg-danger text-white hover:bg-red-700",
        success: "bg-success text-white hover:bg-green-700",
        outline: "border-2 border-primary text-primary hover:bg-blue-50"
    };

    return `
        <button type="${type}" class="${baseStyle} ${variants[variant]} ${className}" ${onClick ? `onclick="${onClick}"` : ''}>
            ${icon ? `<i class="${icon}"></i>` : ''}
            ${text}
        </button>
    `;
}