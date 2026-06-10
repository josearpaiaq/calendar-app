import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@src': r('./src'),
        '@components': r('./src/components'),
        '@pages': r('./src/pages'),
        '@layouts': r('./src/layouts'),
        '@hooks': r('./src/hooks'),
        '@api': r('./src/api'),
        '@assets': r('./src/assets'),
      },
    },
    server: {
      proxy: {
        '/api': backendUrl,
        '/uploads': backendUrl,
      },
    },
  }
})
