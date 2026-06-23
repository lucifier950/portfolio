import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 'base' is the URL path the site is served from.
  // For Vercel/local it should be '/'. For GitHub Pages we change it later.
  base: '/',
  plugins: [react()],
})
