// dashboard/src/components/ui/TextField.tsx
import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import { Eye, EyeOff, X } from 'lucide-react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  containerClassName?: string
  onClear?: () => void
  showPasswordToggle?: boolean
  isPasswordVisible?: boolean
  onTogglePassword?: () => void
}

export function TextField({
  label,
  id,
  error,
  className,
  containerClassName,
  onClear,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePassword,
  ...props
}: TextFieldProps) {
  const inputId = id || props.name
  const showClearIcon = onClear && props.value && String(props.value).length > 0

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      <label
        htmlFor={inputId}
        className="block text-base font-normal tracking-tight text-gray-900"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={clsx(
            'w-full px-4 py-3 text-base border rounded-xl transition-all duration-200',
            'placeholder:text-gray-400',
            // Base focus styles (ring-2, ring-offset-0, transparent border) applied to ALL states
            'focus:outline-none focus:ring-2 focus:border-transparent focus:ring-offset-0',
            
            error
              ? 'border-red-300 bg-red-50/30 focus:ring-red-500' // Error: Red border/bg usually, Red ring on focus
              : 'border-gray-300 bg-white focus:ring-primary-500 focus:bg-white', // Normal: Gray border, Blue ring on focus
            
            // Add padding for icons
            (showClearIcon || showPasswordToggle) && 'pr-10',
            
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        
        {/* Icon container - only show one icon at a time, password toggle takes priority */}
        {(showPasswordToggle || showClearIcon) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {showPasswordToggle ? (
  <button
    type="button"
    onClick={onTogglePassword}
    className="inline-flex items-center justify-center text-gray-400 hover:text-primary-600 hover:scale-110 active:scale-95 transition-all duration-200 ease-out focus:outline-none focus-visible:text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 rounded-md origin-center"
    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
    tabIndex={-1}
  >
    {isPasswordVisible ? (
      <Eye className="w-5 h-5" />
    ) : (
      <EyeOff className="w-5 h-5" />
    )}
  </button>
) : showClearIcon ? (
  <button
    type="button"
    onClick={onClear}
    className="inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all duration-200 ease-out focus:outline-none focus-visible:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 rounded-md origin-center"
    aria-label="Clear field"
    tabIndex={-1}
  >
    <X className="w-4 h-4" />
  </button>
) : null}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-600 flex items-center gap-2">
          {error}
        </p>
      )}
    </div>
  )
}