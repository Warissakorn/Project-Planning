import { useEffect } from 'react'
import { BookOpen, X } from 'lucide-react'
// The designed guide ships with the app; ?raw keeps it a build-time string so
// the overlay works fully offline.
import guideHtml from '../../../docs/user-guide.th.html?raw'
import { useT } from '../../lib/i18n'
import { Button } from '../ui/Button'

/**
 * Full-screen sheet showing the user guide inside an iframe. The generic Modal
 * caps its body at 70vh which is too tight for a document — and srcDoc of the
 * standalone HTML gives us its TOC sidebar layout without adding any
 * markdown/rich-text dependency.
 */
// srcDoc resolves relative URLs against about:srcdoc, so the guide asks for the
// fonts through a placeholder we swap for the real base at render time.
const guide = guideHtml.replaceAll('__BASE__', import.meta.env.BASE_URL)

export function UserGuideOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT()

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
      className="fixed inset-0 z-50 bg-black/40 p-0 sm:p-[5vh_1rem]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('helpTitle')}
        className="mx-auto flex h-screen max-w-5xl flex-col overflow-hidden rounded-none bg-white shadow-xl sm:h-[90vh] sm:rounded-xl"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2.5">
          <BookOpen size={16} className="text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-800">{t('helpTitle')}</h2>
          <Button size="sm" onClick={onClose} aria-label="close" className="ml-auto">
            <X size={15} />
          </Button>
        </div>
        <iframe
          title={t('helpTitle')}
          srcDoc={guide}
          className="h-full w-full flex-1 border-0"
        />
      </div>
    </div>
  )
}
