import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, CalendarDays, Heart, FolderPlus, Share2, Download, Users, Gift, Check, Landmark, PenLine, ArrowRight, Quote, Lock, Mic } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { Avatar, Img, Modal, EmptyState } from '../components/ui'
import { useOpenMedia } from '../components/Media'
import { DemoPlayer } from '../components/Player'
import { cx, fmtDate } from '../lib/format'
import { SOURCE_LABEL } from '../lib/selectors'

export default function FotoDetail() {
  const { id = '' } = useParams()
  const { state, toggleFavorite, toast, keepStoryFor } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const open = useOpenMedia()
  const [famOpen, setFamOpen] = useState(false)
  const [keepOpen, setKeepOpen] = useState(false)
  const m = state.media.find((x) => x.id === id)
  if (!m) return <EmptyState icon={<Landmark size={26} />} title="Deze herinnering bestaat niet (meer)" text="Misschien is de demo opnieuw gestart." action={<Link to="/fotos" className="btn-primary">Naar foto's</Link>} />
  const story = m.storyId ? state.stories.find((s) => s.id === m.storyId) : undefined
  const narrator = story && state.people.find((p) => p.id === story.narratorId)
  const people = (story?.peopleIds ?? m.peopleIds).map((pid) => state.people.find((p) => p.id === pid)).filter(Boolean)
  const linked = (story?.linkedMediaIds ?? []).map((i) => state.media.find((x) => x.id === i)).filter(Boolean)
  const albums = state.albums.filter((a) => a.mediaIds.includes(m.id))
  const year = m.dateTaken.slice(0, 4)
  const chain = ['nel', 'pieter', 'sanne', 'mila'].map((pid) => state.people.find((p) => p.id === pid)!)
  const kept = story?.keepFor?.includes('mila')
  const sameYear = state.media.filter((x) => x.dateTaken.startsWith(year) && x.id !== m.id).slice(0, 6)
  const sharedWith = Array.from(new Set(albums.flatMap((a) => a.sharedWith)))
  const family = state.viewAs !== 'sanne'

  return (
    <div>
      <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/fotos'))} className="btn-ghost btn-sm -ml-3 mb-4"><ArrowLeft size={17} /> Terug</button>
      <div className="grid xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
        <div className="xl:sticky xl:top-[96px]">
          {m.kind === 'photo' ? (
            <button onClick={() => open(m.id, [m.id, ...linked.map((x) => x!.id)])} className="block w-full rounded-3xl overflow-hidden tile-focus bg-[#efe9dd] p-3 sm:p-5 shadow-card" aria-label="Open foto groot in de lichtbak">
              <Img src={m.src} alt={m.alt} eager era={m.era} grain className="rounded-xl aspect-[4/3] shadow-[0_10px_30px_rgba(40,25,5,.25)]" imgClassName={m.era === 'bw' ? '' : ''} />
            </button>
          ) : (
            <div className="aspect-video"><DemoPlayer m={m} /></div>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {!family && <>
              <button onClick={() => { toggleFavorite(m.id); toast({ text: m.favorite ? 'Verwijderd uit Favorieten' : 'Toegevoegd aan Favorieten' }) }} className={cx('btn-secondary btn-sm h-10', m.favorite && 'text-magenta border-magenta/30')} aria-pressed={m.favorite}><Heart size={17} fill={m.favorite ? 'currentColor' : 'none'} /> {m.favorite ? 'Favoriet' : 'Favoriet maken'}</button>
              <button onClick={() => ui.open({ type: 'addToAlbum', mediaIds: [m.id] })} className="btn-secondary btn-sm h-10"><FolderPlus size={17} /> Aan album</button>
              <button onClick={() => ui.open({ type: 'shareMedia', mediaId: m.id })} className="btn-secondary btn-sm h-10"><Share2 size={17} /> Delen</button>
              <button onClick={() => ui.open({ type: 'download', mediaId: m.id })} className="btn-secondary btn-sm h-10"><Download size={17} /> Downloaden</button>
            </>}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-meta">
            <span className="flex items-center gap-1.5"><CalendarDays size={15} /> {fmtDate(m.dateTaken)}</span>
            <span className="flex items-center gap-1.5"><MapPin size={15} /> {m.location}</span>
            <span className="flex items-center gap-1.5">{m.sourceId === 'scan' ? 'Gedigitaliseerd van analoog' : `Uit ${SOURCE_LABEL[m.sourceId]}`}</span>
            <span className="flex items-center gap-1.5">{sharedWith.length ? <><Users size={15} /> Gedeeld met {sharedWith.map((x) => state.people.find((p) => p.id === x)?.name).join(', ')}</> : <><Lock size={15} /> Alleen ik</>}</span>
          </div>
        </div>

        <article data-tour="story">
          <div className="eyebrow">{story ? 'Het verhaal achter de foto' : 'Herinnering'}</div>
          <h1 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.05] tracking-[-0.02em] mt-2">{story ? story.title : m.title}</h1>
          {story && narrator && (
            <div className="flex items-center gap-3 mt-4">
              <Avatar person={narrator} size={44} />
              <div><div className="font-semibold">Verteld door {narrator.name}</div><div className="text-sm text-meta">{m.title} · opgeschreven op {fmtDate(story.writtenOn)}</div></div>
            </div>
          )}
          {story ? (
            <>
              {story.quote && <p className="mt-6 font-display text-[22px] leading-snug text-brand flex gap-2"><Quote size={22} className="text-magenta shrink-0 mt-1" />{story.quote}</p>}
              <div className="story-body mt-6">{story.body.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}</div>
              <Link to={`/verhalen/${story.id}`} className="link inline-flex items-center gap-1">Lees het hele verhaal <ArrowRight size={16} /></Link>
              {story.audioId && <div className="mt-3 inline-flex items-center gap-2 pill bg-brand-light text-brand h-8 px-3"><Mic size={14} /> Met audioverhaal</div>}
            </>
          ) : (
            <>
              <p className="mt-4 text-[17px] leading-relaxed text-ink/85">{m.description}</p>
              {!family && (
                <div className="mt-6 rounded-2xl border-2 border-dashed border-line p-6 text-center">
                  <PenLine className="mx-auto text-brand" />
                  <p className="font-semibold mt-2">Er is nog geen verhaal bij deze foto</p>
                  <p className="text-meta text-[15px]">Wat gebeurde er? Over twintig jaar weet niemand het nog, tenzij jij het opschrijft.</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4"><button className="btn-primary" onClick={() => ui.open({ type: 'story', mediaId: m.id })}><PenLine size={17} /> Vertel het verhaal</button><button className="btn-secondary" onClick={() => ui.open({ type: 'story', mediaId: m.id, audio: true })}><Mic size={17} /> Spreek het in</button></div>
                </div>
              )}
            </>
          )}

          {story && m.id === 'm-1988-kitchen' && (
            <section className="mt-8 card p-5">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-meta mb-4">Vier generaties, één recept</h2>
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                {chain.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Link to={`/zoeken?q=${encodeURIComponent(p.name.replace('Oma ', ''))}`} className="flex flex-col items-center gap-1.5 group">
                      <Avatar person={p} size={56} />
                      <span className="text-sm font-semibold group-hover:text-brand">{p.name}</span>
                      <span className="text-xs text-meta -mt-1">{p.born}{p.died ? `–${p.died}` : ''}</span>
                    </Link>
                    {i < chain.length - 1 && <ArrowRight size={18} className="text-magenta mx-1 sm:mx-2" aria-hidden />}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6 grid sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border border-line p-4"><div className="text-xs font-semibold uppercase tracking-wider text-meta mb-1">Locatie</div><div className="flex items-center gap-2 font-semibold"><MapPin size={16} className="text-brand" /> {story?.context?.split(' · ')[0] ?? m.location}</div></div>
            <div className="rounded-2xl bg-white border border-line p-4"><div className="text-xs font-semibold uppercase tracking-wider text-meta mb-1">Wie horen erbij</div><div className="flex -space-x-2">{people.map((p) => <Avatar key={p!.id} person={p} size={30} ring />)}</div></div>
          </section>

          {linked.length > 0 && (
            <section className="mt-6">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-meta mb-3">Gekoppelde herinneringen</h2>
              <div className="grid grid-cols-3 gap-2">
                {linked.map((x) => (
                  <button key={x!.id} onClick={() => navigate(`/foto/${x!.id}`)} className="group text-left">
                    <Img src={x!.thumb} alt={x!.alt} era={x!.era} grain className="aspect-square rounded-xl" imgClassName="group-hover:scale-105 transition-transform duration-500" />
                    <span className="block text-[13px] font-medium mt-1.5 leading-tight line-clamp-2">{x!.title}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => setFamOpen(true)}><Users size={18} /> Ontdek wie erbij horen</button>
            <Link className="btn-secondary" to={`/fotos?jaar=${year}`}><CalendarDays size={18} /> Bekijk meer uit {year}</Link>
            {story && !family && (kept ? (
              <Link to="/nalatenschap" className="btn btn bg-[#E7F6EE] text-[#1E6B43] hover:bg-[#d9f0e3]"><Check size={18} /> Bewaard voor Mila</Link>
            ) : (
              <button className="btn-magenta" onClick={() => setKeepOpen(true)}><Gift size={18} /> Bewaar dit verhaal voor Mila</button>
            ))}
          </div>
          {albums.length > 0 && <p className="text-sm text-meta mt-4">In albums: {albums.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link to={`/albums/${a.id}`} className="link font-medium">{a.title}</Link></span>)}</p>}
        </article>
      </div>

      {sameYear.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between mb-4"><h2 className="font-display text-2xl font-bold">Meer uit {year}</h2><Link to={`/fotos?jaar=${year}`} className="link inline-flex items-center gap-1">Alles uit {year} <ArrowRight size={16} /></Link></div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {sameYear.map((x) => <button key={x.id} onClick={() => open(x.id, sameYear.map((y) => y.id))} className="group" aria-label={x.title}><Img src={x.thumb} alt={x.alt} era={x.era} grain className="aspect-square rounded-xl" imgClassName="group-hover:scale-105 transition-transform duration-500" /></button>)}
          </div>
        </section>
      )}

      <Modal open={famOpen} onClose={() => setFamOpen(false)} title="Wie horen bij deze herinnering" subtitle={story ? 'De familieverbinding achter dit verhaal' : m.title} size="md"
        footer={<><Link to="/familie" className="btn-secondary" onClick={() => setFamOpen(false)}>Naar familiekring</Link><button className="btn-primary" onClick={() => setFamOpen(false)}>Sluiten</button></>}>
        <ul className="space-y-3">
          {people.map((p) => (
            <li key={p!.id} className="flex items-start gap-4 p-3 rounded-2xl bg-paper">
              <Avatar person={p} size={56} />
              <div className="flex-1">
                <div className="font-semibold">{p!.fullName} <span className="text-meta font-normal">· {p!.relationLabel}{p!.id === 'sanne' ? '' : ' van Sanne'}</span></div>
                <div className="text-sm text-meta">{p!.born}{p!.died ? ` – ${p!.died}` : ''}</div>
                <p className="text-[15px] text-ink/80 mt-1 leading-relaxed">{p!.bio}</p>
                <Link to={`/fotos?persoon=${p!.id}`} onClick={() => setFamOpen(false)} className="link text-sm mt-1 inline-block">{state.media.filter((x) => x.peopleIds.includes(p!.id)).length} herinneringen met {p!.name}</Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-meta mt-3">Personen zijn door Sanne zelf aangegeven. Er wordt geen gezichtsherkenning gebruikt.</p>
      </Modal>

      {story && (
        <Modal open={keepOpen} onClose={() => setKeepOpen(false)} title="Bewaar dit verhaal voor Mila" subtitle="Het verhaal komt in je bewaarwensen voor Mila. Je kunt dit altijd aanpassen." size="sm"
          footer={<><button className="btn-secondary" onClick={() => setKeepOpen(false)}>Annuleren</button><button className="btn-magenta" data-autofocus onClick={() => { keepStoryFor(story.id, 'mila'); setKeepOpen(false); toast({ text: '“' + story.title + '” is bewaard voor Mila', action: { label: 'Bekijk wensen', to: '/nalatenschap' } }) }}><Gift size={18} /> Bewaren voor Mila</button></>}>
          <div className="flex items-center gap-3 rounded-2xl bg-paper p-3">
            <Img src={m.thumb} alt="" era={m.era} className="h-16 w-16 rounded-xl" />
            <div><div className="font-semibold leading-snug">{story.title}</div><div className="text-sm text-meta">met {linked.length + 1} foto's</div></div>
          </div>
          <p className="text-sm text-meta mt-4">Mila ziet dit nu nog niet. Het wordt onderdeel van wat later naar haar mag gaan, volgens jouw wensen. Dit is een ontwerpconcept: er vindt geen echte overdracht plaats.</p>
        </Modal>
      )}
    </div>
  )
}
