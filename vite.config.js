// vite.config.js - Fixed Proxy Configuration for Ivanti
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    
    server: {
      host: 'localhost',
      port: parseInt(env.VITE_DEV_SERVER_PORT) || 3000,
      open: true,
      cors: true,
      
      // Fixed proxy configuration
      proxy: {
        // Proxy all /api requests to Ivanti server
        '/api': {
          target: (env.VITE_PROXY_TARGET || 'https://ivanti').replace(/\/+$/, ''), // Remove trailing slashes
          changeOrigin: true,
          secure: false, // Set to true if using valid HTTPS certificates
          
          // Rewrite the path - replace /api with /HEAT/api
          rewrite: (path) => {
            const newPath = path.replace(/^\/api/, '/HEAT/api')
            return newPath
          },
          // Additional headers for Ivanti
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      }
    },
    
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia', 'axios'],
            syncfusion: [
              '@syncfusion/ej2-vue-gantt',
              '@syncfusion/ej2-vue-kanban',
              '@syncfusion/ej2-vue-richtexteditor',
              '@syncfusion/ej2-vue-calendars',
              '@syncfusion/ej2-vue-dropdowns',
              '@syncfusion/ej2-vue-buttons',
              '@syncfusion/ej2-vue-inputs',
              '@syncfusion/ej2-vue-notifications',
              '@syncfusion/ej2-vue-grids',
              '@syncfusion/ej2-vue-schedule'
            ],
            ui: ['vue-toastification']
          }
        }
      }
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    // Optimization
    optimizeDeps: {
      include: [
        'vue',
        'vue-router', 
        'pinia',
        'axios',
        'vue-toastification',
        '@syncfusion/ej2-vue-gantt',
        '@syncfusion/ej2-vue-kanban',
        '@syncfusion/ej2-vue-grids',
        '@syncfusion/ej2-vue-richtexteditor',
        '@syncfusion/ej2-vue-buttons',
        '@syncfusion/ej2-vue-calendars',
        '@syncfusion/ej2-vue-dropdowns',
        '@syncfusion/ej2-vue-inputs',
        '@syncfusion/ej2-vue-navigations',
        '@syncfusion/ej2-vue-popups',
        '@syncfusion/ej2-vue-layouts',
        '@syncfusion/ej2-vue-notifications',
        '@syncfusion/ej2-vue-schedule'
      ]
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __DEV__: process.env.NODE_ENV === 'development'
    }
  }
})