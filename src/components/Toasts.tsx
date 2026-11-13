import { Link } from 'react-router-dom'
import { CheckCircle2, X, FlaskConical, Info } from 'lucide-react'
import { useDemo } from '../demo/store'

export function Toasts() {
  const { toasts, dismissToast } = useDemo()
  return (
    <div className="fixed z-[95] bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 w-[min(440px,calc(100vw-24px))] space-y-2" aria-live="polite" role="status">
      {toasts.map((t) => {
        const I = t.tone === 'demo' ? FlaskConical : t.tone === 'info' ? Info : CheckCircle2
        return (
          <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-ink text-white pl-4 pr-2 py-3 shadow-modal animate-rise">
            <I size={20} className={t.tone === 'demo' ? 'text-[#FFD27A]' : 'text-[#7FE0B0]'} />
            <span className="flex-1 text-[15px] leading-snug">{t.text}</span>
            {t.action && <Link to={t.action.to} onClick={() => dismissToast(t.id)} className="text-[14px] font-semibold text-[#AFC0FF] hover:text-white px-2 whitespace-nowrap">{t.action.label}</Link>}
            <button onClick={() => dismissToast(t.id)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Melding sluiten"><X size={16} /></button>
          </div>
        )
      })}
    </div>
  )
}
