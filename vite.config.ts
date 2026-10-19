import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    server: {
        open: true,
        host: true
    },
    plugins: [react()],
    base: '/',
    build: {
        outDir: 'docs',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
