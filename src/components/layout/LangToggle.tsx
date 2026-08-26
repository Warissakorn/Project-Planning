import { Languages } from 'lucide-react'
import { useAppStore } from '../../state/store'

/** TH/EN switch shown in both page headers. */
export function LangToggle() {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)

  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
      title="Language / ภาษา"
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
    >
      <Languages size={15} />
      {lang === 'th' ? 'TH' : 'EN'}
    </button>
  )
}
