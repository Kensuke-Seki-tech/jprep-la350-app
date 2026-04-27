/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 20000,
    exclude: ['node_modules', 'dist', 'e2e', 'e2e-nf', '.idea', '.git', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'src/types/**',
        'src/test/**',
        'src/main.tsx',
        'src/App.tsx',
        '**/*.config.*',
        '**/dist/**',
        // 残ページ（E2E カバー、ユニット未着手）
        'src/pages/HomeScreen.tsx',
        'src/pages/EtymologyScreen.tsx',
        'src/pages/QuizScreen.tsx',
        'src/pages/WordListScreen.tsx',
        'src/pages/ProgressScreen.tsx',
        // E2E 内部 / 視覚専用
        'src/components/auth/AuthGate.tsx',
        'src/utils/wordSvg.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
})
