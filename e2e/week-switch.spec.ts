import { test, expect } from '@playwright/test'

test.describe('TC-E-005: Week 切替 → 別単語データ読み込み', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')
    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()
    await page.getByPlaceholder('名前を入力').fill('Weekユーザー')
    await page.getByRole('button', { name: '作成', exact: true }).click()
    await expect(page.getByText('Weekユーザー さん')).toBeVisible()
  })

  test('ヘッダーの Week セレクターで Week 5 → Week 6 に切替', async ({ page }) => {
    // 初期は Week 5（17語）— main 配下にスコープ（header の <option> と区別）
    const main = page.getByRole('main')
    await expect(main.getByText('Week 5')).toBeVisible()
    await expect(main.getByText('17語')).toBeVisible()

    // Header の select を Week 6 に変更
    await page.getByLabel('Weekを選択').selectOption({ label: 'Week 6' })

    // Week 6（16語）に切り替わったことを検証
    await expect(main.getByText('Week 6')).toBeVisible()
    await expect(main.getByText('16語')).toBeVisible()

    // 単語一覧画面でも Week 6 のデータが読み込まれていることを確認
    await page.getByRole('button', { name: /単語一覧/ }).click()
    await expect(page.getByRole('heading', { name: /Week 6/ })).toBeVisible({ timeout: 5000 })
  })
})
