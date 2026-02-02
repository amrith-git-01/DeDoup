import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost'
    isLoading?: boolean
    children: ReactNode
}

export function Button({
    variant = 'primary',
    isLoading = false,
    className,
    children, 
    disabled,
    ...props
}: ButtonProps) {
  const base =
  'inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 focus:outline-none focus:ring focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95';
  
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
      'bg-primary-600 text-white focus-visible:ring-primary-500',
      secondary:
      'bg-white text-gray-700 border border-gray-300 focus-visible:ring-primary-500',
      ghost:
      'bg-transparent text-gray-600 focus-visible:ring-primary-500',
  }
    return (
        <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
      
    </button>
    )
}