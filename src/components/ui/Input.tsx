import type { InputHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

const base =
  'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100'

// React 19: ref is a regular prop on function components.
export function Input({
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={cx(base, className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(base, 'resize-y', className)} {...rest} />
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(base, 'cursor-pointer', className)} {...rest} />
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-400">{hint}</span> : null}
    </label>
  )
}
