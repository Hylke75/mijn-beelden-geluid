import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Heart, Play, Mic, Check, BookOpenText, Users } from 'lucide-react'
import type { DemoMedia, Id } from '../data/types'
import { Img } from './ui'
import { cx, fmtDuration } from '../lib/format'
import { useDemo } from '../demo/store'

const LIST_KEY = 'mbg-viewer-list'
export function setViewerList(ids: Id[]) { try { sessionStorage.setItem(LIST_KEY, JSON.stringify(ids)) } catch { /* */ } }
export function getViewerList(): Id[] { try { return JSON.parse(sessionStorage.getItem(LIST_KEY) || '[]') } catch { return [] } }

export function useOpenMedia() {
  const [params, setParams] = useSearchParams()
  return useCallback((id: Id, list?: Id[]) => {
    if (list) setViewerList(list)
    const next = new URLSearchParams(params)
    next.set('m', id)
    setParams(next)
  }, [params, setParams])
}

export function MediaTile({ m, onOpen, selectMode, selected, onSelect, className, eager, showMeta = false, sharedCount = 0 }: {
  m: DemoMedia; onOpen: () => void; selectMode?: boolean; selected?: boolean; onSelect?: () => void; className?: string; eager?: boolean; showMeta?: boolean; sharedCount?: number
}) {
  const { toggleFavorite, toast } = useDemo()
  return (
    <div className={cx('group rounded-xl overflow-hidden bg-sand', className?.includes('absolute') ? '' : 'relative', className)}>
      <button className="absolute inset-0 w-full h-full tile-focus rounded-xl z-[1]" onClick={selectMode ? onSelect : onOpen}
        aria-label={`${selectMode ? (selected ? 'Deselecteer' : 'Selecteer') : 'Open'} ${m.kind === 'video' ? 'video' : m.kind === 'audio' ? 'audiobericht' : 'foto'}: ${m.title}`} aria-pressed={selectMode ? selected : undefined} />
      {m.kind === 'audio' ? (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#142348,#1937B9)] flex flex-col justify-end p-3 text-white">
          <Waveform seed={m.id} className="h-10 mb-2 opacity-90" />
          <div className="text-[13px] font-semibold leading-tight line-clamp-2">{m.title}</div>
        </div>
      ) : (
        <Img src={m.thumb} alt={m.alt} eager={eager} era={m.era} grain className="absolute inset-0" imgClassName="group-hover:scale-[1.03] transition-transform duration-500" />
      )}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      {m.kind === 'video' && (
        <span className="absolute left-2 bottom-2 pill bg-black/55 text-white backdrop-blur-sm pointer-events-none"><Play size={11} fill="currentColor" /> {fmtDuration(m.duration)}</span>
      )}
      {m.kind === 'audio' && <span className="absolute left-2 top-2 pill bg-white/20 text-white pointer-events-none"><Mic size={11} /> {fmtDuration(m.duration)}</span>}
      <div className="absolute right-2 bottom-2 flex gap-1 pointer-events-none">
        {m.storyId && <span className="h-6 w-6 rounded-full bg-white/90 text-brand flex items-center justify-center" title="Met verhaal"><BookOpenText size={13} /></span>}
        {sharedCount > 0 && <span className="h-6 w-6 rounded-full bg-white/90 text-brand flex items-center justify-center" title="Gedeeld"><Users size={13} /></span>}
      </div>
      {!selectMode && (
        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(m.id); toast({ text: m.favorite ? 'Verwijderd uit Favorieten' : 'Toegevoegd aan Favorieten', action: m.favorite ? undefined : { label: 'Bekijk', to: '/fotos?filter=favorieten' } }) }}
          className={cx('absolute top-2 right-2 z-[2] h-9 w-9 rounded-full flex items-center justify-center transition-all duration-150',
            m.favorite ? 'bg-white text-magenta opacity-100' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/50')}
          aria-label={m.favorite ? `Verwijder ${m.title} uit favorieten` : `Markeer ${m.title} als favoriet`} aria-pressed={m.favorite}>
          <Heart size={17} fill={m.favorite ? 'currentColor' : 'none'} />
        </button>
      )}
      {selectMode && (
        <span className={cx('absolute top-2 left-2 z-[2] h-7 w-7 rounded-full border-2 flex items-center justify-center pointer-events-none', selected ? 'bg-brand border-brand text-white' : 'bg-white/70 border-white')}>
          {selected && <Check size={16} strokeWidth={3} />}
        </span>
      )}
      {selectMode && selected && <div className="absolute inset-0 ring-4 ring-inset ring-brand rounded-xl pointer-events-none" />}
      {showMeta && (
        <div className="absolute left-0 right-0 bottom-0 p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-white text-[13px] font-semibold leading-tight line-clamp-2 drop-shadow">{m.title}</div>
        </div>
      )}
    </div>
  )
}

export function Waveform({ seed, className, progress = 0, bars = 48 }: { seed: string; className?: string; progress?: number; bars?: number }) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const vals = Array.from({ length: bars }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; return 0.25 + ((h >>> 8) % 1000) / 1000 * 0.75 * (0.6 + 0.4 * Math.sin(i / 3)) })
  return (
    <svg viewBox={`0 0 ${bars * 4} 40`} preserveAspectRatio="none" className={className} aria-hidden>
      {vals.map((v, i) => <rect key={i} x={i * 4 + 0.5} y={20 - v * 18} width="2.4" height={v * 36} rx="1.2" fill={i / bars < progress ? '#E60088' : 'currentColor'} />)}
    </svg>
  )
}

/** Justified-achtige grid op basis van beeldverhoudingen. */
export function MediaGrid({ items, selectMode, selected, onToggle, listIds, rowHeight = 220 }: {
  items: DemoMedia[]; selectMode?: boolean; selected?: Set<Id>; onToggle?: (id: Id) => void; listIds?: Id[]; rowHeight?: number
}) {
  const open = useOpenMedia()
  const { state } = useDemo()
  const ids = listIds ?? items.map((m) => m.id)
  const sharedCount = (id: Id) => new Set(state.albums.filter((a) => a.mediaIds.includes(id)).flatMap((a) => a.sharedWith)).size
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 after:content-[''] after:flex-[10_1_0%]">
      {items.map((m, i) => {
        const ratio = m.kind === 'audio' ? 1 : (m.w && m.h ? m.w / m.h : 1.5)
        return (
          <div key={m.id} className="relative mb-0" style={{ flexGrow: ratio * 100, flexBasis: `calc(${ratio} * var(--row, ${rowHeight}px))`, maxWidth: `calc(${ratio} * var(--row, ${rowHeight}px) * 1.9)` }}>
            <div style={{ paddingBottom: `${100 / ratio}%` }} />
            <MediaTile m={m} eager={i < 6} className="absolute inset-0" onOpen={() => open(m.id, ids)} selectMode={selectMode}
              selected={selected?.has(m.id)} onSelect={() => onToggle?.(m.id)} sharedCount={sharedCount(m.id)} />
          </div>
        )
      })}
    </div>
  )
}
