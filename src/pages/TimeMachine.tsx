import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, X, Image as ImageIcon, Gift, Images } from 'lucide-react'
import { useDemo } from '../demo/store'
import { Avatar } from '../components/ui'
import { cx } from '../lib/format'
import { useSwipe } from '../lib/useSwipe'

const CHAPTERS = [
  { y: '1975', id: 'm-1975-portrait', title: 'Het begin', text: 'Op een zaterdag in juni trouwen Pieter en Ineke op het stadhuis van Haarlem. In een geleende Opel.', people: ['pieter', 'ineke'], tone: 'bw', bg: '#1a1a1a' },
  { y: '1988', id: 'm-1988-kitchen', title: 'Zondagen bij oma Nel', text: 'Elke zondag om drie uur gaat de oven open. Sanne staat op een krukje naast het aanrecht.', people: ['nel', 'sanne'], tone: 'eighties', bg: '#2b2014' },
  { y: '1994', id: 'm-1994-beach', title: 'De eerste zomer aan zee', text: 'Een huisje achter de duinen bij Domburg. Sanne ziet de zee en wil er nooit meer weg.', people: ['sanne', 'marieke', 'ineke', 'pieter'], tone: 'nineties', bg: '#1f2a30' },
  { y: '2010', id: 'm-2010-couple', title: 'Ja, in de tuin', text: 'Sanne en Thomas trouwen. Pieter houdt een speech van zeven minuten; het waren er drie gepland.', people: ['sanne', 'thomas'], tone: 'modern', bg: '#1c2433' },
  { y: '2012', id: 'm-2012-mila-sleep', title: 'Welkom, Mila', text: 'Op de eerste warme dag van het jaar wordt Mila geboren. Oma Nel belt elk uur.', people: ['mila', 'sanne', 'thomas'], tone: 'modern', bg: '#20202a' },
  { y: '2024', id: 'm-2024-beach-family', title: 'Hetzelfde duinpad', text: 'Dertig jaar later loopt Ineke weer naar zee. Nu met haar dochter en haar kleindochter.', people: ['ineke', 'sanne', 'mila'], tone: 'modern', bg: '#13233d' },
  { y: '2026', id: 'm-2025-opa-mila', title: 'De verhalen gaan verder', text: 'Mila scant met opa Pieter de oude dia\'s. Bij elke foto komt een verhaal terug.', people: ['pieter', 'mila'], tone: 'modern', bg: '#14182a' },
]

export default function TimeMachine() {
  const { state, markWow } = useDemo()
  const navigate = useNavigate()
  const [i, setI] = useState(0)
  const end = i === CHAPTERS.length
  useEffect(() => { if (end) markWow(1) }, [end, markWow])
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(CHAPTERS.length, x + d))), [])
  const close = useCallback(() => navigate('/tijdlijn'), [navigate])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Escape') close() }
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [go, close])
  // voorladen
  useEffect(() => { CHAPTERS.forEach((c) => { const m = state.media.find((x) => x.id === c.id); if (m) { const im = new Image(); im.src = m.src } }) }, [state.media])

  const swipe = useSwipe(() => go(1), () => go(-1))
  const c = CHAPTERS[Math.min(i, CHAPTERS.length - 1)]
  return (
    <div {...swipe} className="fixed inset-0 h-[100dvh] z-[78] text-white overflow-hidden dark-surface transition-colors duration-700 touch-pan-y" style={{ background: end ? '#0B1226' : c.bg }} role="dialog" aria-modal="true" aria-label="Tijdmachine">
      {CHAPTERS.map((ch, k) => { const m = state.media.find((x) => x.id === ch.id); return m ? (
        <div key={ch.y} aria-hidden={k !== i} className={cx('absolute inset-0 transition-opacity duration-700', k === i && !end ? 'opacity-100' : 'opacity-0')}>
          <img src={m.src} alt={k === i ? m.alt : ''} className={cx('absolute inset-0 w-full h-full object-cover', k === i && 'animate-kenburns', ch.tone === 'bw' && 'grayscale contrast-110', ch.tone === 'eighties' && 'sepia-[.35] saturate-[.85]', ch.tone === 'nineties' && 'saturate-[.8] sepia-[.15]')} />
          {ch.tone !== 'modern' && <div className="absolute inset-0 grain" />}
        </div>) : null })}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

      <div className="absolute top-0 inset-x-0 p-4 sm:p-6">
        <div className="flex gap-1.5 mb-4" aria-hidden>{[...CHAPTERS, null].map((_, k) => <div key={k} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden"><div className={cx('h-full bg-white transition-all duration-500', k <= i ? 'w-full' : 'w-0')} /></div>)}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white/80">Tijdmachine · {end ? 'Epiloog' : `Hoofdstuk ${i + 1} van ${CHAPTERS.length}`}</span>
          <button onClick={close} className="h-11 px-3 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-2 text-sm font-semibold" aria-label="Sluiten (Esc)"><X size={19} /> Sluiten</button>
        </div>
      </div>

      {!end ? (
        <div key={c.y} className="absolute inset-x-0 bottom-0 p-6 sm:p-12 pb-28 sm:pb-32 max-w-4xl animate-rise" aria-live="polite">
          <div className="font-display font-bold leading-none tracking-[-0.04em] text-[88px] sm:text-[150px] text-white/95">{c.y}</div>
          <h2 className="font-display text-[26px] sm:text-[36px] font-bold mt-2">{c.title}</h2>
          <p className="text-[18px] sm:text-[21px] text-white/85 mt-2 max-w-2xl leading-snug">{c.text}</p>
          <div className="flex items-center gap-2 mt-5">{c.people.map((pid) => { const p = state.people.find((x) => x.id === pid); return <span key={pid} className="inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full bg-white/15 backdrop-blur text-sm font-medium"><Avatar person={p} size={28} />{p?.name}</span> })}</div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center animate-rise">
          <div className="max-w-2xl">
            <div className="grid grid-cols-7 gap-1.5 mb-8 max-w-xl mx-auto">{CHAPTERS.map((ch) => { const m = state.media.find((x) => x.id === ch.id)!; return <div key={ch.y} className="aspect-[3/4] rounded-lg overflow-hidden"><img src={m.thumb} alt="" className={cx('w-full h-full object-cover', ch.tone === 'bw' && 'grayscale')} /></div> })}</div>
            <h2 className="font-display text-[34px] sm:text-[52px] font-bold leading-tight">Dit verhaal geef je door.</h2>
            <p className="text-white/80 text-lg mt-3">Vier generaties, 51 jaar, één familiearchief. Wat jij vandaag bewaart, kan Mila later vertellen.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <button className="btn-white" onClick={() => navigate('/nalatenschap')}><Gift size={18} /> Bekijk mijn wensen</button>
              <button className="btn h-11 bg-white/10 hover:bg-white/20 text-white" onClick={() => navigate('/albums')}><Images size={18} /> Ga naar mijn albums</button>
              <button className="btn h-11 bg-white/10 hover:bg-white/20 text-white" onClick={() => navigate('/voor-jou')}>Ga zelf verder</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center gap-2 sm:gap-3">
        <button onClick={() => go(-1)} disabled={i === 0} className="h-12 px-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center gap-2 font-semibold" aria-label="Terug (pijltje links)"><ArrowLeft size={19} /><span className="hidden sm:inline">Terug</span></button>
        {!end && <button onClick={() => navigate(`/foto/${c.id}`)} className="h-12 px-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-2 font-semibold"><ImageIcon size={18} /> <span className="hidden sm:inline">Bekijk foto</span><span className="sm:hidden">Foto</span></button>}
        {!end && <button onClick={() => go(1)} className="ml-auto h-12 px-5 rounded-full bg-white text-ink hover:bg-white/90 flex items-center gap-2 font-semibold" autoFocus><span className="hidden sm:inline">{i === CHAPTERS.length - 1 ? 'Naar de epiloog' : 'Volgend hoofdstuk'}</span><span className="sm:hidden">Volgende</span> <ArrowRight size={19} /></button>}
      </div>
    </div>
  )
}
