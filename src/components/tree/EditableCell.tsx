import { useEffect, useRef, useState } from 'react'
import type { ColumnKind } from '../../model/types'
import { formatDate } from '../../lib/date'
import { useAppStore } from '../../state/store'
import { useT } from '../../lib/i18n'
import { cx } from '../../lib/cx'
import { Input } from '../ui/Input'

const NUMERIC_KINDS: ColumnKind[] = ['number', 'currency', 'percent']

function displayOf(
  kind: ColumnKind,
  value: string | number | boolean | null | undefined,
  lang: string,
  optionLabels?: Record<string, string>,
): string {
  if (value === undefined || value === null || value === '') return ''
  switch (kind) {
    case 'select':
      // A derived (roll-up) status still needs its label — without this the
      // raw stored key shows through, e.g. 'in_progress' instead of 'In progress'.
      return optionLabels?.[String(value)] ?? String(value)
    case 'date':
      return formatDate(String(value), lang === 'th' ? 'th' : 'en')
    case 'currency':
      return Number(value).toLocaleString()
    case 'number':
      return Number(value).toLocaleString()
    case 'percent':
      return `${value}%`
    default:
      return String(value)
  }
}

/**
 * One editable grid cell. Click to edit; Enter/blur commits, Escape cancels.
 * `derived` renders a computed (roll-up) value that is not editable.
 */
export function EditableCell({
  kind,
  value,
  options,
  optionLabels,
  derived = false,
  align = 'left',
  onCommit,
}: {
  kind: ColumnKind
  value: string | number | boolean | null | undefined
  options?: string[]
  /** Localized labels per option value (e.g. status_todo → "รอทำ"). */
  optionLabels?: Record<string, string>
  derived?: boolean
  align?: 'left' | 'right'
  onCommit?: (v: number | string) => void
}) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const start = () => {
    if (derived || !onCommit) return
    setDraft(value === undefined || value === null ? '' : String(value))
    if (kind !== 'select') setEditing(true)
  }

  const finish = (cancel = false) => {
    if (!cancel && onCommit) {
      if (NUMERIC_KINDS.includes(kind)) {
        const n = parseFloat(draft.replace(/,/g, ''))
        if (!Number.isNaN(n)) {
          onCommit(kind === 'percent' ? Math.max(0, Math.min(100, Math.round(n * 10) / 10)) : n)
        }
      } else if (draft !== '') {
        onCommit(draft)
      }
    }
    setEditing(false)
  }

  if (kind === 'select' && !editing && !derived) {
    // Click-through select: render the select directly for zero-friction edits.
    const raw = value === undefined || value === null ? '' : String(value)
    return (
      // Not the shared <Select>: its padding is sized for a standalone form
      // control and Tailwind emits `py-1.5` after `py-0`, so composing over it
      // cannot win and the label ends up clipped inside a 28px grid row.
      <select
        className={cx(
          'h-7 w-full cursor-pointer rounded-md border border-transparent bg-transparent px-1 py-0',
          'text-[13px] leading-none text-slate-800 hover:border-slate-300',
          'focus:border-indigo-500 focus:outline-none',
          align === 'right' && 'text-right',
        )}
        value={raw}
        onChange={(e) => onCommit?.(e.target.value)}
      >
        <option value=""></option>
        {(options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {optionLabels?.[opt] ?? opt}
          </option>
        ))}
      </select>
    )
  }

  if (editing) {
    const type = kind === 'date' ? 'date' : NUMERIC_KINDS.includes(kind) ? 'number' : 'text'
    return (
      <Input
        ref={inputRef}
        type={type}
        min={kind === 'percent' ? 0 : undefined}
        max={kind === 'percent' ? 100 : undefined}
        step={kind === 'currency' ? 'any' : undefined}
        autoFocus
        className="h-7 px-1 py-0 text-[13px]"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => finish()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') finish()
          if (e.key === 'Escape') finish(true)
          e.stopPropagation()
        }}
      />
    )
  }

  const shown = displayOf(kind, value, lang, optionLabels)
  return (
    <div
      onClick={start}
      title={derived ? t('derivedHint') : shown || undefined}
      className={cx(
        'flex h-7 cursor-default items-center truncate px-1 text-[13px]',
        align === 'right' && 'justify-end tabular-nums',
        derived ? 'italic text-slate-400' : 'text-slate-700 hover:bg-slate-50 hover:ring-1 hover:ring-slate-200',
      )}
    >
      {shown}
    </div>
  )
}
