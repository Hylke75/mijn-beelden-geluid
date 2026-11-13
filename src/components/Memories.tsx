import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { X, Pause, Play, ChevronLeft, ChevronRight, FolderPlus, Users, BookImage, Volume2 } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { cx } from '../lib/format'
import { useSwipe } from '../lib/useSwipe'

export interface MemoryReel {
  id: string
  title: string
  subtitle: string
  albumId?: string
  cover?: string
  slides: { mediaId: string; caption: string }[]
}

export const REELS: MemoryReel[] = [
  { id: 'r-zeeland', title: '30 jaar Zeeland', subtitle: 'Hetzelfde duinpad, 1994 en 2024', albumId: 'al-zeeland', slides: [
    { mediaId: 'm-1994-dunes', caption: 'Zomer 1994. Een huisje achter de duinen bij Domburg.' },
    { mediaId: 'm-1994-beach', caption: 'Sanne en Marieke rennen voor het eerst naar zee.' },
    { mediaId: 'm-1994-towel', caption: 'De groene handdoek van oma Nel ging elk jaar mee.' },
    { mediaId: 'm-2024-palen', caption: 'Dertig jaar later staan de palen er nog.' },
    { mediaId: 'm-2024-dunes-kids', caption: 'Nu klimmen Mila en Daan de duinen in.' },
    { mediaId: 'm-2024-beach-family', caption: 'En oma Ineke loopt nog steeds het hardst.' },
  ] },
  { id: 'r-nel', title: 'Oma Nel', subtitle: 'Ze bakte voor iedereen', albumId: 'al-oma-nel', cover: 'm-1988-kitchen', slides: [
    { mediaId: 'm-1957-sint', caption: '1957. Schoen zetten bij de kachel in het huis van oma Nel.' },
    { mediaId: 'm-1988-kitchen', caption: 'Elke zondag om drie uur ging de oven open.' },
    { mediaId: 'm-1988-pie', caption: '“Niet meten, kind. Voelen.”' },
    { mediaId: 'm-2012-blanket', caption: 'Met 82 jaar breide ze nog een dekentje voor Mila.' },
    { mediaId: 'm-2016-recipe', caption: 'Haar receptenschrift is nu van de hele familie.' },
  ] },
  { id: 'r-pieter', title: 'Opa wordt 75', subtitle: 'Drie generaties, 1.200 dia\'s', albumId: 'al-pieter-75', cover: 'm-2025-opa-mila', slides: [
    { mediaId: 'm-1975-portrait', caption: '1975. Pieter trouwt met Ineke, in een geleende auto.' },
    { mediaId: 'm-2025-opa-mila', caption: '2025. Mila scant met opa elke zaterdag een doos dia\'s.' },
    { mediaId: 'm-2025-photobook', caption: 'Bij elke foto komt een verhaal terug.' },
    { mediaId: 'm-2025-cake', caption: 'Vijfenzeventig kaarsjes pasten niet. Het werden er drie.' },
  ] },
  { id: 'r-kids', title: 'Mila & Daan', subtitle: 'Van de eerste dag tot nu', albumId: 'al-kinderen', slides: [
    { mediaId: 'm-2012-mila-sleep', caption: 'Maart 2012. Mila, een dag oud.' },
    { mediaId: 'm-2016-siblings', caption: '2016. Grote zus.' },
    { mediaId: 'm-geluk-drawing', caption: 'Een regenboog voor het raam, voorjaar 2020.' },
    { mediaId: 'm-geluk-bike', caption: 'Zonder zijwieltjes, met een ijsje.' },
    { mediaId: 'm-2024-siblings', caption: 'Uitwaaien in de duinen, zomer 2024.' },
  ] },
  { id: 'r-haarlem', title: 'Haarlem, toen en nu', subtitle: '1975 – 2026', albumId: 'al-haarlem', slides: [
    { mediaId: 'm-1975-haarlem', caption: 'Juni 1975. Pieter fotografeert de straat op weg naar het stadhuis.' },
    { mediaId: 'm-1977-zandvoort', caption: 'Een terras op de Grote Markt, zomer 1977.' },
    { mediaId: 'm-2026-markt', caption: 'Dezelfde markt, april 2026.' },
    { mediaId: 'm-2026-spaarne', caption: 'Weekend in eigen stad.' },
  ] },
]

const DURATION = 5200

export function MemoryRow() {
  const { state } = useDemo()
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section aria-label="Herinneringen om af te spelen">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {REELS.map((r, i) => {
          const cover = state.media.find((m) => m.id === (r.cover ?? r.slides[r.slides.length - 1].mediaId))
          return (
            <button key={r.id} onClick={() => setOpen(r.id)} className="group shrink-0 w-[132px] sm:w-[150px] text-left" aria-label={`Speel herinnering af: ${r.title}`}>
              <span className={cx('block relative aspect-[3/4] rounded-2xl overflow-hidden p-[3px]', i < 2 ? 'bg-[linear-gradient(135deg,#E60088,#1937B9)]' : 'bg-line')}>
                <span className="block relative w-full h-full rounded-[13px] overflow-hidden bg-sand">
                  {cover && <img src={cover.thumb} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-2.5 right-2.5 bottom-2.5 text-white font-display font-bold text-[15px] leading-tight drop-shadow">{r.title}</span>
                  <span className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 text-ink flex items-center justify-center opacity-90 group-hover:scale-110 transition-transform"><Play size={13} fill="currentColor" className="ml-0.5" /></span>
                </span>
              </span>
              <span className="block text-xs text-meta mt-1.5 truncate">{r.subtitle}</span>
            </button>
          )
        })}
      </div>
      {open && <MemoryPlayer reel={REELS.find((r) => r.id === open)!} onClose={() => setOpen(null)} />}
    </section>
  )
}

export function MemoryPlayer({ reel, onClose }: { reel: MemoryReel; onClose: () => void }) {
  const { state, createAlbum, toast } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [t, setT] = useState(0)
  const last = useRef(performance.now())
  const end = i >= reel.slides.length
  const reduce = typeof window !== 'undefined' && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || state.settings.reduceMotion)
  const next = useCallback(() => { setI((x) => Math.min(reel.slides.length, x + 1)); setT(0) }, [reel.slides.length])
  const prev = useCallback(() => { setI((x) => Math.max(0, x - 1)); setT(0) }, [])

  useEffect(() => {
    if (paused || end) return
    let raf = 0
    last.current = performance.now()
    const tick = (now: number) => {
      setT((x) => { const n = x + (now - last.current); last.current = now; return n })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [paused, end, i])
  useEffect(() => { if (t >= DURATION) next() }, [t, next])
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev()
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    document.addEventListener('keydown', k); const o = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = o }
  }, [next, prev, onClose])
  useEffect(() => { reel.slides.forEach((s) => { const m = state.media.find((x) => x.id === s.mediaId); if (m) { const im = new Image(); im.src = m.src } }) }, [reel, state.media])

  const swipe = useSwipe(next, prev, { onDown: onClose })
  const album = state.albums.find((a) => a.id === reel.albumId)
  return createPortal(
    <div {...swipe} className="fixed inset-0 h-[100dvh] z-[90] bg-black text-white dark-surface animate-fadeIn touch-pan-y" role="dialog" aria-modal="true" aria-label={`Herinnering: ${reel.title}`}>
      {reel.slides.map((s, k) => { const m = state.media.find((x) => x.id === s.mediaId); return m ? (
        <div key={s.mediaId} aria-hidden={k !== i} className={cx('absolute inset-0 transition-opacity duration-700', k === i && !end ? 'opacity-100' : 'opacity-0')}>
          <img src={m.src} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50" />
          <img src={m.src} alt={k === i ? m.alt : ''} className={cx('absolute inset-0 w-full h-full object-contain', k === i && !reduce && 'animate-kenburns')} style={{ animationPlayState: paused ? 'paused' : 'running' }} />
        </div>) : null })}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75 pointer-events-none" />

      <div className="absolute top-0 inset-x-0 p-3 sm:p-5">
        <div className="flex gap-1.5" aria-hidden>{reel.slides.map((_, k) => <div key={k} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"><div className="h-full bg-white" style={{ width: k < i || end ? '100%' : k === i ? `${Math.min(100, (t / DURATION) * 100)}%` : '0%' }} /></div>)}</div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 min-w-0"><div className="font-display font-bold text-lg leading-tight truncate">{reel.title}</div><div className="text-sm text-white/70 truncate">{reel.subtitle} · automatische herinnering (voorbeeld)</div></div>
          {!end && <button onClick={() => setPaused((p) => !p)} className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label={paused ? 'Afspelen' : 'Pauzeren'}>{paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}</button>}
          <button onClick={onClose} className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" aria-label="Sluiten (Esc)"><X size={20} /></button>
        </div>
      </div>

      {!end ? (
        <>
          <button className="absolute left-0 top-24 bottom-32 w-1/3" onClick={prev} aria-label="Vorige foto" />
          <button className="absolute right-0 top-24 bottom-32 w-2/3" onClick={next} aria-label="Volgende foto" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 pb-10 sm:pb-14 pointer-events-none">
            <p key={i} className="font-display text-[22px] sm:text-[32px] font-bold leading-snug max-w-3xl mx-auto text-center drop-shadow-lg animate-rise">{reel.slides[i].caption}</p>
          </div>
          <div className="hidden sm:flex absolute inset-y-0 left-3 items-center pointer-events-none"><ChevronLeft size={30} className="opacity-50" /></div>
          <div className="hidden sm:flex absolute inset-y-0 right-3 items-center pointer-events-none"><ChevronRight size={30} className="opacity-50" /></div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center animate-rise">
          <div className="max-w-lg">
            <div className="flex justify-center -space-x-6 mb-6">{reel.slides.slice(0, 4).map((s, k) => { const m = state.media.find((x) => x.id === s.mediaId)!; return <img key={k} src={m.thumb} alt="" className="h-28 w-24 object-cover rounded-xl border-4 border-white shadow-lift" style={{ transform: `rotate(${[-6, 3, -2, 5][k]}deg)` }} /> })}</div>
            <h2 className="font-display text-[30px] sm:text-[38px] font-bold leading-tight">{reel.title}</h2>
            <p className="text-white/75 mt-2">Deze herinnering is samengesteld uit {reel.slides.length} foto's uit je archief. Bewaar hem of deel hem met wie erbij was.</p>
            <div className="flex flex-wrap justify-center gap-2.5 mt-7">
              {album && <button className="btn-white" onClick={() => { onClose(); navigate(`/albums/${album.id}`) }}><BookImage size={17} /> Bekijk album</button>}
              {album && <button className="btn h-11 bg-white/15 hover:bg-white/20 text-white" onClick={() => { onClose(); ui.open({ type: 'share', albumId: album.id }) }}><Users size={17} /> Deel met familie</button>}
              <button className="btn h-11 bg-white/15 hover:bg-white/20 text-white" onClick={() => { const a = createAlbum(reel.title, reel.slides.map((s) => s.mediaId)); onClose(); toast({ text: `Herinnering bewaard als album “${a.title}”`, action: { label: 'Bekijk', to: `/albums/${a.id}` } }) }}><FolderPlus size={17} /> Bewaar als album</button>
              <button className="btn h-11 bg-white/15 hover:bg-white/20 text-white" onClick={() => { setI(0); setT(0) }}><Play size={16} /> Opnieuw</button>
            </div>
            <p className="text-xs text-white/50 mt-6 flex items-center justify-center gap-1.5"><Volume2 size={13} /> In de echte dienst eventueel met muziek. In deze demo zonder geluid.</p>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
