import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // 🟢 SANGAT KRUSIAL: Memaksa semua aset menggunakan path absolut agar tidak terkena error MIME type di Cloudflare Pages SPA
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})