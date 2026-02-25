import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isAdmin = mode === 'admin'
  
  return {
    plugins: [react()],
    build: {
      outDir: isAdmin ? 'dist-admin' : 'dist',
      rollupOptions: {
        input: isAdmin ? 'admin.html' : 'index.html'
      }
    }
  }
})