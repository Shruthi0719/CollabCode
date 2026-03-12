import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Fixed this line

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Keep your specific backend proxies here
      '/api/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/code': { // Ensure this matches your runCode route
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})