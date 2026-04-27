import { getInitial } from '@/utils/format'

interface Props {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-16 h-16 text-2xl' }

export function UserAvatar({ name, color, size = 'md', onClick }: Props) {
  const cls = `${sizes[size]} rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0`
  const style = { backgroundColor: color }
  const aria = `ユーザー: ${name}`
  const child = getInitial(name)

  if (onClick) {
    return (
      <button onClick={onClick} className={cls} style={style} aria-label={aria}>
        {child}
      </button>
    )
  }
  return (
    <div className={cls} style={style} aria-label={aria}>
      {child}
    </div>
  )
}
