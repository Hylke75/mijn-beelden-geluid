import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Lock, Users, Landmark, X, Info, ImageOff } from 'lucide-react'
import { cx } from '../lib/format'
import type { DemoPerson, Visibility } from '../data/types'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function useFocusTrap(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const node = ref.current
    const t = window.setTimeout(() => {
      const auto = node?.querySelector<HTMLElement>('[data-autofocus]')
      ;(auto ?? node?.querySelector<HTMLElement>(FOCUSABLE) ?? node)?.focus()
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current() }
      if (e.key === 'Tab' && node) {
        const els = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
        if (!els.length) return
        const first = els[0], last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.() }
  }, [open])
  return ref
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', icon }: {
  open: boolean; onClose: () => void; title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; icon?: ReactNode
}) {
  const ref = useFocusTrap(open, onClose)
  const id = useId()
  if (!open) return null
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size]
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}
        className={cx('relative w-full bg-white sm:rounded-3xl rounded-t-3xl shadow-modal animate-pop flex flex-col max-h-[92vh] outline-none', w)}>
        <div className="flex items-start gap-3 px-6 pt-6 pb-4">
          {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
          <div className="flex-1 min-w-0">
            <h2 id={id} className="font-display text-[22px] font-bold text-ink leading-tight">{title}</h2>
            {subtitle && <div className="text-meta text-[15px] mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="btn-ghost h-10 w-10 p-0 -mr-2 -mt-1 rounded-full shrink-0" aria-label="Sluiten"><X size={20} /></button>
        </div>
        <div className="px-6 pb-6 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex flex-wrap gap-3 justify-end bg-paper/60 sm:rounded-b-3xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useFocusTrap(open, onClose)
  const id = useId()
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[80]" role="presentation">
      <div className="absolute inset-0 bg-ink/40 animate-fadeIn" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}
        className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-modal animate-slideIn flex flex-col outline-none">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-line shrink-0">
          <h2 id={id} className="font-display text-lg font-bold flex-1 truncate">{title}</h2>
          <button onClick={onClose} className="btn-ghost h-10 w-10 p-0 rounded-full" aria-label="Sluiten"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex flex-wrap gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Img({ src, alt, className, imgClassName, eager, era, grain }: { src: string; alt: string; className?: string; imgClassName?: string; eager?: boolean; era?: string; grain?: boolean }) {
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading')
  return (
    <div className={cx(className?.includes('absolute') ? '' : 'relative', 'overflow-hidden bg-sand', grain && (era === 'bw' || era === 'eighties' || era === 'nineties') && 'grain', className)}>
      {state === 'err' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-meta gap-2 p-3 text-center bg-[linear-gradient(135deg,#F1EEE7,#E9E4DA)]">
          <ImageOff size={22} /><span className="text-xs">Afbeelding niet beschikbaar</span>
        </div>
      ) : (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'}
          onLoad={() => setState('ok')} onError={() => setState('err')}
          className={cx('w-full h-full object-cover transition-opacity duration-300', state === 'ok' ? 'opacity-100' : 'opacity-0', imgClassName)} />
      )}
      {state === 'loading' && <div className="absolute inset-0 bg-[linear-gradient(110deg,#F1EEE7_30%,#F8F6F1_50%,#F1EEE7_70%)] bg-[length:200%_100%] animate-[shimmer_1.4s_infinite]" aria-hidden />}
    </div>
  )
}

export function Avatar({ person, size = 40, ring }: { person?: DemoPerson; size?: number; ring?: boolean }) {
  const [err, setErr] = useState(false)
  if (!person) return null
  const initials = person.name.replace('Oma ', '').slice(0, 1)
  return (
    <span className={cx('inline-flex shrink-0 rounded-full overflow-hidden bg-brand-light text-brand font-semibold items-center justify-center', ring && 'ring-2 ring-white')}
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {person.avatar && !err ? <img src={person.avatar} alt="" className={cx('w-full h-full object-cover', person.id === 'nel' && 'grayscale')} onError={() => setErr(true)} /> : initials}
    </span>
  )
}

export function AvatarStack({ people, size = 28, max = 4 }: { people: (DemoPerson | undefined)[]; size?: number; max?: number }) {
  const list = people.filter(Boolean) as DemoPerson[]
  return (
    <span className="inline-flex -space-x-2">
      {list.slice(0, max).map((p) => <Avatar key={p.id} person={p} size={size} ring />)}
      {list.length > max && <span className="inline-flex items-center justify-center rounded-full bg-sand text-meta text-xs font-semibold ring-2 ring-white" style={{ width: size, height: size }}>+{list.length - max}</span>}
    </span>
  )
}

export function PrivacyBadge({ v, shared, className }: { v: Visibility; shared?: number; className?: string }) {
  if (v === 'heritage') return <span className={cx('pill bg-magenta-light text-magenta-dark', className)}><Landmark size={12} /> Aangeboden (demo)</span>
  if (shared && shared > 0) return <span className={cx('pill bg-brand-light text-brand', className)}><Users size={12} /> Gedeeld met {shared}</span>
  return <span className={cx('pill bg-[#EEF0F3] text-ink', className)}><Lock size={12} /> Alleen ik</span>
}

export function DemoNote({ children, className, tone = 'info' }: { children: ReactNode; className?: string; tone?: 'info' | 'warn' }) {
  return (
    <div className={cx('flex gap-3 rounded-xl px-4 py-3 text-[14px] leading-relaxed', tone === 'warn' ? 'bg-[#FFF6E5] text-[#6B4A00] border border-[#F3DFB4]' : 'bg-brand-50 text-ink/85 border border-brand-light', className)}>
      <Info size={18} className="shrink-0 mt-0.5" aria-hidden />
      <div>{children}</div>
    </div>
  )
}

export function SectionHeader({ title, eyebrow, action, sub }: { title: string; eyebrow?: string; action?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="font-display text-[22px] sm:text-[26px] font-bold text-ink leading-tight">{title}</h2>
        {sub && <p className="text-meta mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center flex flex-col items-center">
      <div className="h-14 w-14 rounded-2xl bg-brand-light text-brand flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="text-meta mt-1 max-w-md">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId()
  return (
    <div className="flex items-start gap-4 py-3.5">
      <div className="flex-1">
        <label htmlFor={id} className="font-semibold text-ink cursor-pointer">{label}</label>
        {description && <p className="text-meta text-sm mt-0.5">{description}</p>}
      </div>
      <button id={id} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cx('relative h-7 w-12 rounded-full transition-colors duration-200 shrink-0', checked ? 'bg-brand' : 'bg-[#CBD2DD]')}>
        <span className={cx('absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', checked && 'translate-x-5')} />
      </button>
    </div>
  )
}

export function Checkbox({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id?: string }) {
  const gen = useId()
  const cid = id ?? gen
  return (
    <label htmlFor={cid} className={cx('flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors', checked ? 'border-brand bg-brand-50' : 'border-line bg-white hover:border-[#C9D0DB]')}>
      <input id={cid} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 accent-[#1937B9] shrink-0" />
      <span className="text-[15px] leading-relaxed">{children}</span>
    </label>
  )
}

export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="max-w-3xl">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-ink leading-[1.08]">{title}</h1>
        {sub && <p className="text-meta text-[17px] mt-2 leading-relaxed">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </header>
  )
}
