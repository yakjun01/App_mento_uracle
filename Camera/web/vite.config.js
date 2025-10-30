import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
    root: 'web',
    build: {
        outDir: '../assets/res/www/web',
    },
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: '../node_modules/onnxruntime-web/dist/*.wasm',
                    dest: '.',
                },
            ],
        }),
    ],
    optimizeDeps: {
        exclude: ['onnxruntime-web'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: '127.00.1',
        port: 5173,
        proxy: {
            '/file': 'http://127.0.0.1:3000',
        },
    },
});
