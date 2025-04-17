import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), visualizer({ open: true })],
    resolve: {
        alias: [{ find: '~', replacement: '/src' }],
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "slick-carousel/slick/slick.css";
                                 @import "slick-carousel/slick/slick-theme.css";`,
            },
        },
    },
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
    },
});
