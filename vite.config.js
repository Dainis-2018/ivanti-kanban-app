import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: process.env.VITE_DEV_SERVER_PORT || 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://ivanti/HEAT/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          syncfusion: [
            '@syncfusion/ej2-vue-kanban',
            '@syncfusion/ej2-vue-richtexteditor',
            '@syncfusion/ej2-vue-calendars'
          ]
        }
      }
    }
  }
})