import { test, expect, devices } from '@playwright/test'

// TC-NF-004: モバイルビューポート表示（レイアウト崩れなし）
// iPhone 14 viewport（390x844）と Pixel 5（393x851）で主要画面を確認する。
// devices オブジェクト全体ではなく、viewport / userAgent / hasTouch のみ参照することで
// browser type の変更を回避（test.use はファイル先頭でのみ可能）。

const checkNoHorizontalOverflow = async (
  page: import('@playwright/test').Page,
  label: string
) => {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    }
  })
  const tolerance = 1
  expect(
    overflow.scrollWidth,
    `${label}: scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`
  ).toBeLessThanOrEqual(overflow.clientWidth + tolerance)
}

const runViewportFlow = (deviceLabel: string) =>
  async ({ page }: { page: import('@playwright/test').Page }) => {
    // Playwright は test ごとに新規 context を作成するため localStorage は初期状態。
    // ここで addInitScript を入れるとナビゲーション毎に再発火してユーザーが消えるので使わない。

    // 1. UserSelectScreen
    await page.goto('/')
    await expect(page.getByText('誰が使いますか？')).toBeVisible()
    await checkNoHorizontalOverflow(page, `${deviceLabel}-UserSelectScreen`)

    // ユーザー作成
    await page.getByRole('button', { name: /新しいユーザーを追加/ }).click()
    await page.getByPlaceholder('名前を入力').fill('Mobile')
    await page.getByRole('button', { name: '作成', exact: true }).click()

    // 2. HomeScreen
    await expect(page.getByText('Mobile さん')).toBeVisible()
    await checkNoHorizontalOverflow(page, `${deviceLabel}-HomeScreen`)

    // 3. FlashcardScreen (intro)
    await page.getByRole('button', { name: /フラッシュカード/ }).click()
    await expect(page.getByRole('heading', { name: 'フラッシュカード' })).toBeVisible()
    await checkNoHorizontalOverflow(page, `${deviceLabel}-FlashcardScreen-intro`)

    // 4. QuizScreen (intro)
    await page.goto('/quiz/week05')
    await expect(page.getByRole('heading', { name: 'クイズ' })).toBeVisible()
    await checkNoHorizontalOverflow(page, `${deviceLabel}-QuizScreen-intro`)

    // 5. ProgressScreen
    await page.goto('/progress')
    await expect(page.getByText(/Mobile さんの進捗/)).toBeVisible()
    await checkNoHorizontalOverflow(page, `${deviceLabel}-ProgressScreen`)
  }

test.describe('TC-NF-004: モバイル viewport (iPhone 14 / 390x844)', () => {
  test.use({ viewport: devices['iPhone 14'].viewport, hasTouch: devices['iPhone 14'].hasTouch })
  test('主要 5 画面で水平オーバーフローなし', runViewportFlow('iPhone14'))
})

test.describe('TC-NF-004: モバイル viewport (Pixel 5 / 393x851)', () => {
  test.use({ viewport: devices['Pixel 5'].viewport, hasTouch: devices['Pixel 5'].hasTouch })
  test('主要 5 画面で水平オーバーフローなし', runViewportFlow('Pixel5'))
})
