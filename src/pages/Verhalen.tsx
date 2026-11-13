import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PenLine, Mic, ArrowLeft, Quote, MapPin, CalendarDays, Tv, Gift, Check, BookOpenText, ArrowRight, Users, Pencil, Play } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { Avatar, AvatarStack, EmptyState, Img, PageHeader, Modal } from '../components/ui'
import { useOpenMedia } from '../components/Media'
import { DemoPlayer } from '../components/Player'
import { cx, fmtDate } from '../lib/format'
import { visibleAlbums } from '../lib/selectors'
import { fragments } from '../data/schatkamer'

export function VerhalenPage() {
  const { state } = useDemo()
  const ui = useUI()
  const [who, setWho] = useState('')
  const family = state.viewAs !== 'sanne'
  const allowed = family ? state.stories.filter((s) => s.albumIds.some((id) => visibleAlbums(state).some((a) => a.id === id))) : state.stories
  const list = allowed.filter((s) => !who || s.narratorId === who).sort((a, b) => (b.createdByDemo ? 1 : 0) - (a.createdByDemo ? 1 : 0) || (b.id === 's-nel-appeltaart' ? 1 : 0) - (a.id === 's-nel-appeltaart' ? 1 : 0) || a.date.localeCompare(b.date))
  const narrators = Array.from(new Set(allowed.map((s) => s.narratorId)))
  const [first, ...rest] = list
  const audio = state.media.filter((m) => m.kind === 'audio')
  return (
    <div>
      <PageHeader eyebrow="Ontdekken" title="Verhalen" sub="Het familieboek van Sanne. Geschreven en ingesproken door vier generaties."
        actions={!family && <><button className="btn-secondary" onClick={() => ui.open({ type: 'story', audio: true })}><Mic size={18} /> Audioverhaal</button><button className="btn-primary" onClick={() => ui.open({ type: 'story' })}><PenLine size={18} /> Vertel een verhaal</button></>} />
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter op verteller">
        <button className={who ? 'chip-off' : 'chip-on'} onClick={() => setWho('')} aria-pressed={!who}>Alle vertellers</button>
        {narrators.map((n) => { const p = state.people.find((x) => x.id === n); return <button key={n} className={who === n ? 'chip-on' : 'chip-off'} onClick={() => setWho(who === n ? '' : n)} aria-pressed={who === n}><Avatar person={p} size={22} /> {p?.name}</button> })}
      </div>
      {!first ? <EmptyState icon={<BookOpenText size={26} />} title="Nog geen verhalen" text="Hier verschijnen de verhalen bij jullie foto's." /> : (
        <>
          <FeaturedStory id={first.id} />
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            {rest.map((s) => <StoryCard key={s.id} id={s.id} />)}
          </div>
        </>
      )}
      {!family && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold mb-1">Ingesproken herinneringen</h2>
          <p className="text-meta mb-5">Stemmen die je niet kwijt wilt. Voorbeeldweergave met transcript.</p>
          <div className="grid md:grid-cols-3 gap-4">{audio.map((m) => <AudioCard key={m.id} id={m.id} />)}</div>
        </section>
      )}
    </div>
  )
}

function AudioCard({ id }: { id: string }) {
  const { state } = useDemo()
  const [open, setOpen] = useState(false)
  const m = state.media.find((x) => x.id === id)!
  const p = state.people.find((x) => x.id === m.peopleIds[0])
  return (
    <>
      <button onClick={() => setOpen(true)} className="card p-5 text-left hover:shadow-lift transition-shadow group">
        <div className="flex items-center gap-3"><Avatar person={p} size={44} /><div className="flex-1"><div className="font-semibold leading-tight">{m.title}</div><div className="text-sm text-meta">{fmtDate(m.dateTaken)}</div></div>
          <span className="h-11 w-11 rounded-full bg-brand text-white flex items-center justify-center group-hover:scale-105 transition-transform"><Play size={18} fill="currentColor" className="ml-0.5" /></span></div>
        <div className="mt-4 text-brand/40"><WaveMini seed={m.id} /></div>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={m.title} subtitle={`${p?.fullName} · ${fmtDate(m.dateTaken)}`} size="lg">
        <div className="h-[300px]"><DemoPlayer m={m} /></div>
        <p className="text-[15px] text-ink/80 mt-4">{m.description}</p>
      </Modal>
    </>
  )
}
function WaveMini({ seed }: { seed: string }) {
  let h = 7; for (const c of seed) h = (h * 33 + c.charCodeAt(0)) >>> 0
  return <svg viewBox="0 0 200 32" className="w-full h-8" aria-hidden>{Array.from({ length: 50 }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const v = 4 + ((h >>> 9) % 24); return <rect key={i} x={i * 4} y={16 - v / 2} width="2.4" height={v} rx="1.2" fill="currentColor" /> })}</svg>
}

function FeaturedStory({ id }: { id: string }) {
  const { state } = useDemo()
  const s = state.stories.find((x) => x.id === id)!
  const m = state.media.find((x) => x.id === s.mediaId)
  const n = state.people.find((p) => p.id === s.narratorId)
  return (
    <Link to={`/verhalen/${s.id}`} className="group grid md:grid-cols-[1.2fr_1fr] rounded-3xl overflow-hidden bg-white border border-line shadow-card hover:shadow-lift transition-shadow">
      <Img src={m?.src ?? ''} alt={m?.alt ?? ''} era={m?.era} grain eager className="h-[260px] md:h-[400px]" imgClassName="group-hover:scale-[1.02] transition-transform duration-700" />
      <div className="p-7 sm:p-10 flex flex-col">
        <div className="eyebrow">{s.createdByDemo ? 'Net toegevoegd' : 'Uitgelicht verhaal'}</div>
        <h2 className="font-display text-[28px] sm:text-[34px] font-bold leading-[1.08] mt-2 group-hover:text-brand transition-colors">{s.title}</h2>
        <p className="text-[17px] text-ink/75 mt-3 leading-relaxed line-clamp-4">{s.intro}</p>
        <div className="mt-auto pt-6 flex items-center gap-3"><Avatar person={n} size={40} /><div><div className="font-semibold text-[15px]">Verteld door {n?.name}</div><div className="text-sm text-meta">{fmtDate(s.date)}</div></div></div>
      </div>
    </Link>
  )
}

export function StoryCard({ id }: { id: string }) {
  const { state } = useDemo()
  const s = state.stories.find((x) => x.id === id)!
  const m = state.media.find((x) => x.id === s.mediaId)
  const n = state.people.find((p) => p.id === s.narratorId)
  return (
    <Link to={`/verhalen/${s.id}`} className="group card overflow-hidden flex flex-col hover:shadow-lift transition-shadow">
      <div className="relative"><Img src={m?.thumb ?? ''} alt={m?.alt ?? ''} era={m?.era} grain className="h-[220px]" imgClassName="group-hover:scale-[1.03] transition-transform duration-700" />
        {s.createdByDemo && <span className="absolute top-3 left-3 pill bg-magenta text-white">Nieuw</span>}
        {s.audioId && <span className="absolute top-3 right-3 pill bg-white text-brand"><Mic size={11} /> Audio</span>}</div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-[20px] font-bold leading-snug group-hover:text-brand transition-colors">{s.title}</h3>
        <p className="text-[15px] text-meta mt-1.5 line-clamp-2">{s.intro}</p>
        <div className="mt-auto pt-4 flex items-center gap-2.5 text-sm"><Avatar person={n} size={28} /><span className="font-semibold">{n?.name}</span><span className="text-meta">· {s.date.slice(0, 4)}</span></div>
      </div>
    </Link>
  )
}

export function VerhaalDetail() {
  const { id = '' } = useParams()
  const { state, detachSchatkamerReference, keepStoryFor, toast } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const open = useOpenMedia()
  const [keep, setKeep] = useState(false)
  const s = state.stories.find((x) => x.id === id)
  if (!s) return <EmptyState icon={<BookOpenText size={26} />} title="Verhaal niet gevonden" text="Dit verhaal bestaat niet (meer). Misschien is de demo opnieuw gestart." action={<Link to="/verhalen" className="btn-primary">Naar verhalen</Link>} />
  const m = state.media.find((x) => x.id === s.mediaId)
  const n = state.people.find((p) => p.id === s.narratorId)
  const people = s.peopleIds.map((pid) => state.people.find((p) => p.id === pid))
  const linked = s.linkedMediaIds.map((x) => state.media.find((y) => y.id === x)).filter(Boolean)
  const albums = state.albums.filter((a) => s.albumIds.includes(a.id) || (m && a.mediaIds.includes(m.id)))
  const frags = s.schatkamerIds.map((f) => fragments.find((x) => x.id === f)).filter(Boolean)
  const others = state.stories.filter((x) => x.id !== s.id).slice(0, 3)
  const family = state.viewAs !== 'sanne'
  const kept = s.keepFor?.includes('mila')
  return (
    <article>
      <button onClick={() => navigate('/verhalen')} className="btn-ghost btn-sm -ml-3 mb-4"><ArrowLeft size={17} /> Verhalen</button>
      <header className="max-w-3xl mx-auto text-center">
        <div className="eyebrow">{s.context?.split(' · ')[0] ?? 'Verhaal'}</div>
        <h1 className="font-display text-[36px] sm:text-[54px] font-bold leading-[1.03] tracking-[-0.025em] mt-3">{s.title}</h1>
        <p className="text-[19px] sm:text-[21px] text-ink/70 mt-4 leading-relaxed">{s.intro}</p>
        <div className="flex items-center justify-center gap-3 mt-6"><Avatar person={n} size={48} /><div className="text-left"><div className="font-semibold">Verteld door {n?.fullName}</div><div className="text-sm text-meta">{n?.relationLabel === 'Jij' ? 'Jij' : n?.relationLabel} · opgeschreven op {fmtDate(s.writtenOn)}</div></div></div>
      </header>

      {m && (
        <figure className="mt-10 max-w-5xl mx-auto">
          <button onClick={() => open(m.id, [m.id, ...linked.map((x) => x!.id)])} className="block w-full rounded-3xl overflow-hidden tile-focus" aria-label="Open foto groot">
            <Img src={m.src} alt={m.alt} eager era={m.era} grain className="aspect-[16/10]" />
          </button>
          <figcaption className="text-sm text-meta mt-3 text-center">{m.title} · {s.context ?? fmtDate(m.dateTaken)}</figcaption>
        </figure>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-10 max-w-5xl mx-auto mt-12">
        <div>
          {s.quote && <blockquote className="font-display text-[26px] leading-snug text-brand border-l-4 border-magenta pl-5 mb-8 flex gap-3"><Quote size={24} className="text-magenta shrink-0 mt-1 hidden" />{s.quote}</blockquote>}
          {s.audioId && (
            <div className="mb-8 rounded-2xl bg-ink text-white p-5 flex items-center gap-4">
              <span className="h-12 w-12 rounded-full bg-magenta flex items-center justify-center shrink-0"><Mic size={22} /></span>
              <div className="flex-1"><div className="font-semibold">Audioverhaal bij dit verhaal</div><div className="text-sm text-white/70">Gesimuleerde opname uit deze demo · er is geen geluid opgeslagen</div></div>
            </div>
          )}
          <div className="story-body">{s.body.map((p, i) => <p key={i}>{p}</p>)}</div>

          {frags.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2"><Tv size={20} className="text-magenta" /> Uit De Schatkamer</h2>
              {frags.map((f) => (
                <div key={f!.id} className="card flex overflow-hidden mb-3">
                  <Img src={f!.still} alt="" className="w-32 sm:w-44 shrink-0 bw" />
                  <div className="p-4 flex-1">
                    <span className="pill bg-[#FFF3D6] text-[#6B4A00]">Conceptfragment</span>
                    <div className="font-semibold mt-1.5">{f!.title}</div><div className="text-sm text-meta">{f!.program} · {f!.year}</div>
                    <div className="flex gap-3 mt-2"><Link to={`/schatkamer?f=${f!.id}`} className="link text-sm">Bekijk detail</Link>{!family && <button className="text-sm text-meta hover:text-ink" onClick={() => { detachSchatkamerReference(s.id, f!.id); toast({ text: 'Verwijzing losgekoppeld' }) }}>Loskoppelen</button>}</div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-meta">Verwijzing naar een fictief fragment. Beschikbaarheid hangt af van rechten en technische haalbaarheid.</p>
            </section>
          )}

          {linked.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-bold mb-3">Foto's bij dit verhaal</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {linked.map((x) => <button key={x!.id} onClick={() => open(x!.id, linked.map((y) => y!.id))} className="group text-left"><Img src={x!.thumb} alt={x!.alt} era={x!.era} grain className="aspect-[4/3] rounded-xl" imgClassName="group-hover:scale-105 transition-transform duration-500" /><span className="block text-sm mt-1.5 font-medium leading-tight">{x!.title}</span></button>)}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[96px] h-fit">
          <div className="card p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-meta mb-3">Over dit verhaal</div>
            <div className="space-y-2 text-[15px]">
              <div className="flex gap-2"><CalendarDays size={16} className="text-brand mt-0.5" /> {fmtDate(s.date)}</div>
              {m && <div className="flex gap-2"><MapPin size={16} className="text-brand mt-0.5" /> {m.location}</div>}
              <div className="flex gap-2 items-center"><Users size={16} className="text-brand" /> <AvatarStack people={people} size={26} max={5} /></div>
            </div>
            {albums.length > 0 && <div className="mt-4 pt-4 border-t border-line text-sm"><div className="text-meta mb-1">In albums</div>{albums.map((a) => <Link key={a.id} to={`/albums/${a.id}`} className="block link">{a.title}</Link>)}</div>}
          </div>
          {!family && (
            <div className="card p-5 space-y-2">
              {kept ? <Link to="/nalatenschap" className="btn w-full bg-[#E7F6EE] text-[#1E6B43]"><Check size={17} /> Bewaard voor Mila</Link>
                : <button className="btn-magenta w-full" onClick={() => setKeep(true)}><Gift size={17} /> Bewaar voor Mila</button>}
              <Link to={`/schatkamer?verhaal=${s.id}`} className="btn-secondary w-full"><Tv size={17} /> Koppel tv-moment</Link>
              <button className="btn-secondary w-full" onClick={() => ui.open({ type: 'unavailable', title: 'Verhaal bewerken', text: 'Bewerken van bestaande verhalen is in deze conceptdemo nog niet beschikbaar. Je kunt wel een nieuw verhaal toevoegen bij een foto.' })}><Pencil size={17} /> Bewerken</button>
            </div>
          )}
        </aside>
      </div>

      <section className="max-w-5xl mx-auto mt-16">
        <div className="flex items-end justify-between mb-4"><h2 className="font-display text-2xl font-bold">Meer verhalen</h2><Link to="/verhalen" className="link inline-flex items-center gap-1">Alle verhalen <ArrowRight size={16} /></Link></div>
        <div className="grid sm:grid-cols-3 gap-4">{others.map((o) => <StoryCard key={o.id} id={o.id} />)}</div>
      </section>

      <Modal open={keep} onClose={() => setKeep(false)} title="Bewaar dit verhaal voor Mila" size="sm" subtitle="Komt in je bewaarwensen. Mila ziet het nu nog niet."
        footer={<><button className="btn-secondary" onClick={() => setKeep(false)}>Annuleren</button><button className="btn-magenta" onClick={() => { keepStoryFor(s.id, 'mila'); setKeep(false); toast({ text: 'Bewaard voor Mila', action: { label: 'Bekijk wensen', to: '/nalatenschap' } }) }}><Gift size={17} /> Bewaren</button></>}>
        <p className="text-sm text-meta">Ontwerpconcept: er vindt geen echte overdracht plaats.</p>
      </Modal>
    </article>
  )
}
void cx
