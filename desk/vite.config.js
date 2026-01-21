import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
        },
      },
    },
    server: {
      proxy: {
        '/api/blog': {
          target: env.VITE_BLOG_API_URL || 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/blog/, '')
        }
      }
    }
  }
})
