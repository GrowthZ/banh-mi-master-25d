import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Đường dẫn tương đối để chạy được trên GitHub Pages (/banh-mi-master-25d/) lẫn local.
  base: './',
  plugins: [react(), tailwindcss()],
});
