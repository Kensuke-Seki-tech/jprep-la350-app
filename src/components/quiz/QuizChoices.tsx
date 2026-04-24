
interface Props {
  choices: string[]
  correctAnswer: string
  selected: string | null
  onAnswer: (selected: string) => void
}

export function QuizChoices({ choices, correctAnswer, selected, onAnswer }: Props) {
  return (
    <div className="space-y-3">
      {choices.map((choice, i) => {
        let style = 'bg-white border-2 border-slate-200 text-slate-800'
        if (selected) {
          if (choice === correctAnswer)   style = 'bg-green-500 border-green-500 text-white'
          else if (choice === selected)   style = 'bg-red-500 border-red-500 text-white'
          else                            style = 'bg-white border-slate-100 text-slate-300'
        }
        return (
          <button
            key={`${choice}-${i}`}
            onClick={() => !selected && onAnswer(choice)}
            disabled={!!selected}
            className={`w-full text-left px-5 py-4 rounded-xl font-medium text-base transition-colors min-h-[56px] ${style}`}
          >
            {choice}
          </button>
        )
      })}
    </div>
  )
}
