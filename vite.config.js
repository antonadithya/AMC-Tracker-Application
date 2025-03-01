import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      // Alias electron only for renderer build
      electron: resolve(__dirname, 'empty-electron.js')
    }
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: './electron.js',
        vite: {
          build: {
            outDir: './dist/main',
            rollupOptions: {
              output: {
                format: 'esm'
              },
              external: ['sqlite'] // externalize sqlite module for main process code
            }
          }
        }
      },
      preload: {
        input: './preload.js',
        vite: {
          build: {
            outDir: './dist/preload',
            rollupOptions: {
              output: {
                format: 'cjs',
                entryFileNames: '[name].cjs'
              }
            }
          }
        }
      }
    })
  ],
  build: {
    outDir: './dist/renderer',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    strictPort: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    '__APP_ENV__': JSON.stringify('renderer')
  }
})

