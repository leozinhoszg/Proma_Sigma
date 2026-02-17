import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Carregar certificados SSL se existirem
const sslKeyPath = path.resolve(__dirname, '..', 'server', 'ssl', 'server.key')
const sslCertPath = path.resolve(__dirname, '..', 'server', 'ssl', 'server.crt')
const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)

const httpsConfig = hasSSL ? {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath)
} : undefined

const backendUrl = hasSSL ? 'https://localhost:3001' : 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    https: httpsConfig,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: backendUrl,
        changeOrigin: true,
        ws: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
