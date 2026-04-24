interface Props {
  value: number // 0-100
  className?: string
  color?: string
}

export function ProgressBar({ value, className = '', color }: Props) {
  const bg = color ?? (value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : 'bg-slate-400')
  return (
    <div className={`h-2 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${bg} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}
