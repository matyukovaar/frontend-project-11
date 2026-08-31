import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://allorigins.hexlet.app', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/get'), 
      },
    },
  },
})
