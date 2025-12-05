/**
 * UI Components - Basic form and interaction elements
 */

// Button
export function Button({ text, onClick, variant = 'primary', type = 'button', className = '', icon = '' }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-blue-200",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-danger text-white hover:bg-red-700",
    success: "bg-success text-white hover:bg-green-700",
    outline: "border-2 border-primary text-primary hover:bg-blue-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };

  return `
    <button type="${type}" class="${baseStyle} ${variants[variant] || variants.primary} ${className}" ${onClick ? `onclick="${onClick}"` : ''}>
      ${icon ? `<i class="${icon}"></i>` : ''}
      ${text}
    </button>
  `;
}

// Input
export function Input({ 
  label = '', 
  name = '', 
  type = 'text', 
  placeholder = '', 
  required = false, 
  className = '', 
  id = '',
  value = ''
}) {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <div class="space-y-1 ${className}">
      ${label ? `<label for="${inputId}" class="block text-sm font-medium text-gray-700">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>` : ''}
      <input 
        type="${type}" 
        id="${inputId}" 
        name="${name}" 
        placeholder="${placeholder}"
        ${value ? `value="${value}"` : ''}
        ${required ? 'required' : ''}
        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-gray-800 placeholder:text-gray-400"
      />
    </div>
  `;
}

// Select
export function Select({ 
  label = '', 
  name = '', 
  options = [], 
  required = false, 
  className = '', 
  id = '',
  value = ''
}) {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <div class="space-y-1 ${className}">
      ${label ? `<label for="${selectId}" class="block text-sm font-medium text-gray-700">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>` : ''}
      <select 
        id="${selectId}" 
        name="${name}"
        ${required ? 'required' : ''}
        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-gray-800 bg-white cursor-pointer"
      >
        ${options.map(opt => `
          <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>
        `).join('')}
      </select>
    </div>
  `;
}

// Textarea
export function Textarea({ 
  label = '', 
  name = '', 
  placeholder = '', 
  rows = 4, 
  required = false, 
  className = '', 
  id = '',
  value = ''
}) {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <div class="space-y-1 ${className}">
      ${label ? `<label for="${textareaId}" class="block text-sm font-medium text-gray-700">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>` : ''}
      <textarea 
        id="${textareaId}" 
        name="${name}" 
        rows="${rows}" 
        placeholder="${placeholder}"
        ${required ? 'required' : ''}
        class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition text-gray-800 placeholder:text-gray-400 resize-none"
      >${value}</textarea>
    </div>
  `;
}

// Modal
export function Modal({ id, title, content, maxWidth = 'max-w-2xl' }) {
  return `
    <div id="${id}" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeModal('${id}')"></div>
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="${maxWidth} w-full bg-white rounded-2xl shadow-2xl relative animate-fade-in max-h-[90vh] overflow-hidden flex flex-col">
          <div class="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-800">${title}</h3>
            <button onclick="closeModal('${id}')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div class="p-5 overflow-y-auto flex-1">
            ${content}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Initialize modal system
export function initModalSystem() {
  window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fixed.z-50:not(.hidden)').forEach(modal => {
        modal.classList.add('hidden');
      });
      document.body.style.overflow = '';
    }
  });
}
