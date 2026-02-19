import clsx from 'clsx';
import type { ButtonProps } from '../../types/ui';

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Outer button keeps layout stable
  const base =
    'relative inline-flex items-center justify-center rounded-xl focus:outline-none ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-6 py-3.5 text-[15px]',
    lg: 'px-8 py-4 text-base',
  };

  const innerBase =
    `inline-flex w-full items-center justify-center ${variant === 'icon' || variant === 'primary-icon' ? '' : sizes[size]} font-semibold rounded-xl ` +
    'transition-[box-shadow] duration-200 ease-out ' +
    'shadow-sm group-hover:shadow-md group-active:shadow-sm ';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-primary-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-primary-500',
    icon: 'bg-transparent text-gray-900 hover:bg-gray-100 p-2 border border-transparent hover:border-gray-200 rounded-full',
    'primary-icon':
      'bg-primary-600 text-white hover:bg-primary-700 p-2 rounded-full border border-transparent shadow-sm hover:shadow-md active:shadow-sm transition-[box-shadow] duration-200',
  };

  return (
    <button className={clsx(base, 'group', className)} disabled={disabled || isLoading} {...props}>
      <span className={clsx(innerBase, variants[variant])}>{children}</span>
    </button>
  );
}
