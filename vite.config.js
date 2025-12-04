// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        admin: resolve(process.cwd(), 'Admin/index.html'), // แยกหน้า Admin
        adminLogin: resolve(process.cwd(), 'Admin/login.html'), // แยกหน้า Login Admin
      },
    },
  },
})