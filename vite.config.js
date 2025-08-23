import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    host: true,
    open: false,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3001,
      timeout: 30000,
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 500
      },
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast'],
          supabase: ['@supabase/supabase-js'],
          openai: ['openai']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'tailwindcss', 
      'postcss', 
      'style-to-js',
      'extend'
    ],
    exclude: ['react-markdown', 'debug'],
    force: true,
    esbuildOptions: {
      mainFields: ['module', 'main'],
      conditions: ['import', 'module', 'browser', 'default']
    }
  },
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      'style-to-js': 'style-to-js/cjs/index.js',
      'debug': path.resolve(__dirname, 'src/shim/debug.js'),
      'extend': path.resolve(__dirname, 'src/shim/extend.js')
    }
  },
  esbuild: {
    // Configurar para lidar com CJS exports corretamente
    format: 'esm',
    target: 'es2020'
  },
  preview: {
    port: 4173,
    host: true
  }
})
