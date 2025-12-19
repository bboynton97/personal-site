import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
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
