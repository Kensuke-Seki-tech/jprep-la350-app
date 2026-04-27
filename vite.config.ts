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
        'src/pages/HomeScreen.tsx',
        'src/pages/EtymologyScreen.tsx',
        'src/pages/QuizScreen.tsx',
        'src/pages/WordListScreen.tsx',
        'src/pages/ProgressScreen.tsx',
        'src/components/auth/AuthGate.tsx',
        'src/components/common/**',
        'src/components/layout/**',
        'src/components/progress/**',
        'src/components/wordlist/**',
        'src/components/quiz/QuizProgress.tsx',
        'src/components/quiz/QuizQuestion.tsx',
        'src/hooks/useWeeks.ts',
        'src/hooks/useWordData.ts',
        'src/utils/format.ts',
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
