import { test, expect } from '@playwright/test'

test.describe('TC-E-001: 新規ユーザー作成 → 学習開始', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('「+ 新しいユーザーを追加」→ 名前入力 → 作成 → ホーム画面に遷移', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'JPREP LA350' })).toBeVisible()
    await expect(page.getByText('誰が使いますか？')).toBeVisible()

    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()

    await expect(page.getByRole('heading', { name: 'ユーザーを作成' })).toBeVisible()

    const nameInput = page.getByPlaceholder('名前を入力')
    await nameInput.fill('テスト太郎')

    await page.getByRole('button', { name: '作成', exact: true }).click()

    await expect(page.getByText('テスト太郎 さん')).toBeVisible()
    await expect(page.getByRole('button', { name: /フラッシュカード/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /クイズ/ }).first()).toBeVisible()
  })
})
