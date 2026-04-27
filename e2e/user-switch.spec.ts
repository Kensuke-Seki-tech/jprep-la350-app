import { test, expect } from '@playwright/test'

test.describe('TC-E-004: ユーザー切替 → スコア分離確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')
  })

  test('ユーザー A 作成 → ユーザー B を作成 → 切替後にスコアが独立', async ({ page }) => {
    // Create user A
    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()
    await page.getByPlaceholder('名前を入力').fill('Aさん')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await expect(page.getByText('Aさん さん')).toBeVisible()

    // A: take quiz, answer first choice for all questions, save
    await page.getByRole('button', { name: /^.*クイズ.*4択で実力チェック/s }).click()
    await page.getByRole('button', { name: 'スタート' }).click()
    const totalQuestions = 17
    for (let i = 0; i < totalQuestions; i++) {
      await page.getByTestId('quiz-choice-0').click()
      if (i < totalQuestions - 1) {
        await page.waitForFunction(() => {
          const choice = document.querySelector('[data-testid="quiz-choice-0"]') as HTMLButtonElement | null
          return choice !== null && !choice.disabled
        }, undefined, { timeout: 5000 })
      }
    }
    await expect(page.locator('text=/問 正解/')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /結果を保存して進捗へ/ }).click()
    await expect(page.getByText(/Aさん さんの進捗/)).toBeVisible()
    // A の studiedWeeks は 1（クイズを 1 週分実施済み）
    const aStudiedWeeks = page.getByText('受験済みWeek').locator('..').locator('p').first()
    await expect(aStudiedWeeks).toHaveText('1')

    // Switch to user select via avatar dropdown → 戻る → create B
    await page.getByRole('button', { name: 'ユーザー: Aさん' }).click()
    await page.getByRole('button', { name: 'ユーザー選択に戻る' }).click()

    await expect(page.getByText('誰が使いますか？')).toBeVisible()
    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()
    await page.getByPlaceholder('名前を入力').fill('Bさん')
    await page.getByRole('button', { name: '作成', exact: true }).click()

    // B 作成直後はクリアした URL（/progress）に居る。B の進捗を直接確認。
    await expect(page.getByText(/Bさん さんの進捗/)).toBeVisible()
    // B は未受験 → studiedWeeks = 0
    const bStudiedWeeks = page.getByText('受験済みWeek').locator('..').locator('p').first()
    await expect(bStudiedWeeks).toHaveText('0')
  })
})
