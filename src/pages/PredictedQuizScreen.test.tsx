import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PredictedQuizScreen from './PredictedQuizScreen'
import { mockQuizData } from '@/test/fixtures'

vi.mock('@/hooks/useWeeks', () => ({
  useWeeksConfig: () => ({
    data: [{ weekId: 'week05', weekNumber: 5, label: 'Week 5', status: 'available', dataUrl: '/data/week05.json', wordCount: 30 }],
  }),
}))

vi.mock('@/hooks/useUserStore', () => ({
  useCurrentUser: () => ({ userId: 'u1', displayName: 'Test', avatarColor: '#000', createdAt: '', lastLoginAt: '' }),
  useUserStore: () => ({ users: [], currentUserId: 'u1', addUser: vi.fn(), selectUser: vi.fn(), removeUser: vi.fn(), clearCurrentUser: vi.fn() }),
}))

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={['/predicted-quiz/week05']}>
      <Routes>
        <Route path="/predicted-quiz/:weekId" element={<PredictedQuizScreen />} />
      </Routes>
    </MemoryRouter>,
  )
}

function mockFetchOk(data: unknown = mockQuizData) {
  vi.mocked(fetch).mockResolvedValueOnce(
    new Response(JSON.stringify(data), { status: 200 }),
  )
}

beforeEach(() => {
  vi.mocked(fetch).mockReset()
})

async function startToPart1(user: ReturnType<typeof userEvent.setup>) {
  mockFetchOk()
  renderScreen()
  await screen.findByText(/予想問題/)
  await user.click(screen.getByRole('button', { name: 'スタート' }))
  await screen.findByText('Vocabulary Matching')
}

describe('PredictedQuizScreen - Part 1 マッチング', () => {
  it('TC-U-PRED-01: 正解ペアでマッチ完了', async () => {
    const user = userEvent.setup()
    await startToPart1(user)
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /a young tree/ }))
    expect(await screen.findByText(/1 \/ 10 マッチ完了/)).toBeInTheDocument()
  })

  it('TC-U-PRED-02: 誤ったペアで wrongPair セット & 500ms 後リセット', async () => {
    const user = userEvent.setup()
    await startToPart1(user)
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /to officially end or annul/ }))
    const wrongBtn = screen.getByRole('button', { name: 'sapling' })
    expect(wrongBtn.className).toContain('red')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'sapling' }).className).not.toContain('red')
    }, { timeout: 1500 })
  })

  it('TC-U-PRED-03: 全 10 ペア完了で [Part 2 へ] ボタン表示', async () => {
    const user = userEvent.setup()
    await startToPart1(user)
    for (const [w, defRe] of ALL_PAIRS) {
      await user.click(screen.getByRole('button', { name: w }))
      await user.click(screen.getByRole('button', { name: defRe }))
    }
    expect(await screen.findByText('全問マッチ完了！🎉')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Part 2 へ' })).toBeInTheDocument()
  })
})

const ALL_PAIRS: Array<[string, RegExp]> = [
  ['sapling', /a young tree/],
  ['abolish', /to officially end or annul/],
  ['languid', /weak and drooping from exhaustion/],
  ['pirouette', /to spin on the tip of one foot/],
  ['supple', /easily bent/],
  ['intrepid', /fearlessly bold and brave/],
  ['fortify', /to strengthen/],
  ['tranquil', /calm and peaceful/],
  ['vigilant', /keeping careful watch/],
  ['rigid', /unable to bend/],
]

async function jumpToPart2(user: ReturnType<typeof userEvent.setup>) {
  await startToPart1(user)
  for (const [w, defRe] of ALL_PAIRS) {
    await user.click(screen.getByRole('button', { name: w }))
    await user.click(screen.getByRole('button', { name: defRe }))
  }
  await user.click(screen.getByRole('button', { name: 'Part 2 へ' }))
  await screen.findByText('Sentence Gap Fill')
}

describe('PredictedQuizScreen - Part 2 ギャップ', () => {
  it('TC-U-PRED-04: 正しい単語で空欄を埋める', async () => {
    const user = userEvent.setup()
    await jumpToPart2(user)
    const q1Blank = screen.getAllByRole('button', { name: /＿＿＿/ })[0]!
    await user.click(q1Blank)
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'sapling' }).some(b => (b as HTMLButtonElement).disabled)).toBe(true)
    })
  })

  it('TC-U-PRED-05: 誤った単語で 600ms 後にリセット', async () => {
    const user = userEvent.setup()
    await jumpToPart2(user)
    const q1Blank = screen.getAllByRole('button', { name: /＿＿＿/ })[0]!
    await user.click(q1Blank)
    await user.click(screen.getByRole('button', { name: 'pirouette' }))
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /＿＿＿/ })[0]).toBeInTheDocument()
    }, { timeout: 1500 })
  })

  it('TC-U-PRED-06: 単語バンクで正解済単語は disabled', async () => {
    const user = userEvent.setup()
    await jumpToPart2(user)
    const q1Blank = screen.getAllByRole('button', { name: /＿＿＿/ })[0]!
    await user.click(q1Blank)
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await waitFor(() => {
      const saplingBtns = screen.getAllByRole('button', { name: 'sapling' }) as HTMLButtonElement[]
      expect(saplingBtns.some(b => b.disabled)).toBe(true)
    })
  })
})

async function jumpToPart3(user: ReturnType<typeof userEvent.setup>) {
  await jumpToPart2(user)
  for (const word of ['sapling', 'abolish', 'languid', 'pirouette', 'supple'] as const) {
    const blanks = screen.getAllByRole('button', { name: /＿＿＿/ })
    if (blanks[0]) await user.click(blanks[0])
    await user.click(screen.getByRole('button', { name: word }))
  }
  await user.click(await screen.findByRole('button', { name: 'Part 3 へ' }))
  await screen.findByText('Multiple Choice')
}

describe('PredictedQuizScreen - Part 3 多肢選択', () => {
  it('TC-U-PRED-07: 正解ボタンが緑に', async () => {
    const user = userEvent.setup()
    await jumpToPart3(user)
    await user.click(screen.getByRole('button', { name: 'a young tree' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'a young tree' }).className).toContain('green')
    })
  })

  it('TC-U-PRED-08: 誤答時に選択ボタン赤、正解ボタン緑', async () => {
    const user = userEvent.setup()
    await jumpToPart3(user)
    await user.click(screen.getByRole('button', { name: 'a tree' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'a tree' }).className).toContain('red')
      expect(screen.getByRole('button', { name: 'a young tree' }).className).toContain('green')
    })
  })

  it('TC-U-PRED-09: 二重回答防止（answered 後の再タップ無効）', async () => {
    const user = userEvent.setup()
    await jumpToPart3(user)
    await user.click(screen.getByRole('button', { name: 'a young tree' }))
    const second = screen.getByRole('button', { name: 'a tree' }) as HTMLButtonElement
    expect(second.disabled).toBe(true)
  })
})

async function jumpToPart4(user: ReturnType<typeof userEvent.setup>) {
  await jumpToPart3(user)
  await user.click(screen.getByRole('button', { name: 'a young tree' }))
  await user.click(screen.getByRole('button', { name: 'to end' }))
  await user.click(screen.getByRole('button', { name: 'weak' }))
  await user.click(screen.getByRole('button', { name: 'brave' }))
  await user.click(screen.getByRole('button', { name: 'calm' }))
  await user.click(await screen.findByRole('button', { name: 'Part 4 へ' }))
  await screen.findByText('Dictation')
}

describe('PredictedQuizScreen - Part 4 ディクテーション', () => {
  it('TC-U-PRED-10: 完全一致で +3pt', async () => {
    const user = userEvent.setup()
    await jumpToPart4(user)
    const inputs = screen.getAllByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(inputs[0]!, 'we planted a sapling in the garden last spring')
    await user.click(screen.getAllByRole('button', { name: '採点' })[0]!)
    await waitFor(() => {
      expect(inputs[0]!.className).toContain('green')
    })
  })

  it('TC-U-PRED-11: 部分一致 50% 以上で +1pt（緑表示）', async () => {
    const user = userEvent.setup()
    await jumpToPart4(user)
    const inputs = screen.getAllByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(inputs[0]!, 'we planted sapling garden spring')
    await user.click(screen.getAllByRole('button', { name: '採点' })[0]!)
    await waitFor(() => {
      expect(inputs[0]!.className).toContain('green')
    })
  })

  it('TC-U-PRED-12: 部分一致 50% 未満で done=false（赤表示）', async () => {
    const user = userEvent.setup()
    await jumpToPart4(user)
    const inputs = screen.getAllByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(inputs[0]!, 'hello world')
    await user.click(screen.getAllByRole('button', { name: '採点' })[0]!)
    await waitFor(() => {
      expect(inputs[0]!.className).toContain('red')
    })
  })

  it('TC-U-PRED-13: 答え表示で done=false 確定（reveal ペナルティ）', async () => {
    const user = userEvent.setup()
    await jumpToPart4(user)
    const revealBtns = screen.getAllByRole('button', { name: '👁 答え' })
    await user.click(revealBtns[0]!)
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('聴こえた文を書き取ろう...')
      expect(inputs[0]!.className).toContain('red')
    })
  })

  it('TC-U-PRED-14: 入力正規化（大文字・カンマ・連続スペース）', async () => {
    const user = userEvent.setup()
    await jumpToPart4(user)
    const inputs = screen.getAllByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(inputs[0]!, 'WE  PLANTED, A SAPLING IN THE GARDEN LAST SPRING!')
    await user.click(screen.getAllByRole('button', { name: '採点' })[0]!)
    await waitFor(() => {
      expect(inputs[0]!.className).toContain('green')
    })
  })
})

describe('PredictedQuizScreen - スコア集計と結果画面', () => {
  it('TC-U-PRED-15: stale closure 回避（全 Part 通過で score 累積が正しく結果画面に表示される）', async () => {
    const user = userEvent.setup()
    await jumpToPart4(user)
    const inputs = screen.getAllByPlaceholderText('聴こえた文を書き取ろう...')
    const dictTexts = [
      'we planted a sapling in the garden last spring',
      'they abolished the law',
      'a languid afternoon by the river',
      'an intrepid explorer crossed the desert',
      'tranquil waters reflect the sky',
    ]
    for (let i = 0; i < dictTexts.length; i++) {
      await user.type(inputs[i]!, dictTexts[i]!)
      await user.click(screen.getAllByRole('button', { name: '採点' })[0]!)
    }
    await user.click(await screen.findByRole('button', { name: '結果を見る' }))
    // Part1 全 10 +20 / Part2 全 5 +10 / Part3 全 5 +10 / Part4 全 5 完全一致 +15 = 55/55
    expect(await screen.findByText(/55 \/ 55 点/)).toBeInTheDocument()
  }, 20000)

  it('TC-U-PRED-16: 90%以上で 🏆 Outstanding!!', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ...mockQuizData,
      match: [{ word: 'sapling', def: 'a young tree' }],
      gap: [{ answer: 'sapling', sentence: 'plant a sapling now', ja: 'いま苗木を植える' }],
      bank: ['sapling'],
      mc: [{ q: 'meaning?', opts: ['a young tree', 'X', 'Y', 'Z'], answer: 0, word: 'sapling' }],
      dict: [{ text: 'plant a sapling', word: 'sapling' }],
    }), { status: 200 }))
    renderScreen()
    await screen.findByText(/予想問題/)
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    await screen.findByText('Vocabulary Matching')
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /a young tree/ }))
    await user.click(await screen.findByRole('button', { name: 'Part 2 へ' }))
    await user.click(screen.getByRole('button', { name: /＿＿＿/ }))
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(await screen.findByRole('button', { name: 'Part 3 へ' }))
    await user.click(screen.getByRole('button', { name: 'a young tree' }))
    await user.click(await screen.findByRole('button', { name: 'Part 4 へ' }))
    const input = screen.getByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(input, 'plant a sapling')
    await user.click(screen.getByRole('button', { name: '採点' }))
    await user.click(await screen.findByRole('button', { name: '結果を見る' }))
    expect(await screen.findByText('Outstanding!!')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('TC-U-PRED-17: 75-89% で 🎉 Great Job!', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ...mockQuizData,
      match: [{ word: 'sapling', def: 'a young tree' }],
      gap: [{ answer: 'sapling', sentence: 'plant a sapling now', ja: 'いま苗木を植える' }],
      bank: ['sapling'],
      mc: [{ q: 'meaning?', opts: ['a young tree', 'X', 'Y', 'Z'], answer: 0, word: 'sapling' }],
      dict: [{ text: 'plant a sapling', word: 'sapling' }],
    }), { status: 200 }))
    renderScreen()
    await screen.findByText(/予想問題/)
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    await screen.findByText('Vocabulary Matching')
    // Part1 正解 (+2)
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /a young tree/ }))
    await user.click(await screen.findByRole('button', { name: 'Part 2 へ' }))
    // Part2 正解 (+2)
    await user.click(screen.getByRole('button', { name: /＿＿＿/ }))
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(await screen.findByRole('button', { name: 'Part 3 へ' }))
    // Part3 正解 (+2)
    await user.click(screen.getByRole('button', { name: 'a young tree' }))
    await user.click(await screen.findByRole('button', { name: 'Part 4 へ' }))
    // Part4 部分一致 50%以上 (+1) → 計 7/9 = 77.78% → Great Job!
    const input = screen.getByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(input, 'plant sapling')
    await user.click(screen.getByRole('button', { name: '採点' }))
    await user.click(await screen.findByRole('button', { name: '結果を見る' }))
    expect(await screen.findByText('Great Job!')).toBeInTheDocument()
    expect(screen.getByText('🎉')).toBeInTheDocument()
  })

  it('TC-U-PRED-18: 0-29% で 🌱 Try Again', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ...mockQuizData,
      match: [{ word: 'sapling', def: 'a young tree' }],
      gap: [{ answer: 'sapling', sentence: 'plant a sapling now', ja: 'いま苗木を植える' }],
      bank: ['sapling'],
      mc: [{ q: 'meaning?', opts: ['a young tree', 'X', 'Y', 'Z'], answer: 0, word: 'sapling' }],
      dict: [{ text: 'plant a sapling', word: 'sapling' }],
    }), { status: 200 }))
    renderScreen()
    await screen.findByText(/予想問題/)
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    await screen.findByText('Vocabulary Matching')
    // Part1 正解 (+2)
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /a young tree/ }))
    await user.click(await screen.findByRole('button', { name: 'Part 2 へ' }))
    // Part2 正解 (+2)
    await user.click(screen.getByRole('button', { name: /＿＿＿/ }))
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(await screen.findByRole('button', { name: 'Part 3 へ' }))
    // Part3 誤答 (-1)
    await user.click(screen.getByRole('button', { name: 'X' }))
    await user.click(await screen.findByRole('button', { name: 'Part 4 へ' }))
    // Part4 reveal (-1) → 計 2/9 = 22.22% → Try Again
    await user.click(screen.getByRole('button', { name: '👁 答え' }))
    await user.click(await screen.findByRole('button', { name: '結果を見る' }))
    expect(await screen.findByText("Let's Try Again!")).toBeInTheDocument()
    expect(screen.getByText('🌱')).toBeInTheDocument()
  })

  it('TC-U-PRED-19: fetch 失敗時に「データが見つかりません」表示', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('boom'))
    renderScreen()
    expect(await screen.findByText('データが見つかりません')).toBeInTheDocument()
  })

  it('TC-U-PRED-20: phase 遷移シーケンス intro → part1', async () => {
    const user = userEvent.setup()
    mockFetchOk()
    renderScreen()
    expect(await screen.findByText(/予想問題/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    expect(await screen.findByText('Vocabulary Matching')).toBeInTheDocument()
  })
})

describe('PredictedQuizScreen — 出題範囲フィルタ', () => {
  it('TC-U-PRED-21: イントロ画面に出題範囲セクションが表示される', async () => {
    mockFetchOk()
    renderScreen()
    expect(await screen.findByText('出題範囲')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /全問/ })).toBeInTheDocument()
  })

  it('TC-U-PRED-22: 前回データなしの時、前回間違えた問題ボタンがdisabled', async () => {
    mockFetchOk()
    renderScreen()
    await screen.findByText('出題範囲')
    const wrongBtn = screen.getByRole('button', { name: /前回間違えた問題/ })
    expect(wrongBtn).toBeDisabled()
  })

  it('TC-U-PRED-23: 全問終了後に predicted_quiz_scores が localStorage に保存される', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockReset()
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ...mockQuizData,
      match: [{ word: 'sapling', def: 'a young tree' }],
      gap: [{ answer: 'sapling', sentence: 'plant a sapling now', ja: 'いま苗木を植える' }],
      bank: ['sapling'],
      mc: [{ q: 'meaning?', opts: ['a young tree', 'X', 'Y', 'Z'], answer: 0, word: 'sapling' }],
      dict: [{ text: 'plant a sapling', word: 'sapling' }],
    }), { status: 200 }))
    renderScreen()
    await screen.findByText(/予想問題/)
    await user.click(screen.getByRole('button', { name: 'スタート' }))
    // Part1 正解
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(screen.getByRole('button', { name: /a young tree/ }))
    await user.click(await screen.findByRole('button', { name: 'Part 2 へ' }))
    // Part2 正解
    await user.click(screen.getByRole('button', { name: /＿＿＿/ }))
    await user.click(screen.getByRole('button', { name: 'sapling' }))
    await user.click(await screen.findByRole('button', { name: 'Part 3 へ' }))
    // Part3 正解
    await user.click(screen.getByRole('button', { name: 'a young tree' }))
    await user.click(await screen.findByRole('button', { name: 'Part 4 へ' }))
    // Part4 正解
    const input = screen.getByPlaceholderText('聴こえた文を書き取ろう...')
    await user.type(input, 'plant a sapling')
    await user.click(screen.getByRole('button', { name: '採点' }))
    await user.click(await screen.findByRole('button', { name: '結果を見る' }))
    await screen.findByText('Outstanding!!')
    // localStorage に保存されていることを確認
    const { getItem } = await import('@/utils/storage')
    const saved = getItem<unknown[]>('user_u1_predicted_quiz_scores')
    expect(saved).toHaveLength(1)
  }, 20000)
})
