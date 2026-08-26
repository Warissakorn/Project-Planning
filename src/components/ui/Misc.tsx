import type { ReactNode } from 'react'
import type { TaskStatus } from '../../model/types'
import { cx } from '../../lib/cx'

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600 ring-slate-200',
  in_progress: 'bg-blue-50 text-blue-700 ring-blue-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export function StatusBadge({ status, label }: { status: TaskStatus; label: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
        statusStyles[status],
      )}
    >
      {label}
    </span>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {message ? <p className="mt-1.5 text-sm text-slate-500">{message}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-8 rounded-md px-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-8 rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      {icon ? <div className="text-slate-300">{icon}</div> : null}
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {hint ? <p className="max-w-xs text-xs text-slate-400">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
