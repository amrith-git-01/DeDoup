import type {InputHTMLAttributes} from 'react'
import clsx from 'clsx'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement>{
    label: string;
    error?: string | null;
    containerClassName?: string;
}

export function TextField({
    label,
    id,
    error,
    className,
    containerClassName,
    ...props
  }: TextFieldProps) {
    const inputId = id || props.name
  
    return (
      <div className={clsx('space-y-1', containerClassName)}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <input
          id={inputId}
          className={clsx(
            'input',
            error &&
              'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/40',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-600 mt-0.5"
          >
            {error}
          </p>
        )}
      </div>
    )
  }