import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { cx } from '../lib/format'

export function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string; count?: number }[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', h); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k) }
  }, [open])
  const cur = options.find((o) => o.value === value)
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox" className={cx(value ? 'chip-on' : 'chip-off', 'pr-2.5')}>
        {cur ? cur.label : label}
        {value ? <span role="button" tabIndex={0} aria-label={`Filter ${label} wissen`} onClick={(e) => { e.stopPropagation(); onChange('') }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange('') } }} className="h-5 w-5 rounded-full hover:bg-white/20 flex items-center justify-center"><X size={13} /></span> : <ChevronDown size={15} />}
      </button>
      {open && (
        <ul role="listbox" aria-label={label} className="absolute left-0 top-full mt-2 z-30 card shadow-lift p-1.5 min-w-[220px] max-h-[320px] overflow-y-auto animate-rise">
          {options.map((o) => (
            <li key={o.value}>
              <button role="option" aria-selected={o.value === value} onClick={() => { onChange(o.value === value ? '' : o.value); setOpen(false) }} className="w-full flex items-center gap-2 px-3 h-10 rounded-lg hover:bg-paper text-[15px] text-left">
                <span className="flex-1">{o.label}</span>{o.count != null && <span className="text-meta text-sm">{o.count}</span>}{o.value === value && <Check size={16} className="text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
