import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Timer, ArrowRight, Heart, Baby, Sun, Cake, Gem, BookOpenText, Play } from 'lucide-react'
import { useDemo } from '../demo/store'
import { Img, PageHeader } from '../components/ui'
import { useOpenMedia } from '../components/Media'
import { cx, monthName } from '../lib/format'
import { visibleMedia } from '../lib/selectors'

const MOMENTS = [
  { y: '1975', t: 'Pieter en Ineke trouwen', i: Gem, to: '/foto/m-1975-portrait' },
  { y: '1994', t: 'Eerste zomer in Zeeland', i: Sun, to: '/verhalen/s-zeeland-1994' },
  { y: '2010', t: 'Sanne en Thomas trouwen', i: Heart, to: '/albums/al-huwelijk' },
  { y: '2012', t: 'Mila wordt geboren', i: Baby, to: '/verhalen/s-mila-geboren' },
  { y: '2016', t: 'Daan wordt geboren', i: Baby, to: '/fotos?jaar=2016' },
  { y: '2025', t: 'Opa Pieter wordt 75', i: Cake, to: '/albums/al-pieter-75' },
]

export default function Tijdlijn() {
  const { state } = useDemo()
  const open = useOpenMedia()
  const navigate = useNavigate()
  const media = visibleMedia(state).filter((m) => m.kind !== 'audio')
  const groups = useMemo(() => {
    const byYear = new Map<string, Map<number, typeof media>>()
    ;[...media].sort((a, b) => a.dateTaken.localeCompare(b.dateTaken)).forEach((m) => {
      const y = m.dateTaken.slice(0, 4); const mo = Number(m.dateTaken.slice(5, 7)) - 1
      if (!byYear.has(y)) byYear.set(y, new Map())
      const ym = byYear.get(y)!
      if (!ym.has(mo)) ym.set(mo, [])
      ym.get(mo)!.push(m)
    })
    return [...byYear.entries()]
  }, [media])
  const years = groups.map(([y]) => y)
  const [active, setActive] = useState(years[0])
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const lock = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      if (Date.now() < lock.current) return
      let cur = years[0]
      for (const y of years) { const el = refs.current[y]; if (el && el.getBoundingClientRect().top <= 170) cur = y }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [groups]) // eslint-disable-line react-hooks/exhaustive-deps
  const jump = (y: string) => { setActive(y); lock.current = Date.now() + 1200; refs.current[y]?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const storyFor = (y: string) => state.stories.filter((s) => s.date.startsWith(y))

  return (
    <div>
      <PageHeader eyebrow="Ontdekken" title="Tijdlijn" sub="Van zwart-wit in 1975 tot gisteren. Vier generaties, één doorlopend verhaal." />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mb-10">
        <button data-tour="timemachine" onClick={() => navigate('/tijdmachine')} className="relative rounded-3xl overflow-hidden h-[260px] sm:h-[300px] text-left group">
          <div className="absolute inset-0 grid grid-cols-4">
            {['m-1975-portrait', 'm-1994-beach', 'm-2012-mila-sleep', 'm-2024-beach-family'].map((id, i) => { const m = state.media.find((x) => x.id === id)!; return <Img key={id} src={m.thumb} alt="" era={m.era} className={cx('h-full', i === 0 && 'bw')} imgClassName="group-hover:scale-105 transition-transform duration-[1.5s]" /> })}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1226]/95 via-[#0B1226]/70 to-[#0B1226]/20" />
          <div className="relative h-full p-7 sm:p-9 flex flex-col justify-end text-white max-w-md">
            <span className="pill bg-white/15 text-white self-start mb-3"><Timer size={13} /> Tijdmachine · 2 min</span>
            <span className="font-display text-[28px] sm:text-[34px] font-bold leading-tight">Reis door je familiegeschiedenis</span>
            <span className="text-white/80 mt-2">Zeven hoofdstukken, van de trouwdag in 1975 tot een weekend in Haarlem in 2026.</span>
            <span className="btn-white self-start mt-5 pointer-events-none">Start de tijdreis <Play size={16} fill="currentColor" /></span>
          </div>
        </button>
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold mb-1">Bijzondere momenten in jouw leven</h2>
          <p className="text-sm text-meta mb-4">Mijlpalen die Sanne heeft gemarkeerd</p>
          <ul className="space-y-1">
            {MOMENTS.map((x) => (
              <li key={x.t}><Link to={x.to} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-paper">
                <span className="h-9 w-9 rounded-full bg-magenta-light text-magenta flex items-center justify-center shrink-0"><x.i size={16} /></span>
                <span className="font-display font-bold w-12 text-brand">{x.y}</span><span className="flex-1 text-[15px]">{x.t}</span><ArrowRight size={16} className="text-meta" />
              </Link></li>
            ))}
          </ul>
        </div>
      </div>

      <nav aria-label="Spring naar jaar" className="sticky top-[64px] lg:top-[72px] z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-2.5 bg-paper/95 backdrop-blur border-b border-line/70 mb-8">
        <div className="relative flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {years.map((y) => (
            <button key={y} onClick={() => jump(y)} aria-current={active === y ? 'true' : undefined}
              className={cx('h-8 px-2.5 rounded-full text-sm font-semibold tabular-nums transition-colors shrink-0', active === y ? 'bg-brand text-white' : 'text-ink/60 hover:text-ink hover:bg-white')}>{y}</button>
          ))}
        </div>
      </nav>

      <div className="relative">
        <div className="absolute left-[19px] sm:left-[27px] top-2 bottom-0 w-px bg-line" aria-hidden />
        {groups.map(([y, months]) => (
          <section key={y} data-year={y} ref={(el) => { refs.current[y] = el }} className="relative pl-12 sm:pl-20 pb-12 scroll-mt-[150px]" aria-labelledby={`y-${y}`}>
            <div className={cx('absolute left-0 top-0 h-10 w-10 sm:h-14 sm:w-14 rounded-full flex items-center justify-center font-display font-bold text-[13px] sm:text-[15px] border-4 border-paper', active === y ? 'bg-brand text-white' : 'bg-white text-ink shadow-card')}>{y.slice(2)}'</div>
            <h2 id={`y-${y}`} className="font-display text-[30px] sm:text-[36px] font-bold leading-none pt-1.5 sm:pt-3">{y}</h2>
            {storyFor(y).map((s) => (
              <Link key={s.id} to={`/verhalen/${s.id}`} className="mt-4 flex items-center gap-3 rounded-2xl bg-white border border-line p-3 pr-4 max-w-xl hover:shadow-lift transition-shadow">
                <span className="h-10 w-10 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0"><BookOpenText size={18} /></span>
                <span className="flex-1"><span className="text-xs text-meta block">Verhaal</span><span className="font-semibold leading-tight">{s.title}</span></span><ArrowRight size={16} className="text-meta" />
              </Link>
            ))}
            {[...months.entries()].map(([mo, list]) => (
              <div key={mo} className="mt-5">
                <h3 className="text-sm font-semibold text-meta capitalize mb-2.5">{monthName(mo)} {y} · {list.length} {list.length === 1 ? 'herinnering' : 'herinneringen'}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {list.map((m, i) => (
                    <button key={m.id} onClick={() => open(m.id, media.map((x) => x.id))} className={cx('group relative rounded-xl overflow-hidden tile-focus', i === 0 && list.length > 2 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square')} aria-label={m.title}>
                      <Img src={m.thumb} alt={m.alt} era={m.era} grain className="absolute inset-0" imgClassName="group-hover:scale-105 transition-transform duration-500" />
                      {m.kind === 'video' && <span className="absolute left-1.5 bottom-1.5 h-6 w-6 rounded-full bg-black/55 text-white flex items-center justify-center"><Play size={11} fill="currentColor" /></span>}
                      <span className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-[12px] font-medium text-left leading-tight opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">{m.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
