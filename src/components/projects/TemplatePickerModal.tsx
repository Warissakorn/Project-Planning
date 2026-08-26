import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { countTemplateTasks, TEMPLATE_CATEGORIES } from '../../model/templates'
import type { TemplateCategory, TemplateEntry } from '../../model/templates'
import { useAppStore } from '../../state/store'
import { bl, translate, useT } from '../../lib/i18n'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'

/**
 * Categorized template picker for the home page: search filters across
 * th/en names and descriptions, entries stay grouped under their category
 * heading, clicking one creates a project immediately.
 */
export function TemplatePickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  onPick: (entry: TemplateEntry) => void
}) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const [query, setQuery] = useState('')

  const groups = useMemo<TemplateCategory[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TEMPLATE_CATEGORIES
    const hit = (e: TemplateEntry) =>
      e.name.th.toLowerCase().includes(q) ||
      e.name.en.toLowerCase().includes(q) ||
      e.desc.th.toLowerCase().includes(q) ||
      e.desc.en.toLowerCase().includes(q)
    return TEMPLATE_CATEGORIES.map((c) => ({
      ...c,
      templates: c.templates.filter(hit),
    })).filter((c) => c.templates.length > 0)
  }, [query])

  return (
    <Modal open={open} title={t('templatesTitle')} onClose={onClose} width="max-w-2xl">
      <div className="relative">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          autoFocus
          className="pl-7"
          placeholder={t('templatesSearchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-3 max-h-[55vh] overflow-y-auto rounded-md border border-slate-200">
        {groups.length === 0 ? (
          <p className="p-4 text-center text-xs text-slate-400">{t('templatesNoMatch')}</p>
        ) : (
          groups.map((cat) => (
            <section key={cat.id}>
              <h3 className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {cat.emoji} {bl(cat.label, lang)}
              </h3>
              {cat.templates.map((entry) => {
                const counts = countTemplateTasks(entry)
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onPick(entry)
                      onClose()
                    }}
                    className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-indigo-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {bl(entry.name, lang)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {bl(entry.desc, lang)}
                      </span>
                    </span>
                    <span className="mt-0.5 shrink-0 whitespace-nowrap text-[11px] tabular-nums text-slate-400">
                      {translate(lang, 'tplPhaseTaskStats', counts)}
                    </span>
                  </button>
                )
              })}
            </section>
          ))
        )}
      </div>
    </Modal>
  )
}
