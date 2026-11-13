import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { UserRound, ShieldCheck, Bell, CloudDownload, LifeBuoy, HardDrive, CreditCard, RotateCcw, ChevronDown, BookImage, BookOpenText, MapPin, CalendarDays, FileText, Lock, Search as SearchIcon, ArrowRight, Info, Accessibility, Mail } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { Avatar, DemoNote, Img, PageHeader, Toggle, EmptyState } from '../components/ui'
import { SearchBox } from '../components/SearchBox'
import { useOpenMedia } from '../components/Media'
import { searchAll, SUGGESTIONS } from '../lib/search'
import { cx } from '../lib/format'
import { AutoPlayButton } from '../components/AutoPlay'

const SECTIONS = [
  { id: 'profiel', l: 'Profiel', i: UserRound }, { id: 'weergave', l: 'Weergave', i: Accessibility }, { id: 'privacy', l: 'Privacy', i: ShieldCheck },
  { id: 'meldingen', l: 'Meldingen', i: Bell }, { id: 'bronnen', l: 'Bronnen', i: CloudDownload }, { id: 'opslag', l: 'Opslag', i: HardDrive },
  { id: 'abonnement', l: 'Abonnement', i: CreditCard }, { id: 'hulp', l: 'Hulp', i: LifeBuoy }, { id: 'demo', l: 'Demo', i: RotateCcw },
]

export function Instellingen() {
  const { state, updateSettings, toast } = useDemo()
  const ui = useUI()
  const loc = useLocation()
  const s = state.settings
  const me = state.people.find((p) => p.id === 'sanne')!
  const [name, setName] = useState(me.fullName)
  useEffect(() => { if (loc.hash) setTimeout(() => document.getElementById(loc.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50) }, [loc.hash])
  const set = (patch: Partial<typeof s>, msg = 'Voorkeur opgeslagen') => { updateSettings(patch); toast({ text: msg }) }
  const used = 38.4, total = 100
  return (
    <div>
      <PageHeader eyebrow="Account" title="Instellingen" sub="Jouw profiel, privacy en voorkeuren. Alles in deze demo is fictief." />
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="hidden lg:block sticky top-[96px] h-fit" aria-label="Instellingen-secties">
          {SECTIONS.map((x) => <a key={x.id} href={`#${x.id}`} className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-[15px] font-medium text-ink/75 hover:bg-white hover:text-ink"><x.i size={17} /> {x.l}</a>)}
        </nav>
        <div className="space-y-6 max-w-3xl">
          <section id="profiel" className="card p-6 scroll-mt-28">
            <h2 className="font-display text-xl font-bold mb-5">Profiel</h2>
            <div className="flex items-center gap-4 mb-5"><Avatar person={me} size={72} /><div><div className="font-semibold text-lg">{me.fullName}</div><div className="text-meta">Haarlem · lid sinds 2024 (fictief)</div><button className="link text-sm mt-1" onClick={() => ui.open({ type: 'unavailable', title: 'Profielfoto wijzigen', text: 'In de conceptdemo kun je geen eigen foto uploaden.' })}>Profielfoto wijzigen</button></div></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label" htmlFor="pn">Naam</label><input id="pn" className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className="label" htmlFor="pe">E-mailadres</label><input id="pe" className="input" value={me.email} readOnly aria-describedby="pe-h" /><p id="pe-h" className="text-xs text-meta mt-1">Fictief voorbeeldadres</p></div>
            </div>
            <button className="btn-primary btn-sm mt-4" onClick={() => toast({ text: 'Profiel opgeslagen (alleen in deze demo)' })}>Opslaan</button>
          </section>
          <section id="weergave" className="card p-6 scroll-mt-28">
            <h2 className="font-display text-xl font-bold mb-2">Weergave en toegankelijkheid</h2>
            <div className="divide-y divide-line">
              <Toggle checked={s.largeText} onChange={(v) => set({ largeText: v }, v ? 'Grotere tekst aan' : 'Grotere tekst uit')} label="Grotere tekst" description="Maakt alle tekst in de app iets groter." />
              <Toggle checked={s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="Minder beweging" description="Geen zoom- en overgangsanimaties." />
              <Toggle checked={s.showOnThisDay} onChange={(v) => set({ showOnThisDay: v })} label="Toon “Vandaag in je herinneringen”" />
            </div>
          </section>
          <section id="privacy" className="card p-6 scroll-mt-28">
            <h2 className="font-display text-xl font-bold mb-2">Privacy</h2>
            <div className="divide-y divide-line">
              <div className="py-3.5"><label htmlFor="dv" className="font-semibold">Standaard zichtbaarheid van nieuwe foto's</label><select id="dv" className="input mt-2 max-w-sm" value={s.defaultVisibility} onChange={(e) => set({ defaultVisibility: e.target.value as typeof s.defaultVisibility })}><option value="private">Alleen ik (aanbevolen)</option><option value="family">Mijn familiekring</option></select></div>
              <Toggle checked={s.faceGrouping} onChange={(v) => set({ faceGrouping: v })} label="Personen voorstellen bij nieuwe foto's" description="Uit: je labelt zelf wie er op een foto staat. In deze demo wordt geen gezichtsherkenning gebruikt." />
              <div className="py-3.5 flex flex-wrap gap-3 items-center"><div className="flex-1 min-w-[200px]"><div className="font-semibold">Mijn gegevens downloaden</div><div className="text-sm text-meta">Een kopie van alles wat je hier bewaart.</div></div><button className="btn-secondary btn-sm" onClick={() => ui.open({ type: 'unavailable', title: 'Gegevens downloaden', text: 'In de echte dienst kun je altijd al je bestanden en verhalen downloaden in open formaten. In deze demo is dat niet beschikbaar.' })}>Aanvragen</button></div>
            </div>
            <p className="text-sm text-meta mt-3 flex gap-2"><Info size={15} className="mt-0.5 shrink-0" />Uitgangspunt van het concept: geen advertenties, geen datahandel. Er zijn in deze demo geen claims over bestaande beveiliging.</p>
          </section>
          <section id="meldingen" className="card p-6 scroll-mt-28">
            <h2 className="font-display text-xl font-bold mb-2">Meldingen</h2>
            <div className="divide-y divide-line">
              <Toggle checked={s.notifyFamily} onChange={(v) => set({ notifyFamily: v })} label="Als familie een verhaal toevoegt" />
              <Toggle checked={s.notifyMemories} onChange={(v) => set({ notifyMemories: v })} label="Herinneringen van deze dag" />
              <Toggle checked={s.notifyWeekly} onChange={(v) => set({ notifyWeekly: v })} label="Wekelijks overzicht per e-mail" description="In de demo wordt niets verstuurd." />
            </div>
          </section>
          <section id="bronnen" className="card p-6 scroll-mt-28">
            <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-bold">Bronnen</h2><Link to="/bronnen" className="link text-sm">Beheren</Link></div>
            <ul className="divide-y divide-line">{state.sources.slice(0, 6).map((x) => <li key={x.id} className="flex items-center gap-3 py-2.5 text-[15px]"><span className="flex-1">{x.name}</span><span className={cx('text-sm', x.status === 'connected' ? 'text-[#1E6B43] font-semibold' : 'text-meta')}>{x.status === 'connected' ? 'Voorbeeld verbonden' : x.status === 'manual' ? 'Handmatig' : 'Niet ingesteld'}</span></li>)}</ul>
          </section>
          <section id="opslag" className="card p-6 scroll-mt-28">
            <h2 className="font-display text-xl font-bold mb-1">Opslag</h2>
            <p className="text-sm text-meta mb-4">Fictief voorbeeld</p>
            <div className="h-3 rounded-full bg-line overflow-hidden flex" role="img" aria-label={`${used} van ${total} GB gebruikt (fictief)`}><div className="bg-brand" style={{ width: '24%' }} /><div className="bg-magenta" style={{ width: '9%' }} /><div className="bg-ink/40" style={{ width: '5.4%' }} /></div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Foto's 24 GB</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-magenta" />Video's 9 GB</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink/40" />Documenten 5,4 GB</span><span className="ml-auto font-semibold">{used.toLocaleString('nl-NL')} van {total} GB</span></div>
          </section>
          <section id="abonnement" className="card p-6 scroll-mt-28">
            <div className="flex items-center gap-2 mb-1"><h2 className="font-display text-xl font-bold">Abonnement</h2><span className="pill bg-[#FFF3D6] text-[#6B4A00]">Concept</span></div>
            <p className="text-[15px] text-ink/80">Familiearchief · <strong>€ 9,95 per maand</strong> <span className="text-meta">(te onderzoeken prijs)</span></p>
            <p className="text-sm text-meta mt-1">Er is geen betaalsysteem in deze demo en er wordt niets in rekening gebracht.</p>
            <button className="btn-secondary btn-sm mt-4" onClick={() => ui.open({ type: 'unavailable', title: 'Abonnement wijzigen', text: 'Het abonnementsmodel is nog een concept. Prijs en inhoud worden getoetst in het haalbaarheidsonderzoek.' })}>Abonnement bekijken</button>
          </section>
          <section id="hulp" className="card p-6 scroll-mt-28">
            <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Hulp en veelgestelde vragen</h2><Link to="/hulp" className="link text-sm">Naar Hulp</Link></div>
            <button className="link text-sm mt-3 inline-flex items-center gap-1" onClick={() => ui.open({ type: 'about' })}><Info size={14} /> Over deze demo</button>
          </section>
          <section id="demo" className="card p-6 border-[#F3DFB4] bg-[#FFFBF2] scroll-mt-28">
            <h2 className="font-display text-xl font-bold mb-1">Demo opnieuw instellen</h2>
            <p className="text-[15px] text-ink/80">Zet alle albums, favorieten, verhalen, wensen en aanbiedingen terug naar de beginsituatie.</p>
            <div className="flex flex-wrap gap-2 mt-4"><button className="btn-primary" onClick={() => ui.open({ type: 'reset' })}><RotateCcw size={17} /> Demo opnieuw instellen</button><button className="btn-secondary" onClick={() => ui.open({ type: 'tourIntro' })}>Rondleiding opnieuw</button></div>
          </section>
        </div>
      </div>
    </div>
  )
}

export function Zoeken() {
  const { state } = useDemo()
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const res = searchAll(state, q)
  const open = useOpenMedia()
  const H = ({ i: I, t, n }: { i: typeof BookImage; t: string; n: number }) => <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-3"><I size={18} className="text-brand" /> {t} <span className="text-meta font-normal text-base">{n}</span></h2>
  return (
    <div>
      <PageHeader eyebrow="Zoeken" title={q ? `Resultaten voor “${q}”` : 'Zoek in je archief'} sub={res ? `${res.total} resultaten in foto's, albums, verhalen, personen en documenten` : 'Zoek op personen, plaatsen, jaren of herinneringen.'} />
      <div className="max-w-2xl mb-8"><SearchBox big autoFocus={!q} /></div>
      {!res ? (
        <div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <Link key={s} to={`/zoeken?q=${encodeURIComponent(s)}`} className="chip-off">{s}</Link>)}</div>
      ) : res.total === 0 ? (
        <EmptyState icon={<SearchIcon size={26} />} title={`Niets gevonden voor “${q}”`} text="Probeer een naam (Mila, oma Nel), een plaats (Zeeland, Haarlem) of een jaartal (2012)." />
      ) : (
        <div className="space-y-10">
          {res.people.length > 0 && <section><H i={UserRound} t="Personen" n={res.people.length} /><div className="flex flex-wrap gap-3">{res.people.map((p) => <Link key={p.id} to={`/fotos?persoon=${p.id}`} className="card flex items-center gap-3 p-3 pr-5 hover:shadow-lift"><Avatar person={p} size={48} /><div><div className="font-semibold">{p.fullName}</div><div className="text-sm text-meta">{p.relationLabel} · {state.media.filter((m) => m.peopleIds.includes(p.id)).length} herinneringen</div></div></Link>)}</div></section>}
          {(res.places.length > 0 || res.years.length > 0) && <section className="flex flex-wrap gap-2">{res.places.map((p) => <Link key={p} to={`/fotos?plaats=${encodeURIComponent(p)}`} className="chip-off"><MapPin size={14} /> {p}</Link>)}{res.years.map((y) => <Link key={y} to={`/fotos?jaar=${y}`} className="chip-off"><CalendarDays size={14} /> {y}</Link>)}</section>}
          {res.media.length > 0 && <section><H i={BookImage} t="Foto's & video's" n={res.media.length} /><div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">{res.media.slice(0, 24).map((m) => <button key={m.id} onClick={() => open(m.id, res.media.map((x) => x.id))} className="group" aria-label={m.title}><Img src={m.thumb} alt={m.alt} era={m.era} grain className="aspect-square rounded-xl" imgClassName="group-hover:scale-105 transition-transform duration-500" /></button>)}</div>{res.media.length > 24 && <p className="text-sm text-meta mt-2">En nog {res.media.length - 24} meer</p>}</section>}
          {res.albums.length > 0 && <section><H i={BookImage} t="Albums" n={res.albums.length} /><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{res.albums.map((a) => { const c = state.media.find((m) => m.id === a.coverId); return <Link key={a.id} to={`/albums/${a.id}`} className="card overflow-hidden hover:shadow-lift"><Img src={c?.thumb ?? ''} alt="" era={c?.era} className="h-32" /><div className="p-3"><div className="font-semibold">{a.title}</div><div className="text-sm text-meta">{a.mediaIds.length} items</div></div></Link> })}</div></section>}
          {res.stories.length > 0 && <section><H i={BookOpenText} t="Verhalen" n={res.stories.length} /><div className="grid md:grid-cols-2 gap-3">{res.stories.map((s) => { const m = state.media.find((x) => x.id === s.mediaId); return <Link key={s.id} to={`/verhalen/${s.id}`} className="card flex overflow-hidden hover:shadow-lift"><Img src={m?.thumb ?? ''} alt="" era={m?.era} className="w-28 shrink-0" /><div className="p-4"><div className="font-semibold leading-snug">{s.title}</div><p className="text-sm text-meta line-clamp-2 mt-1">{s.intro}</p></div></Link> })}</div></section>}
          {res.documents.length > 0 && <section><H i={FileText} t="Documenten" n={res.documents.length} /><div className="rounded-2xl bg-white border border-line divide-y divide-line">{res.documents.map((d) => <Link key={d.id} to="/kluis" className="flex items-center gap-3 p-4 hover:bg-paper"><FileText size={18} className="text-meta" /><span className="flex-1 font-medium">{d.title}</span><span className="pill bg-ink text-white"><Lock size={11} /> Privé · kluis</span></Link>)}</div><p className="text-sm text-meta mt-2">Documenten zijn alleen voor jou zichtbaar, nooit voor familie.</p></section>}
        </div>
      )}
    </div>
  )
}

const FAQ = [
  { q: 'Wat is Mijn Beeld & Geluid?', a: 'Een concept voor een Nederlands familiearchief: een tweede kopie van je foto\'s, video\'s en documenten, met de verhalen erachter. Bedacht bij Beeld & Geluid; nog geen bestaande dienst.' },
  { q: 'Moet ik stoppen met Google Photos of iCloud?', a: 'Nee. In het concept blijf je je eigen apps gewoon gebruiken. Mijn Beeld & Geluid bewaart een tweede kopie op één plek.' },
  { q: 'Wie kan mijn foto\'s zien?', a: 'Alleen jij, tenzij je een album deelt met iemand uit je familiekring. Delen geeft nooit toegang tot je documentenkluis.' },
  { q: 'Wat gebeurt er met mijn archief als ik er niet meer ben?', a: 'In het concept leg je bewaarwensen vast en kies je contactpersonen. Hoe verificatie en overdracht werken, wordt nog onderzocht. Dit is geen juridische regeling.' },
  { q: 'Gaan mijn foto\'s automatisch naar het nationaal archief?', a: 'Nooit. Je kunt vrijwillig een foto aanbieden. Een archivaris beslist, en je origineel blijft privé.' },
  { q: 'Is mijn data in deze demo veilig opgeslagen?', a: 'Deze demo slaat niets op een server op. Alles wat je doet blijft alleen in je eigen browser en is fictief.' },
]

export function Hulp() {
  const ui = useUI()
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Hulp" title="Hoe kunnen we helpen?" sub="Antwoorden op veelgestelde vragen over het concept en deze demo." />
      <div className="card p-5 mb-3 flex flex-wrap items-center gap-4 bg-ink text-white border-ink"><div className="flex-1 min-w-[200px]"><div className="font-semibold">Alles automatisch zien</div><div className="text-sm text-white/70">De demo speelt zichzelf af in ongeveer anderhalve minuut</div></div><AutoPlayButton className="btn-white btn-sm h-10" /></div>
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <button onClick={() => ui.open({ type: 'tourIntro' })} className="card p-5 text-left hover:shadow-lift"><ArrowRight className="text-brand" /><div className="font-semibold mt-2">Rondleiding</div><div className="text-sm text-meta">8 stappen, ±8 minuten</div></button>
        <button onClick={() => ui.open({ type: 'wow' })} className="card p-5 text-left hover:shadow-lift"><ArrowRight className="text-magenta" /><div className="font-semibold mt-2">Ontdek de mogelijkheden</div><div className="text-sm text-meta">Vijf korte ervaringen</div></button>
        <button onClick={() => ui.open({ type: 'about' })} className="card p-5 text-left hover:shadow-lift"><Info className="text-brand" /><div className="font-semibold mt-2">Over deze demo</div><div className="text-sm text-meta">Wat is echt, wat niet</div></button>
      </div>
      <div className="card divide-y divide-line">
        {FAQ.map((f, i) => (
          <div key={f.q}>
            <button className="w-full flex items-center gap-3 p-5 text-left font-semibold text-[17px]" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{f.q}<ChevronDown size={20} className={cx('ml-auto shrink-0 transition-transform', open === i && 'rotate-180')} /></button>
            {open === i && <p className="px-5 pb-5 -mt-1 text-[15px] text-ink/80 leading-relaxed animate-fadeIn">{f.a}</p>}
          </div>
        ))}
      </div>
      <div className="card p-6 mt-6 flex flex-wrap items-center gap-4"><Mail className="text-brand" /><div className="flex-1"><div className="font-semibold">Contact met de klantenservice</div><div className="text-sm text-meta">In deze conceptdemo is er geen echte klantenservice.</div></div><button className="btn-secondary btn-sm" onClick={() => ui.open({ type: 'unavailable', title: 'Contact', text: 'Deze conceptdemo heeft geen echte klantenservice. In de dienst zou je hier een vraag kunnen stellen aan een medewerker van Beeld & Geluid.' })}>Stel een vraag</button></div>
      <DemoNote className="mt-6">Interactieve demo · fictieve gegevens.</DemoNote>
    </div>
  )
}

export function NotFound() {
  return <EmptyState icon={<SearchIcon size={26} />} title="Deze pagina bestaat niet" text="Misschien klopt de link niet. Ga terug naar je archief." action={<Link to="/voor-jou" className="btn-primary">Naar Voor jou</Link>} />
}
