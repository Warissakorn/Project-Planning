import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({
  open,
  title,
  onClose,
  children,
  width = 'max-w-md',
}: {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div role="dialog" aria-modal="true" className={`w-full ${width} rounded-xl bg-white shadow-xl`}>
        {title ? (
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            <Button size="sm" onClick={onClose} aria-label="close">
              <X size={15} />
            </Button>
          </div>
        ) : null}
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
