import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:opacity-40',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-slate-300',
}

const sizes: Record<Size, string> = {
  // sm stays compact for toolbars/headers but keeps a 32px hit target and
  // 13px text so Thai labels and icons stay legible.
  sm: 'h-8 px-2.5 text-[13px] gap-1.5',
  md: 'h-9 px-3 text-sm gap-1.5',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'ghost', size = 'md', className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
}
