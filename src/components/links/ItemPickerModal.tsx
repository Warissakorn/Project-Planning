import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { ID } from '../../model/types'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'

export interface PickerItem {
  id: ID
  /** e.g. "1.2.1 Design DB" */
  label: string
  /** e.g. owning structure name */
  sub?: string
}

/** Generic searchable single-pick list used by dependency & link flows. */
export function ItemPickerModal({
  open,
  title,
  items,
  emptyHint,
  onPick,
  onClose,
}: {
  open: boolean
  title: string
  items: PickerItem[]
  emptyHint?: string
  onPick: (id: ID) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.sub?.toLowerCase().includes(q))
  }, [items, query])

  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-lg">
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            autoFocus
            className="pl-7"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-80 overflow-y-auto rounded-md border border-slate-200">
          {filtered.length === 0 ? (
            <p className="p-3 text-center text-xs text-slate-400">{emptyHint ?? '—'}</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onPick(item.id)
                  onClose()
                }}
                className="block w-full truncate border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 last:border-0 hover:bg-indigo-50"
              >
                {item.label}
                {item.sub ? <span className="ml-2 text-xs text-slate-400">{item.sub}</span> : null}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
