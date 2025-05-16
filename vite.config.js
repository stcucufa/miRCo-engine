import { defineConfig } from 'vite'
import liveReload from 'vite-plugin-live-reload'
import { resolve } from 'path'

export default defineConfig({
  root: './client',
  //   base: "/",
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    // add query params optimized for game dev
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/games': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [liveReload(['../games/**/*', './**/*'])],
})
