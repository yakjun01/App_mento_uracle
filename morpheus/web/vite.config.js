//import { fileURLToPath, URL } from 'node:url';
//
//import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react';
//
//// https://vite.dev/config/
//export default defineConfig({
//    root: 'web',
//    base: './',
//    build: {
//        outDir: '../assets/res/www/web',
//    },
//    plugins: [react()],
//    resolve: {
//        alias: {
//            '@': fileURLToPath(new URL('./src', import.meta.url)),
//        },
//    },
//    server: {
//        proxy: {
//            '/file': 'http://127.0.0.1:8080',
//        },
//    },
//});

import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
    root: 'web',
    build: {
        outDir: '../assets/res/www/web',
        rollupOptions: {
//            input: '/Users/junu/workspace/test_1015/web/app.html'
              input: 'app.html'
        }
    },
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        host: '127.0.0.1',
        port: 5174,
        proxy: {
            '/': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                logLevel: 'debug',
            },
        },
    },
});