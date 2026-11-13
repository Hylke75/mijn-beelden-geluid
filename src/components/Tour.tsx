import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, X, PartyPopper, Play, Timer, BookOpenText, Users, Landmark, HeartHandshake, RotateCcw, Home, Compass } from 'lucide-react'
import { useUI } from '../demo/ui'
import { AutoPlayButton } from './AutoPlay'
import { useDemo } from '../demo/store'
import { cx } from '../lib/format'

export const TOUR = [
  { title: 'Welkom in het archief van Sanne', to: '/voor-jou', target: '[data-tour="hero"]', text: 'Dit is het persoonlijke dashboard van Sanne van Dijk (44, Haarlem). Foto\'s, video\'s, documenten en vooral de verhalen erachter, allemaal op één Nederlandse plek.' },
  { title: 'Een foto terugvinden', to: '/fotos', target: '[data-tour="filters"]', text: 'Filter op jaar, persoon, plaats of bron, of zoek bovenin op bijvoorbeeld “Zeeland” of “2012”. Klik op een foto voor de lichtbak; met de pijltjestoetsen blader je verder.' },
  { title: 'Het verhaal achter de foto', to: '/foto/m-1988-kitchen', target: '[data-tour="story"]', text: 'Oma Nel in de keuken, 1988. Bij iedere foto kan het verhaal bewaard worden: wie, waar, waarom. Zo gaat niet alleen het beeld over, maar ook de herinnering.' },
  { title: 'De tijdmachine', to: '/tijdlijn', target: '[data-tour="timemachine"]', text: 'De tijdlijn ordent alles chronologisch, van zwart-wit 1975 tot vandaag. Start de tijdreis voor een meeslepende reis door drie generaties.' },
  { title: 'Samen herinneren', to: '/albums/al-zeeland', target: '[data-tour="share"]', text: 'Deel een album met familie. Kies Ineke en Marieke, en bekijk daarna demonstratief wat Ineke ziet. Je documentenkluis blijft altijd privé.' },
  { title: 'Kluis en importeren', to: '/kluis', target: '[data-tour="vault"]', text: 'Belangrijke papieren in een aparte, rustige omgeving. Via Bronnen & importeren komt een kopie van je foto\'s uit andere diensten hier samen. In de demo is niets echt beveiligd of gekoppeld.' },
  { title: 'Nu bewaren, later doorgeven', to: '/nalatenschap', target: '[data-tour="legacy"]', text: 'Bepaal wie jouw herinneringen later mag ontvangen. Bekijk het voorbeeld voor Mila: een brief met verhalen en foto\'s. Een ontwerpconcept, geen juridische garantie.' },
  { title: 'Bijdragen aan Nederland', to: '/nationaal-archief', target: '[data-tour="heritage"]', text: 'Bied vrijwillig een foto aan voor het nationaal archief. Een archivaris beslist; je privéfoto blijft privé. De herinneringen van vandaag zijn het erfgoed van morgen.' },
]

export function TourPanel() {
  const ui = useUI()
  const { setTourDone } = useDemo()
  const navigate = useNavigate()
  const loc = useLocation()
  const step = ui.tourStep
  const [rect, setRect] = useState<DOMRect | null>(null)
  const finished = step === TOUR.length

  useEffect(() => {
    if (step == null || finished) { setRect(null); return }
    const s = TOUR[step]
    let tries = 0
    let el: Element | null = null
    const find = () => {
      el = document.querySelector(s.target)
      if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); window.setTimeout(() => setRect(el!.getBoundingClientRect()), 350) }
      else if (tries++ < 20) window.setTimeout(find, 150)
    }
    setRect(null)
    const t = window.setTimeout(find, 200)
    const upd = () => el && setRect(el.getBoundingClientRect())
    window.addEventListener('scroll', upd, true); window.addEventListener('resize', upd)
    return () => { window.clearTimeout(t); window.removeEventListener('scroll', upd, true); window.removeEventListener('resize', upd) }
  }, [step, loc.pathname, finished])

  if (step == null || ui.autoplay) return null
  const goto = (n: number) => { ui.setTourStep(n); if (n < TOUR.length) navigate(TOUR[n].to) }
  const stop = () => { ui.setTourStep(null) }

  if (finished) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Rondleiding voltooid">
        <div className="absolute inset-0 bg-ink/50 animate-fadeIn" />
        <div className="relative card shadow-modal max-w-md w-full p-8 text-center animate-pop">
          <div className="mx-auto h-16 w-16 rounded-full bg-magenta-light text-magenta flex items-center justify-center mb-4"><PartyPopper size={30} /></div>
          <h2 className="font-display text-2xl font-bold">Je hebt de mogelijkheden ontdekt.</h2>
          <p className="text-meta mt-2">Je kunt nu zelf verder rondkijken. Alles wat je doet blijft in deze demo bewaard tot je opnieuw start.</p>
          <button className="btn-primary mt-6 w-full" autoFocus onClick={() => { setTourDone(true); stop(); navigate('/voor-jou') }}><Home size={18} /> Terug naar mijn archief</button>
        </div>
      </div>
    )
  }
  const s = TOUR[step]
  const pad = 8
  return (
    <>
      {rect && (
        <div aria-hidden className="fixed z-[60] pointer-events-none rounded-2xl transition-all duration-300"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, boxShadow: '0 0 0 4px #E60088, 0 0 0 9999px rgba(20,35,72,.28)' }} />
      )}
      <div className="fixed z-[85] left-3 right-3 bottom-[76px] lg:bottom-6 lg:left-auto lg:right-6 lg:w-[400px] card shadow-modal p-5 animate-rise" role="dialog" aria-label={`Rondleiding stap ${step + 1} van ${TOUR.length}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-magenta">Rondleiding · {step + 1} van {TOUR.length}</span>
          <button onClick={stop} className="btn-ghost h-8 px-2 text-sm text-meta" aria-label="Rondleiding overslaan">Overslaan <X size={15} /></button>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden mb-4" aria-hidden><div className="h-full bg-magenta transition-all duration-300" style={{ width: `${((step + 1) / TOUR.length) * 100}%` }} /></div>
        <h2 className="font-display text-xl font-bold leading-snug">{s.title}</h2>
        <p className="text-[15px] text-ink/80 mt-1.5 leading-relaxed">{s.text}</p>
        <div className="flex items-center gap-2 mt-5">
          <button className="btn-secondary btn-sm h-10" onClick={() => goto(step - 1)} disabled={step === 0}><ArrowLeft size={16} /> Vorige</button>
          <button className="btn-primary btn-sm h-10 ml-auto" onClick={() => goto(step + 1)} autoFocus>{step === TOUR.length - 1 ? 'Afronden' : 'Volgende'} <ArrowRight size={16} /></button>
        </div>
      </div>
    </>
  )
}

export function PresenterPanel() {
  const [params] = useSearchParams()
  const [on, setOn] = useState(() => { try { return sessionStorage.getItem('mbg-presenter') === '1' } catch { return false } })
  const [min, setMin] = useState(false)
  const navigate = useNavigate()
  const ui = useUI()
  useEffect(() => { if (params.get('presenter') === '1') { setOn(true); try { sessionStorage.setItem('mbg-presenter', '1') } catch { /* */ } } if (params.get('presenter') === '0') { setOn(false); try { sessionStorage.removeItem('mbg-presenter') } catch { /* */ } } }, [params])
  if (!on) return null
  const items = [
    { l: 'Start', i: Home, to: '/voor-jou' },
    { l: 'Tijdmachine', i: Timer, to: '/tijdmachine' },
    { l: 'Oma Nels verhaal', i: BookOpenText, to: '/foto/m-1988-kitchen' },
    { l: 'Familie delen', i: Users, to: '/albums/al-zeeland?delen=1' },
    { l: 'Later doorgeven', i: HeartHandshake, to: '/nalatenschap?wens=mila' },
    { l: 'Nationaal archief', i: Landmark, to: '/nationaal-archief/aanbieden?foto=m-1975-haarlem' },
  ]
  return (
    <div className={cx('fixed z-[88] left-3 bottom-[76px] lg:left-[262px] lg:bottom-4 rounded-2xl bg-ink text-white shadow-modal p-1.5 flex items-center gap-1 max-w-[calc(100vw-24px)] overflow-x-auto scrollbar-none dark-surface')} aria-label="Presentator-paneel">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5"><Play size={12} /> Presentator</span>
      {!min && items.map((x) => (
        <button key={x.l} onClick={() => { ui.close(); ui.setTourStep(null); navigate(x.to) }} className="h-9 px-3 rounded-xl hover:bg-white/15 text-[13px] font-semibold whitespace-nowrap flex items-center gap-1.5"><x.i size={14} />{x.l}</button>
      ))}
      {!min && <button onClick={() => { ui.close(); ui.setTourStep(null); ui.setAutoplay(true) }} className="h-9 px-3 rounded-xl hover:bg-white/15 text-[13px] font-semibold whitespace-nowrap flex items-center gap-1.5"><Play size={14} />Speel af</button>}
      {!min && <button onClick={() => ui.open({ type: 'reset' })} className="h-9 px-3 rounded-xl hover:bg-white/15 text-[13px] font-semibold whitespace-nowrap flex items-center gap-1.5 text-[#FFB3DB]"><RotateCcw size={14} />Reset demo</button>}
      <button onClick={() => setMin((m) => !m)} className="h-9 w-9 rounded-xl hover:bg-white/15 flex items-center justify-center" aria-label={min ? 'Paneel uitklappen' : 'Paneel inklappen'}>{min ? <Compass size={16} /> : <X size={16} />}</button>
    </div>
  )
}

/** Rustig welkomstpaneel bij het eerste bezoek: niet blokkerend, met tijdsindicatie vooraf. */
export function WelcomePanel() {
  const { state, dismissWelcome } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const loc = useLocation()
  const [params] = useSearchParams()
  if (state.welcomeDismissed || ui.autoplay || ui.tourStep != null || loc.pathname !== '/voor-jou' || params.get('presenter') || ui.modal) return null
  return (
    <div className="fixed z-[35] left-3 right-3 bottom-[76px] lg:left-auto lg:right-6 lg:bottom-6 lg:w-[380px] card shadow-modal p-5 animate-rise" role="region" aria-label="Welkom">
      <button onClick={dismissWelcome} className="absolute top-3 right-3 h-8 w-8 rounded-full hover:bg-ink/5 flex items-center justify-center text-meta" aria-label="Welkomstbericht sluiten"><X size={16} /></button>
      <div className="text-xs font-semibold text-magenta mb-1">Welkom in de demo</div>
      <h2 className="font-display text-lg font-bold leading-snug pr-6">Je kijkt mee in het familiearchief van Sanne</h2>
      <p className="text-[14px] text-ink/75 mt-1.5 leading-relaxed">Een fictieve familie, vier generaties. Alles is aan te klikken en je kunt niets kapot maken.</p>
      <div className="space-y-2 mt-4" onClick={(e) => { if ((e.target as HTMLElement).closest('[data-autoplay]')) dismissWelcome() }}>
        <div data-autoplay><AutoPlayButton className="w-full flex items-center gap-3 rounded-xl bg-ink text-white px-4 py-2.5 text-left hover:bg-ink-soft font-semibold text-[15px]" /></div>
        <button className="w-full flex items-center gap-3 rounded-xl bg-brand text-white px-4 py-2.5 text-left hover:bg-brand-dark" onClick={() => { dismissWelcome(); ui.setTourStep(0); navigate(TOUR[0].to) }}><Play size={17} /><span className="flex-1"><span className="block font-semibold text-[15px]">Geef me een rondleiding</span><span className="block text-xs text-white/75">8 stappen · ongeveer 8 minuten</span></span></button>
        <button className="w-full flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-left hover:border-brand" onClick={() => { dismissWelcome(); ui.open({ type: 'wow' }) }}><Compass size={17} className="text-magenta" /><span className="flex-1"><span className="block font-semibold text-[15px]">Toon de 5 hoogtepunten</span><span className="block text-xs text-meta">Elk 1–2 minuten</span></span></button>
      </div>
      <button className="text-sm text-meta hover:text-ink mt-3 w-full text-center" onClick={dismissWelcome}>Liever zelf rondkijken</button>
    </div>
  )
}
