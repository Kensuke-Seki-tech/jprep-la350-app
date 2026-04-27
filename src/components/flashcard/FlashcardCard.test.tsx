import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlashcardCard } from './FlashcardCard'
import { mockWords } from '@/test/fixtures'

describe('FlashcardCard - en_to_ja モード', () => {
  it('TC-C-001: 初期表示で英語が表示される', () => {
    render(<FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={vi.fn()} />)
    expect(screen.getByText('sapling')).toBeInTheDocument()
  })

  it('TC-C-002: 初期表示で日本語が「裏面」に存在するが flipped=false', () => {
    const { container } = render(
      <FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={vi.fn()} />,
    )
    const inner = container.querySelector('.flip-inner')
    expect(inner?.className).not.toContain('flipped')
  })

  it('TC-C-003: カードをクリックするとフリップして日本語が表示される', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={vi.fn()} />,
    )
    const card = container.querySelector('.flip-card')!
    await user.click(card)
    await waitFor(() => {
      const inner = container.querySelector('.flip-inner')
      expect(inner?.className).toContain('flipped')
    })
    const back = container.querySelector('.flip-back')!
    expect(within(back as HTMLElement).getByText('苗木')).toBeInTheDocument()
  })

  it('TC-C-004: フリップ後に「Got it!」で onResult("correct") が呼ばれる', async () => {
    const onResult = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={onResult} />,
    )
    await user.click(container.querySelector('.flip-card')!)
    const gotIt = await screen.findByRole('button', { name: 'Got it!' })
    await user.click(gotIt)
    await waitFor(() => expect(onResult).toHaveBeenCalledWith('correct'))
  })

  it('TC-C-005: フリップ後に「Again」で onResult("incorrect") が呼ばれる', async () => {
    const onResult = vi.fn()
    const user = userEvent.setup()
    const { container } = render(
      <FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={onResult} />,
    )
    await user.click(container.querySelector('.flip-card')!)
    const again = await screen.findByRole('button', { name: 'Again' })
    await user.click(again)
    await waitFor(() => expect(onResult).toHaveBeenCalledWith('incorrect'))
  })

  it('TC-C-006: aria-label が単語に応じて設定されている', () => {
    render(<FlashcardCard word={mockWords[0]!} index={0} total={6} mode="en_to_ja" onResult={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'sapling' })).toBeInTheDocument()
  })
})
