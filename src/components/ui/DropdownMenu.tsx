import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

/**
 * Minimal dropdown: a trigger plus an absolutely-positioned panel that closes
 * on outside click / Escape. Menu items receive `close` so the panel shuts
 * after an action runs.
 */
export function DropdownMenu({
  button,
  children,
  width = 'w-52',
  className,
  triggerClassName,
}: {
  /** Trigger contents — rendered inside the menu's own <button>. */
  button: ReactNode
  children: (close: () => void) => ReactNode
  width?: string
  className?: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={triggerClassName}
      >
        {button}
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute right-0 z-40 mt-1 ${width} overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  )
}

/** One row inside a DropdownMenu panel. */
export function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon?: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
    >
      {icon ? <span className="text-slate-400">{icon}</span> : null}
      {label}
    </button>
  )
}
