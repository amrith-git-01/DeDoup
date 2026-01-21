import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: 'primary' | 'secondary' | 'ghost'
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
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants: Record<ButtonProps['variant'], string> = {
        primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
        ghost:
        'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-primary-500',
    }
    return (
        <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="opacity-80">
          {children}
        </span>
      ) : (
        children
      )}
    </button>
    )
}