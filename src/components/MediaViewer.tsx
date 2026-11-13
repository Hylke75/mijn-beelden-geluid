import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Heart, FolderPlus, BookOpenText, Share2, Download, MapPin, CalendarDays, Lock, Landmark, Expand, Users, Pencil } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { getViewerList } from './Media'
import { Avatar, Img } from './ui'
import { DemoPlayer } from './Player'
import { cx, fmtDate } from '../lib/format'
import { SOURCE_LABEL } from '../lib/selectors'

export function MediaViewer() {
  const [params, setParams] = useSearchParams()
  const id = params.get('m')
  const { state, toggleFavorite, toast } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const m = state.media.find((x) => x.id === id)
  const list = useMemo(() => { const l = getViewerList(); return l.includes(id ?? '') ? l : state.media.map((x) => x.id) }, [id, state.media])
  const idx = list.indexOf(id ?? '')
  const go = (d: number) => {
    const n = list[(idx + d + list.length) % list.length]
    const next = new URLSearchParams(params); next.set('m', n); setParams(next, { replace: true })
  }
  const close = () => { const next = new URLSearchParams(params); next.delete('m'); setParams(next) }

  useEffect(() => {
    if (!m) return
    const onKey = (e: KeyboardEvent) => {
      if (ui.modal) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  })
  useEffect(() => { if (m) document.getElementById('viewer-close')?.focus() }, [m?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!m) return null
  const albums = state.albums.filter((a) => a.mediaIds.includes(m.id))
  const sharedWith = Array.from(new Set(albums.flatMap((a) => a.sharedWith))).map((pid) => state.people.find((p) => p.id === pid)).filter(Boolean)
  const story = m.storyId ? state.stories.find((s) => s.id === m.storyId) : undefined
  const people = m.peopleIds.map((pid) => state.people.find((p) => p.id === pid)).filter(Boolean)
  const sub = state.submissions.find((s) => s.mediaId === m.id)
  const isOld = Number(m.dateTaken.slice(0, 4)) < 2000
  const family = state.viewAs !== 'sanne'

  return createPortal(
    <div className="fixed inset-0 z-[75] bg-[#0B1226] text-white flex flex-col lg:flex-row dark-surface animate-fadeIn" role="dialog" aria-modal="true" aria-label={`Lichtbak: ${m.title}`}>
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 px-3 sm:px-5 h-16 shrink-0">
          <button id="viewer-close" onClick={close} className="h-11 w-11 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Sluiten (Esc)"><X size={22} /></button>
          <span className="text-white/60 text-sm tabular-nums">{idx + 1} van {list.length}</span>
          <div className="ml-auto flex items-center gap-1">
            {!family && <button onClick={() => { toggleFavorite(m.id); toast({ text: m.favorite ? 'Verwijderd uit Favorieten' : 'Toegevoegd aan Favorieten' }) }} className={cx('h-11 w-11 rounded-full hover:bg-white/10 flex items-center justify-center', m.favorite && 'text-magenta')} aria-pressed={m.favorite} aria-label={m.favorite ? 'Verwijder uit favorieten' : 'Favoriet'}><Heart size={21} fill={m.favorite ? 'currentColor' : 'none'} /></button>}
            <button onClick={() => { close(); navigate(`/foto/${m.id}`) }} className="h-11 px-3 rounded-full hover:bg-white/10 flex items-center gap-2 text-sm font-semibold" aria-label="Open volledige weergave met verhaal"><Expand size={18} /><span className="hidden sm:inline">Volledige weergave</span></button>
          </div>
        </div>
        <div className="relative flex-1 min-h-0 px-3 sm:px-16 pb-3 sm:pb-6 flex items-center justify-center">
          {m.kind === 'photo' ? (
            <Img key={m.id} src={m.src} alt={m.alt} eager era={m.era} grain className="w-full h-full bg-transparent rounded-lg animate-fadeIn" imgClassName="object-contain" />
          ) : (
            <div className="w-full h-full max-w-5xl"><DemoPlayer m={m} dark /></div>
          )}
          <button onClick={() => go(-1)} className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Vorige (pijltje links)"><ChevronLeft size={26} /></button>
          <button onClick={() => go(1)} className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Volgende (pijltje rechts)"><ChevronRight size={26} /></button>
        </div>
      </div>

      <aside className="w-full lg:w-[380px] shrink-0 bg-white text-ink lg:h-full max-h-[48vh] lg:max-h-none overflow-y-auto rounded-t-3xl lg:rounded-none" aria-label="Details">
        <div className="p-6">
          <h2 className="font-display text-[22px] font-bold leading-tight">{m.title}</h2>
          <div className="mt-3 space-y-1.5 text-[15px] text-meta">
            <div className="flex items-center gap-2"><CalendarDays size={16} /> {fmtDate(m.dateTaken)}</div>
            <div className="flex items-center gap-2"><MapPin size={16} /> {m.location}</div>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/85">{m.description}</p>

          {people.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-meta mb-2">Wie staan erbij</div>
              <div className="flex flex-wrap gap-2">
                {people.map((p) => <Link key={p!.id} to={`/zoeken?q=${encodeURIComponent(p!.name.replace('Oma ', ''))}`} onClick={close} className="inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border border-line hover:border-brand text-sm font-medium"><Avatar person={p} size={28} />{p!.name}</Link>)}
              </div>
              <p className="text-xs text-meta mt-2">Door Sanne gelabeld. Er is geen automatische gezichtsherkenning gebruikt.</p>
            </div>
          )}

          {!family && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button className="btn-secondary btn-sm h-11" onClick={() => ui.open({ type: 'addToAlbum', mediaIds: [m.id] })}><FolderPlus size={17} /> Aan album</button>
              {story ? <Link className="btn-secondary btn-sm h-11" to={`/verhalen/${story.id}`} onClick={close}><BookOpenText size={17} /> Lees verhaal</Link>
                : <button className="btn-secondary btn-sm h-11" onClick={() => ui.open({ type: 'story', mediaId: m.id })}><Pencil size={17} /> Verhaal toevoegen</button>}
              <button className="btn-secondary btn-sm h-11" onClick={() => ui.open({ type: 'shareMedia', mediaId: m.id })}><Share2 size={17} /> Delen</button>
              <button className="btn-secondary btn-sm h-11" onClick={() => ui.open({ type: 'download', mediaId: m.id })}><Download size={17} /> Downloaden</button>
            </div>
          )}
          {!family && isOld && m.kind === 'photo' && !sub && (
            <Link to={`/nationaal-archief/aanbieden?foto=${m.id}`} onClick={close} className="mt-2 btn btn-sm h-11 w-full bg-magenta-light text-magenta-dark hover:bg-[#FBD3EA]"><Landmark size={17} /> Aanbieden aan nationaal archief</Link>
          )}

          <dl className="mt-6 rounded-2xl bg-paper p-4 text-[14px] space-y-2.5">
            <div className="flex gap-2"><dt className="text-meta w-[110px] shrink-0">Herkomst</dt><dd>{m.sourceId === 'scan' ? 'Gedigitaliseerd van analoog' : `Foto uit ${SOURCE_LABEL[m.sourceId] ?? m.sourceId}`} · {fmtDate(m.dateTaken)}</dd></div>
            <div className="flex gap-2"><dt className="text-meta w-[110px] shrink-0">Privacy</dt><dd className="flex items-center gap-1.5">{sharedWith.length ? <><Users size={14} /> Gedeeld met: {sharedWith.map((p) => p!.name).join(', ')}</> : <><Lock size={14} /> Alleen ik · gedeeld met niemand</>}</dd></div>
            <div className="flex gap-2"><dt className="text-meta w-[110px] shrink-0">Verhaal</dt><dd>{story ? <>Verhaal toegevoegd door {state.people.find((p) => p.id === story.narratorId)?.name}</> : 'Nog geen verhaal'}</dd></div>
            <div className="flex gap-2"><dt className="text-meta w-[110px] shrink-0">Albums</dt><dd>{albums.length ? albums.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link to={`/albums/${a.id}`} onClick={close} className="link font-medium">{a.title}</Link></span>) : 'Nog in geen album'}</dd></div>
            {sub && <div className="flex gap-2"><dt className="text-meta w-[110px] shrink-0">Erfgoed</dt><dd className="text-magenta-dark font-medium">Kopie aangeboden · {sub.status}. Het origineel blijft privé.</dd></div>}
          </dl>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
