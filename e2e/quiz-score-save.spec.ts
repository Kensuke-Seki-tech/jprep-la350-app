import { test, expect } from '@playwright/test'

test.describe('TC-E-003: クイズ完走 → スコア保存', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')
    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()
    await page.getByPlaceholder('名前を入力').fill('Quizユーザー')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await expect(page.getByText('Quizユーザー さん')).toBeVisible()
  })

  test('クイズを最後まで解答 → 進捗画面でスコアが記録される', async ({ page }) => {
    await page.getByRole('button', { name: /^.*クイズ.*4択で実力チェック/s }).click()

    await expect(page.getByRole('heading', { name: 'クイズ' })).toBeVisible()
    await page.getByRole('button', { name: 'スタート' }).click()

    // Week 5: 17 words → 17 questions. Click first choice each time.
    const totalQuestions = 17
    for (let i = 0; i < totalQuestions; i++) {
      await page.getByTestId('quiz-choice-0').click()
      // After last answer the screen transitions to result; previous timeouts handle the gap.
      // For non-last answers wait for the next question to render before clicking.
      if (i < totalQuestions - 1) {
        await page.waitForFunction(
          (idx) => {
            const choice = document.querySelector('[data-testid="quiz-choice-0"]') as HTMLButtonElement | null
            return choice !== null && !choice.disabled
          },
          i,
          { timeout: 5000 }
        )
      }
    }

    // Result screen
    await expect(page.locator('text=/問 正解/')).toBeVisible({ timeout: 5000 })

    // Save score and go to progress
    await page.getByRole('button', { name: /結果を保存して進捗へ/ }).click()

    await expect(page.getByText(/Quizユーザー さんの進捗/)).toBeVisible()
    // The Week 5 card should appear in main (header has its own Week 5 option).
    await expect(page.getByRole('main').getByText('Week 5').first()).toBeVisible()
  })
})
