import { test, expect } from '@playwright/test'

// TC-NF-002: 週別 JSON ファイル読み込み速度（1 秒以内）
// 本番プレビューで /data/weekXX.json および /data/weekXX.quiz.json の取得時間を計測。
test.describe('TC-NF-002: 週別 JSON 読み込み速度', () => {
  const targets = [
    '/data/weeks.config.json',
    '/data/week05.json',
    '/data/week05.quiz.json',
    '/data/week06.json',
    '/data/week06.quiz.json',
  ]

  for (const path of targets) {
    test(`${path} が 1 秒以内に取得できる`, async ({ page }) => {
      await page.goto('/')

      const ms = await page.evaluate(async (url) => {
        const t0 = performance.now()
        const res = await fetch(url, { cache: 'no-store' })
        await res.json()
        return performance.now() - t0
      }, path)

      test.info().annotations.push({ type: 'metric', description: `${path}: ${ms.toFixed(1)}ms` })
      expect(ms).toBeLessThan(1000)
    })
  }
})
