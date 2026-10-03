import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 43123,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 43123,
    strictPort: true,
  },
})
