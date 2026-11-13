import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ImagePlus, FolderPlus, PenLine, UserPlus, Sparkles, PlayCircle, HeartHandshake, Images, Film, BookImage, FileText, Quote, Clock, Timer } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { Img, AvatarStack } from '../components/ui'
import { useOpenMedia } from '../components/Media'
import { fmtDate, plural } from '../lib/format'
import { MemoryRow } from '../components/Memories'
import { AskFamilyCard } from '../components/AskFamily'

function greeting() {
  const h = new Date().getHours()
  return h < 6 ? 'Goedenacht' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond'
}

export default function VoorJou() {
  const { state } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const open = useOpenMedia()
  const hero = state.media.find((m) => m.id === 'm-2024-beach-family')!
  const nel = state.media.find((m) => m.id === 'm-1988-kitchen')!
  const nelStory = state.stories.find((s) => s.id === 's-nel-appeltaart')!

  // Vandaag in je herinneringen: dichtstbijzijnde dag van het jaar uit een eerder jaar
  const now = new Date()
  const doy = (d: Date) => Math.floor((Date.UTC(2000, d.getMonth(), d.getDate()) - Date.UTC(2000, 0, 0)) / 864e5)
  const today = doy(now)
  const otd = [...state.media].filter((m) => m.kind === 'photo' && !m.importedAt && m.peopleIds.length > 0 && m.sourceId !== 'scan' && Number(m.dateTaken.slice(0, 4)) < now.getFullYear())
    .sort((a, b) => Math.abs(doy(new Date(a.dateTaken)) - today) - Math.abs(doy(new Date(b.dateTaken)) - today))[0]
  const otdDate = new Date(otd.dateTaken)
  const yearsAgo = now.getFullYear() - otdDate.getFullYear()
  const exact = doy(otdDate) === today
  const featured = ['al-zeeland', 'al-vroeger', 'al-kinderen', 'al-geluk'].map((id) => state.albums.find((a) => a.id === id)).filter(Boolean)
  const counts = {
    photos: state.media.filter((m) => m.kind === 'photo').length, videos: state.media.filter((m) => m.kind === 'video').length,
    albums: state.albums.length, docs: state.documents.length,
  }
  const wishes = state.legacy.wishes

  return (
    <div className="space-y-12 sm:space-y-14">
      <section data-tour="hero">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-meta font-medium text-[17px]">{greeting()}, Sanne</p>
            <h1 className="font-display text-[34px] sm:text-[46px] font-bold leading-[1.02] tracking-[-0.025em] text-ink mt-1 max-w-[17ch] sm:max-w-none">Een leven vol verhalen. <span className="text-brand">Allemaal bij elkaar.</span></h1>
          </div>
          <div className="hidden xl:flex gap-2">
            <button className="btn-secondary" onClick={() => ui.open({ type: 'wow' })}><Sparkles size={18} className="text-magenta" /> Ontdek de mogelijkheden</button>
            <button className="btn-secondary" onClick={() => ui.open({ type: 'tourIntro' })}><PlayCircle size={18} /> Geef me een rondleiding</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-4">
          <div className="relative rounded-3xl overflow-hidden h-[340px] sm:h-[420px] group">
            <Img src={hero.src} alt={hero.alt} eager className="absolute inset-0" imgClassName="group-hover:scale-[1.02] transition-transform duration-[1.2s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1226]/80 via-[#0B1226]/10 to-transparent" />
            <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-8 flex flex-wrap items-end justify-between gap-4">
              <div className="text-white">
                <div className="text-sm font-semibold text-white/80 mb-1 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-magenta" /> Uitgelichte herinnering</div>
                <div className="font-display text-[28px] sm:text-[36px] font-bold leading-tight">Zomer in Zeeland · 2024</div>
                <div className="text-white/85 mt-1 flex items-center gap-2"><AvatarStack people={hero.peopleIds.map((id) => state.people.find((p) => p.id === id))} size={26} /> Ineke, Sanne en Mila op het duinpad bij Domburg</div>
              </div>
              <button className="btn-white" onClick={() => navigate(`/foto/${hero.id}`)}>Bekijk herinnering <ArrowRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 content-start">
            {[
              { l: "Foto's toevoegen", i: ImagePlus, r: () => ui.open({ type: 'addPhotos' }) },
              { l: 'Album maken', i: FolderPlus, r: () => ui.open({ type: 'newAlbum' }) },
              { l: 'Een verhaal vertellen', i: PenLine, r: () => ui.open({ type: 'story' }) },
              { l: 'Familie uitnodigen', i: UserPlus, r: () => ui.open({ type: 'invite' }) },
            ].map((a) => (
              <button key={a.l} onClick={a.r} className="card group flex items-center gap-3 p-4 lg:p-[18px] text-left hover:shadow-lift hover:border-[#D5DBE5] transition-all">
                <span className="h-11 w-11 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0 group-hover:bg-brand group-hover:text-white transition-colors"><a.i size={20} /></span>
                <span className="font-semibold text-[15px] leading-tight flex-1">{a.l}</span>
                <ArrowRight size={17} className="text-meta hidden sm:block group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
            <button onClick={() => navigate('/tijdmachine')} className="col-span-2 lg:col-span-1 rounded-2xl bg-ink text-white p-4 lg:p-[18px] text-left flex items-center gap-3 hover:bg-ink-soft transition-colors">
              <span className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Timer size={20} /></span>
              <span className="flex-1"><span className="block font-semibold">Reis door je familiegeschiedenis</span><span className="text-sm text-white/70">1975 → 2026 in zeven hoofdstukken</span></span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div className="xl:hidden flex flex-wrap gap-2 mt-4">
          <button className="btn-secondary btn-sm" onClick={() => ui.open({ type: 'wow' })}><Sparkles size={16} className="text-magenta" /> Ontdek de mogelijkheden</button>
          <button className="btn-secondary btn-sm" onClick={() => ui.open({ type: 'tourIntro' })}><PlayCircle size={16} /> Geef me een rondleiding</button>
        </div>
      </section>

      <section className="-mt-4 sm:-mt-6">
        <div className="flex items-end justify-between mb-3"><h2 className="font-display text-[20px] font-bold">Herinneringen voor jou</h2><span className="text-sm text-meta hidden sm:inline">Automatisch samengesteld · tik om af te spelen</span></div>
        <MemoryRow />
      </section>

      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        <div>
          <div className="eyebrow mb-1.5">Vandaag in je herinneringen</div>
          <h2 className="font-display text-[24px] font-bold mb-4">{exact ? 'Op deze dag' : 'Rond deze tijd'}, {yearsAgo} jaar geleden</h2>
          <button onClick={() => open(otd.id, [otd.id])} className="card w-full overflow-hidden text-left group grid sm:grid-cols-[1.1fr_1fr] hover:shadow-lift transition-shadow">
            <Img src={otd.thumb} alt={otd.alt} era={otd.era} grain className="h-56 sm:h-full min-h-[220px]" imgClassName="group-hover:scale-[1.03] transition-transform duration-500" />
            <span className="p-5 sm:p-6 flex flex-col">
              <span className="text-sm text-meta flex items-center gap-1.5"><Clock size={14} /> {fmtDate(otd.dateTaken)}</span>
              <span className="font-display text-xl font-bold mt-1 leading-snug">{otd.title}</span>
              <span className="text-[15px] text-ink/75 mt-2 leading-relaxed line-clamp-4">{otd.description}</span>
              <span className="mt-auto pt-4 link inline-flex items-center gap-1">Bekijk deze herinnering <ArrowRight size={16} /></span>
            </span>
          </button>
        </div>

        <div>
          <div className="eyebrow mb-1.5">Bijzondere verhalen</div>
          <h2 className="font-display text-[24px] font-bold mb-4">Achter iedere foto zit een verhaal</h2>
          <Link to={`/foto/${nel.id}`} className="block rounded-3xl overflow-hidden relative group h-[320px] sm:h-[360px] tile-focus">
            <Img src={nel.src} alt={nel.alt} era={nel.era} grain className="absolute inset-0" imgClassName="group-hover:scale-[1.03] transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b1408]/90 via-[#1b1408]/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <Quote size={26} className="text-magenta mb-2" />
              <div className="font-display text-[24px] font-bold leading-tight">{nelStory.title}</div>
              <div className="text-white/80 mt-1 text-[15px]">Oma Nel in de keuken, 1988 · verteld door Sanne</div>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold">Lees het verhaal <ArrowRight size={16} /></span>
            </div>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <div><div className="eyebrow mb-1.5">Jouw albums</div><h2 className="font-display text-[24px] sm:text-[26px] font-bold">Herinneringen, mooi bij elkaar</h2></div>
          <Link to="/albums" className="link inline-flex items-center gap-1 whitespace-nowrap">Alle albums <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {featured.map((a, i) => { const c = state.media.find((m) => m.id === a!.coverId); return (
            <Link key={a!.id} to={`/albums/${a!.id}`} className={`group relative rounded-2xl overflow-hidden tile-focus ${i === 0 ? 'aspect-[4/5] lg:aspect-[4/5]' : 'aspect-[4/5]'}`}>
              <Img src={c?.thumb ?? ''} alt={c?.alt ?? ''} era={c?.era} grain className="absolute inset-0" imgClassName="group-hover:scale-[1.04] transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="font-display text-[19px] sm:text-[21px] font-bold leading-tight">{a!.title}</div>
                <div className="text-sm text-white/80 mt-0.5">{plural(a!.mediaIds.length, 'item', 'items')} · {a!.period}</div>
              </div>
            </Link>) })}
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr] gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold">Jouw archief</h2>
            <span className="pill bg-[#FFF3D6] text-[#6B4A00]">Voorbeeldgegevens in deze demo</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: counts.photos, l: "foto's", i: Images, to: '/fotos?filter=fotos' },
              { n: counts.videos, l: "video's", i: Film, to: '/fotos?filter=videos' },
              { n: counts.albums, l: 'albums', i: BookImage, to: '/albums' },
              { n: counts.docs, l: 'documenten', i: FileText, to: '/kluis' },
            ].map((x) => (
              <Link key={x.l} to={x.to} className="rounded-xl bg-paper p-4 hover:bg-brand-50 transition-colors">
                <x.i size={18} className="text-brand mb-2" />
                <div className="font-display text-[26px] font-bold leading-none">{x.n}</div>
                <div className="text-sm text-meta mt-1">{x.l}</div>
              </Link>
            ))}
          </div>
          <p className="text-sm text-meta mt-4">Een kopie uit {state.sources.filter((s) => s.status === 'connected').length} gekoppelde voorbeeldbron en {state.sources.filter((s) => s.status === 'manual').length} handmatige imports. <Link to="/bronnen" className="link">Bronnen bekijken</Link></p>
        </div>
        <AskFamilyCard />
        <div className="rounded-2xl p-6 bg-[linear-gradient(135deg,#FDE6F3,#F2F4FC)] border border-[#F6D3E7] flex flex-col">
          <HeartHandshake size={24} className="text-magenta" />
          <h2 className="font-display text-xl font-bold mt-3">Wat wil je later doorgeven?</h2>
          <p className="text-[15px] text-ink/75 mt-1.5 leading-relaxed">
            {wishes.length ? `Je hebt ${plural(wishes.length, 'bewaarwens', 'bewaarwensen')} vastgelegd, voor ${Array.from(new Set(wishes.map((w) => state.people.find((p) => p.id === w.recipientId)?.name))).join(' en ')}.` : 'Leg vast welke herinneringen later naar wie mogen gaan. Rustig, en altijd aan te passen.'}
          </p>
          <Link to="/nalatenschap" className="btn-primary mt-auto self-start mt-5">Bekijk mijn wensen <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  )
}
