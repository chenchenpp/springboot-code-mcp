import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'node20',
    ssr: true,
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RtApiMcp',
      // 确保输出文件名为 dist/index.js，方便现有 start 脚本复用
      fileName: () => 'index.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'express',
        'zod',
        '@modelcontextprotocol/sdk',
        '@modelcontextprotocol/sdk/server/mcp.js',
        '@modelcontextprotocol/sdk/server/stdio.js',
        '@modelcontextprotocol/sdk/server/streamableHttp.js',
      ],
    },
  },
});
