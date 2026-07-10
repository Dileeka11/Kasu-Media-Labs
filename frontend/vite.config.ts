import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Admin panel is served from https://<domain>/admin/ on shared hosting,
  // so every asset URL must be prefixed with /admin/.
  base: '/admin/',
  plugins: [react()],
})
