import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, Image as ImageIcon, BookImage, BookOpenText, UserRound, ArrowRight } from 'lucide-react'
import { useDemo } from '../demo/store'
import { searchAll, SUGGESTIONS } from '../lib/search'
import { cx } from '../lib/format'

export function SearchBox({ autoFocus, big }: { autoFocus?: boolean; big?: boolean }) {
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { state } = useDemo()
  const navigate = useNavigate()
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => { setQ(params.get('q') ?? '') }, [params])
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  const res = useMemo(() => searchAll(state, q), [state, q])
  const quick = useMemo(() => {
    if (!res) return SUGGESTIONS.map((s) => ({ kind: 'suggest' as const, label: s, go: () => submit(s) }))
    return [
      ...res.people.slice(0, 2).map((p) => ({ kind: 'person' as const, label: p.fullName, go: () => navigate(`/zoeken?q=${encodeURIComponent(p.name.replace('Oma ', ''))}`) })),
      ...res.albums.slice(0, 2).map((a) => ({ kind: 'album' as const, label: a.title, go: () => navigate(`/albums/${a.id}`) })),
      ...res.stories.slice(0, 2).map((s) => ({ kind: 'story' as const, label: s.title, go: () => navigate(`/verhalen/${s.id}`) })),
      ...res.media.slice(0, 3).map((m) => ({ kind: 'media' as const, label: m.title, thumb: m.thumb, go: () => navigate(`/foto/${m.id}`) })),
    ]
  }, [res]) // eslint-disable-line react-hooks/exhaustive-deps

  function submit(v = q) {
    setOpen(false)
    if (!v.trim()) return
    navigate(`/zoeken?q=${encodeURIComponent(v.trim())}`)
  }
  const Icon = { person: UserRound, album: BookImage, story: BookOpenText, media: ImageIcon, suggest: Search }

  return (
    <div ref={wrap} className="relative">
      <form role="search" onSubmit={(e) => { e.preventDefault(); if (active >= 0 && quick[active]) { quick[active].go(); setOpen(false) } else submit() }}>
        <label htmlFor={big ? 'search-big' : 'search-top'} className="sr-only">Zoek op personen, plaatsen, jaren of herinneringen</label>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-meta pointer-events-none" size={19} />
        <input id={big ? 'search-big' : 'search-top'} value={q} autoFocus={autoFocus} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }} onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, quick.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)) }
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Zoek op personen, plaatsen, jaren of herinneringen"
          role="combobox" aria-expanded={open} aria-controls="search-pop" aria-autocomplete="list"
          className={cx('w-full rounded-xl bg-white border border-line pl-11 pr-10 text-base sm:text-[15px] placeholder:text-meta/80 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition', big ? 'h-14 text-[17px]' : 'h-11')} />
        {q && <button type="button" onClick={() => { setQ(''); setOpen(true) }} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-ink/5 flex items-center justify-center text-meta" aria-label="Zoekveld leegmaken"><X size={16} /></button>}
      </form>
      {open && (
        <div id="search-pop" role="listbox" className="absolute left-0 right-0 top-full mt-2 card shadow-lift z-50 p-2 animate-rise">
          <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-meta">{res ? `${res.total} resultaten in je archief` : 'Probeer bijvoorbeeld'}</div>
          {!res ? (
            <div className="flex flex-wrap gap-2 p-2">
              {SUGGESTIONS.map((s) => <button key={s} className="chip-off h-8" onClick={() => submit(s)}>{s}</button>)}
            </div>
          ) : (
            <ul>
              {quick.map((item, i) => {
                const I = Icon[item.kind]
                return (
                  <li key={i} role="option" aria-selected={active === i}>
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { item.go(); setOpen(false) }} className={cx('w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left', active === i ? 'bg-brand-50' : 'hover:bg-paper')}>
                      {'thumb' in item && item.thumb ? <img src={item.thumb} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <span className="h-9 w-9 rounded-lg bg-paper flex items-center justify-center text-meta"><I size={17} /></span>}
                      <span className="flex-1 truncate text-[15px]">{item.label}</span>
                    </button>
                  </li>
                )
              })}
              {res.total === 0 && <li className="px-3 py-3 text-meta text-[15px]">Niets gevonden voor “{q}”. Probeer een naam, plaats of jaartal.</li>}
              <li><button onMouseDown={(e) => e.preventDefault()} onClick={() => submit()} className="w-full flex items-center justify-between px-3 h-11 rounded-xl hover:bg-paper font-semibold text-brand">Alle resultaten voor “{q}” <ArrowRight size={17} /></button></li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
