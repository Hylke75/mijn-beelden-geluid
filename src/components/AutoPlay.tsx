import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pause, Play, SkipBack, SkipForward, X, RotateCcw, Home, Clapperboard } from 'lucide-react'
import { useUI } from '../demo/ui'
import { cx } from '../lib/format'

/** Een scène in de automatische demo. Alleen navigeren, scrollen en toetsaanslagen: de demo-gegevens blijven onaangetast. */
interface Scene {
  to: string
  title: string
  text: string
  ms: number
  scrollTo?: string // CSS-selector
  scrollBy?: number // langzaam meescrollen (px)
  keys?: { key: string; every: number } // bv. tijdmachine doorbladeren
}

export const SCENES: Scene[] = [
  { to: '/voor-jou', title: 'Het familiearchief van Sanne', text: 'Foto\'s, video\'s, documenten en de verhalen erachter. Vier generaties, op één Nederlandse plek.', ms: 6500 },
  { to: '/voor-jou', title: 'Herinneringen die zichzelf vertellen', text: 'Het archief stelt vanzelf herinneringen samen: dertig jaar Zeeland, oma Nel, opa\'s 75ste.', ms: 6000, scrollTo: '[aria-label="Herinneringen om af te spelen"]' },
  { to: '/fotos', title: 'Alles terugvinden', text: 'Uit Google Photos, iCloud, WhatsApp en oude fotoboeken. Filter op jaar, persoon, plaats of bron.', ms: 7000, scrollBy: 900 },
  { to: '/fotos?m=m-1994-beach', title: 'Bij elke foto: herkomst en privacy', text: 'Waar komt hij vandaan, wie staat erop, met wie is hij gedeeld? Standaard alleen jij.', ms: 6500 },
  { to: '/foto/m-1988-kitchen', title: 'Achter iedere foto zit een verhaal', text: 'Oma Nel in de keuken, 1988. Sanne schreef op wat er die zondag gebeurde, voor later, voor Mila.', ms: 8000, scrollBy: 450 },
  { to: '/tijdmachine', title: 'De tijdmachine', text: 'Van de trouwdag in 1975 tot vandaag: de familiegeschiedenis als één doorlopend verhaal.', ms: 14000, keys: { key: 'ArrowRight', every: 2000 } },
  { to: '/albums/al-zeeland', title: 'Samen herinneren', text: 'Deel een album met familie. Ineke en Marieke zien de zomers in Zeeland, en niets anders.', ms: 7000, scrollBy: 500 },
  { to: '/familie', title: 'Vraag het aan de familie', text: 'Stel oma een vraag. Zij spreekt het antwoord in, zonder app of account. Zo blijven verhalen bewaard.', ms: 7000, scrollTo: '#vragen' },
  { to: '/kluis', title: 'Belangrijke documenten apart', text: 'Paspoort, polissen en diploma\'s in een rustige, aparte kluis. Delen met familie geeft hier nooit toegang toe.', ms: 6000 },
  { to: '/nalatenschap', title: 'Nu bewaren, later doorgeven', text: 'Bepaal wie jouw herinneringen later mag ontvangen. Een ontwerpconcept, geen juridische garantie.', ms: 6500, scrollBy: 500 },
  { to: '/nalatenschap/voorbeeld?wens=wish-daan', title: 'Zo zou het er later uit kunnen zien', text: 'Een brief, de verhalen en de foto\'s die Sanne voor haar kinderen heeft bewaard.', ms: 7500, scrollBy: 700 },
  { to: '/nationaal-archief', title: 'Bijdragen aan Nederland', text: 'Bied vrijwillig een foto aan voor het nationaal archief. Een archivaris beslist; je origineel blijft privé.', ms: 7500, scrollBy: 400 },
  { to: '/voor-jou', title: 'De herinneringen van vandaag zijn het erfgoed van morgen.', text: 'Mijn Beeld & Geluid · een concept van Beeld & Geluid. Klik nu zelf rond: alles in deze demo werkt.', ms: 9000 },
]

export function AutoPlayButton({ className, compact }: { className?: string; compact?: boolean }) {
  const ui = useUI()
  return (
    <button onClick={() => { ui.close(); ui.setTourStep(null); ui.setAutoplay(true) }} className={className ?? 'btn btn bg-ink text-white hover:bg-ink-soft'}>
      <Clapperboard size={compact ? 14 : 18} /> {compact ? 'Speel demo af' : 'Speel de demo af'}
    </button>
  )
}

export function AutoPlayer() {
  const ui = useUI()
  const navigate = useNavigate()
  const loc = useLocation()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)
  const last = useRef(0)
  const keyTimer = useRef(0)
  const scene = SCENES[Math.min(i, SCENES.length - 1)]

  const stop = useCallback(() => { ui.setAutoplay(false); setI(0); setElapsed(0); setDone(false); setPaused(false) }, [ui])

  // start: reset
  useEffect(() => { if (ui.autoplay) { setI(0); setElapsed(0); setDone(false); setPaused(false) } }, [ui.autoplay])

  // scène openen
  useEffect(() => {
    if (!ui.autoplay || done) return
    ui.close()
    navigate(scene.to)
    const t = window.setTimeout(() => {
      if (scene.scrollTo) document.querySelector(scene.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else window.scrollTo({ top: 0 })
    }, 500)
    return () => window.clearTimeout(t)
  }, [ui.autoplay, i, done]) // eslint-disable-line react-hooks/exhaustive-deps

  // tijd + langzaam scrollen + toetsaanslagen
  useEffect(() => {
    if (!ui.autoplay || paused || done) return
    let raf = 0
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = now - last.current; last.current = now
      setElapsed((e) => e + dt)
      if (scene.scrollBy) {
        const scroller = document.querySelector('[aria-label^="Voorbeeld voor"]') as HTMLElement | null
        const amount = (scene.scrollBy / scene.ms) * dt
        if (scroller) scroller.scrollTop += amount; else window.scrollBy(0, amount)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    if (scene.keys) keyTimer.current = window.setInterval(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: scene.keys!.key, bubbles: true })), scene.keys.every)
    return () => { cancelAnimationFrame(raf); window.clearInterval(keyTimer.current) }
  }, [ui.autoplay, paused, done, i]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ui.autoplay || done) return
    if (elapsed >= scene.ms) { if (i < SCENES.length - 1) { setI(i + 1); setElapsed(0) } else setDone(true) }
  }, [elapsed]) // eslint-disable-line react-hooks/exhaustive-deps

  // toetsenbord: spatie = pauze, Esc = stoppen (niet doorgeven aan de tijdmachine)
  useEffect(() => {
    if (!ui.autoplay) return
    const k = (e: KeyboardEvent) => {
      if (!e.isTrusted) return
      if (e.key === 'Escape') { e.stopImmediatePropagation(); stop() }
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  }, [ui.autoplay, stop])

  if (!ui.autoplay) return null
  const go = (d: number) => { setDone(false); setI((x) => Math.max(0, Math.min(SCENES.length - 1, x + d))); setElapsed(0) }
  const total = SCENES.reduce((a, s) => a + s.ms, 0)
  const before = SCENES.slice(0, i).reduce((a, s) => a + s.ms, 0)
  const pct = done ? 100 : ((before + Math.min(elapsed, scene.ms)) / total) * 100
  void loc

  return (
    <div className="fixed z-[96] inset-x-0 bottom-0 pointer-events-none dark-surface" role="region" aria-label="Automatische demo" aria-live="polite">
      <div className="mx-auto max-w-3xl px-3 pb-3 sm:pb-6 pointer-events-auto">
        <div className="rounded-3xl bg-[#0B1226] text-white shadow-modal border border-white/10 overflow-hidden">
          <div className="h-1 bg-white/10"><div className="h-full bg-magenta transition-[width] duration-200" style={{ width: `${pct}%` }} /></div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-white/60 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[#FF7AC4]"><span className={cx('h-2 w-2 rounded-full bg-magenta', !paused && !done && 'animate-pulse')} /> {done ? 'Einde' : paused ? 'Gepauzeerd' : 'Demo speelt af'}</span>
              <span>· scène {Math.min(i + 1, SCENES.length)} van {SCENES.length}</span>
            </div>
            <div key={i + String(done)} className="animate-rise">
              <h2 className="font-display text-[19px] sm:text-[23px] font-bold leading-snug">{scene.title}</h2>
              <p className="text-[14px] sm:text-[15px] text-white/80 mt-1 leading-relaxed">{scene.text}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              {done ? (
                <>
                  <button className="btn-white btn-sm h-10" onClick={() => { setDone(false); setI(0); setElapsed(0) }}><RotateCcw size={15} /> Opnieuw afspelen</button>
                  <button className="btn btn-sm h-10 bg-white/15 hover:bg-white/25 text-white" onClick={() => { stop(); navigate('/voor-jou') }}><Home size={15} /> Zelf verder kijken</button>
                </>
              ) : (
                <>
                  <button onClick={() => go(-1)} disabled={i === 0} className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center" aria-label="Vorige scène"><SkipBack size={17} /></button>
                  <button onClick={() => setPaused((p) => !p)} className="h-10 px-4 rounded-full bg-white text-ink font-semibold text-sm flex items-center gap-2" aria-label={paused ? 'Verder afspelen' : 'Pauzeren'}>{paused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}<span className="hidden sm:inline">{paused ? 'Verder' : 'Pauze'}</span></button>
                  <button onClick={() => go(1)} disabled={i === SCENES.length - 1} className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center" aria-label="Volgende scène"><SkipForward size={17} /></button>
                </>
              )}
              <button onClick={stop} className="ml-auto h-10 px-3 rounded-full hover:bg-white/10 text-sm font-semibold flex items-center gap-1.5 text-white/80" aria-label="Automatische demo stoppen (Esc)"><X size={16} /> Stoppen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
