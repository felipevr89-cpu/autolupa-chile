import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/@supabase/')) return 'vendor-supabase';
          if (/node_modules\/(react|react-dom|react-router|scheduler|react-helmet-async)\//.test(id)) return 'vendor-react';
          if (id.includes('/src/data/brands/')) return 'data-catalog';
          if (id.endsWith('/src/data/carImages.json')) return 'data-images';
        },
      },
    },
  },
})
