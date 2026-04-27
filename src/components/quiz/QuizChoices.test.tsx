import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizChoices } from './QuizChoices'

const choices = ['苗木', '廃止する', 'けだるい', 'しなやかな']
const correct = '苗木'

describe('QuizChoices', () => {
  it('TC-C-010: 4 つの選択肢ボタンが表示される', () => {
    render(<QuizChoices choices={choices} correctAnswer={correct} selected={null} onAnswer={vi.fn()} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('TC-C-011: 正解クリック時、正解ボタンが緑スタイル', async () => {
    const onAnswer = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(
      <QuizChoices choices={choices} correctAnswer={correct} selected={null} onAnswer={onAnswer} />,
    )
    await user.click(screen.getByRole('button', { name: '苗木' }))
    expect(onAnswer).toHaveBeenCalledWith('苗木')
    rerender(<QuizChoices choices={choices} correctAnswer={correct} selected="苗木" onAnswer={onAnswer} />)
    expect(screen.getByRole('button', { name: '苗木' }).className).toContain('green-500')
  })

  it('TC-C-012: 不正解クリック時、選択ボタン赤、正解ボタン緑', () => {
    render(<QuizChoices choices={choices} correctAnswer={correct} selected="廃止する" onAnswer={vi.fn()} />)
    expect(screen.getByRole('button', { name: '廃止する' }).className).toContain('red-500')
    expect(screen.getByRole('button', { name: '苗木' }).className).toContain('green-500')
  })

  it('TC-C-013: 回答後は別ボタンクリックで onAnswer が呼ばれない', async () => {
    const onAnswer = vi.fn()
    const user = userEvent.setup()
    render(<QuizChoices choices={choices} correctAnswer={correct} selected="苗木" onAnswer={onAnswer} />)
    await user.click(screen.getByRole('button', { name: 'けだるい' }))
    expect(onAnswer).not.toHaveBeenCalled()
  })

  it('TC-C-014: onAnswer に選択された値が引数として渡る', async () => {
    const onAnswer = vi.fn()
    const user = userEvent.setup()
    render(<QuizChoices choices={choices} correctAnswer={correct} selected={null} onAnswer={onAnswer} />)
    await user.click(screen.getByRole('button', { name: 'しなやかな' }))
    expect(onAnswer).toHaveBeenCalledWith('しなやかな')
  })
})
