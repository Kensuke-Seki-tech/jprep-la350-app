import { test, expect } from '@playwright/test'

test.describe('TC-E-002: フラッシュカード全カード走破 → 結果画面', () => {
  test.beforeEach(async ({ page }) => {
    // Block external TTS audio fetches (Google TTS) — they introduce non-determinism in headless.
    await page.route('**/translate.google.com/**', route => route.abort())
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')
    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()
    await page.getByPlaceholder('名前を入力').fill('FCユーザー')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await expect(page.getByText('FCユーザー さん')).toBeVisible()
  })

  test('全カードを「Got it!」で走破すると 100% 表示', async ({ page }) => {
    test.setTimeout(120_000)

    await page.getByRole('button', { name: /フラッシュカード/ }).click()
    await expect(page.getByRole('heading', { name: 'フラッシュカード' })).toBeVisible()
    await page.getByRole('button', { name: 'スタート' }).click()

    // Week 5: 17 words. Drive the entire deck via in-page DOM clicks to avoid
    // per-action latency (each card has a 50ms onResult timer + flip transition).
    const totalCards = 17
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('button')).some(b => b.textContent === 'Tap to reveal meaning')
    )

    await page.evaluate(async (n) => {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
      const findBtnByText = (text: string): HTMLButtonElement | null =>
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === text) as HTMLButtonElement | null

      for (let i = 0; i < n; i++) {
        // Wait for reveal button (front side shown)
        let reveal: HTMLButtonElement | null = null
        for (let t = 0; t < 100; t++) {
          reveal = findBtnByText('Tap to reveal meaning')
          if (reveal) break
          await wait(50)
        }
        if (!reveal) throw new Error(`reveal button not found at card ${i}`)
        reveal.click()

        // Wait for "Got it!" button (flipped state)
        let gotIt: HTMLButtonElement | null = null
        for (let t = 0; t < 100; t++) {
          gotIt = findBtnByText('Got it!')
          if (gotIt) break
          await wait(20)
        }
        if (!gotIt) throw new Error(`Got it! button not found at card ${i}`)
        gotIt.click()

        // Wait for the 50ms onResult timer + setIndex to take effect.
        await wait(120)
      }
    }, totalCards)

    await expect(page.getByRole('heading', { name: '完了！' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('100%')).toBeVisible()
    await expect(page.getByText(`${totalCards} / ${totalCards} 語 覚えた`)).toBeVisible()
  })
})
