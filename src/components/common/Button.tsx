import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50',
  success:   'bg-green-600 text-white hover:bg-green-700',
  danger:    'bg-red-500 text-white hover:bg-red-600',
  ghost:     'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
}

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-xl',
  lg: 'px-6 py-4 text-lg rounded-2xl',
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`${variants[variant]} ${sizes[size]} font-semibold transition-colors min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
