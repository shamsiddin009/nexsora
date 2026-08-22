import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('lucide-vue-next')) return 'vendor-icons'
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) return 'vendor-vue'
          }
        }
      }
    }
  }
})
