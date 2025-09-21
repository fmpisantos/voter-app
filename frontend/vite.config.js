import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteSingleFile } from 'vite-plugin-singlefile';

const outDir = resolve(__dirname, 'dist');

export default defineConfig({
    build: {
        rollupOptions: {
            input: "index.html",
        },
        assetsInlineLimit: Infinity,
        outDir,
        emptyOutDir: true,
        minify: 'terser',
        terserOptions: {
            compress: true,
            mangle: true,
        },
    },
    plugins: [
        viteSingleFile(),
        createHtmlPlugin({
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeEmptyAttributes: true,
                minifyJS: true,
                minifyCSS: true,
            },
        }),
    ],
})
