// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from 'tailwindcss'

// 개발 서버에서 /attendance, /auth, /ws 요청을 백엔드(3980)로 프록시
const BACKEND = 'http://localhost:3980'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  define: {
    // 일부 라이브러리 호환용
    global: 'window',
  },
  server: {
    proxy: {
      // REST APIs
      '/attendance': {
        target: BACKEND,
        changeOrigin: true,
      },
      '/auth': {
        target: BACKEND,
        changeOrigin: true,
      },
      // STOMP/WebSocket (사용 중이면 유지, 아니면 지워도 됨)
      '/ws': {
        target: BACKEND,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
