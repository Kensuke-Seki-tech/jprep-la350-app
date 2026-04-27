import { test, expect } from '@playwright/test'

// TC-NF-001: アプリ初期ロード速度（LCP 2.5s 以内）
// 本番プレビュー（vite preview, port 4173）に対して計測する。
test.describe('TC-NF-001: 初期ロード速度（LCP）', () => {
  test('Largest Contentful Paint (LCP) が 2.5 秒以内', async ({ page }) => {
    // localStorage を空にして UserSelectScreen が表示される状態で計測する。
    await page.addInitScript(() => localStorage.clear())

    const navigationStart = Date.now()
    await page.goto('/', { waitUntil: 'load' })

    // PerformanceObserver で LCP を取得（buffered: true で過去のエントリも拾う）。
    const lcpMs = await page.evaluate(() =>
      new Promise<number>((resolve) => {
        let lcp = -1
        const obs = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            lcp = entries[entries.length - 1].startTime
          }
        })
        try {
          obs.observe({ type: 'largest-contentful-paint', buffered: true })
        } catch {
          resolve(-1)
          return
        }
        // 1.5 秒待機して、安定した LCP を返す。
        setTimeout(() => {
          obs.disconnect()
          resolve(lcp)
        }, 1500)
      })
    )

    const totalLoad = Date.now() - navigationStart
    test.info().annotations.push({ type: 'metric', description: `LCP=${lcpMs.toFixed(1)}ms / navigation~${totalLoad}ms` })

    expect(lcpMs).toBeGreaterThan(0)
    expect(lcpMs).toBeLessThan(2500)
  })
})
