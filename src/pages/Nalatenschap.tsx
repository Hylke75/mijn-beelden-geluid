import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { HeartHandshake, Lock, ShieldQuestion, Gift, Pencil, Eye, Plus, Trash2, UserRound, FileText, BookImage, Check, ArrowRight, X, Mail, Info } from 'lucide-react'
import { useDemo } from '../demo/store'
import { Avatar, DemoNote, Img, Modal, PageHeader, Checkbox } from '../components/ui'
import type { DemoLegacyWish } from '../data/types'
import { cx, fmtDate } from '../lib/format'

export default function Nalatenschap() {
  const { state, setLegacyContacts, removeLegacyWish, setAlbumRecipients, toast } = useDemo()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [edit, setEdit] = useState<Partial<DemoLegacyWish> | null>(null)
  const [contacts, setContacts] = useState(false)
  const [albumEdit, setAlbumEdit] = useState<string | null>(null)
  const highlight = params.get('nieuw')
  const P = (id: string) => state.people.find((p) => p.id === id)
  const L = state.legacy
  useEffect(() => {
    if (params.get('wens') === 'mila') {
      setEdit({ recipientId: 'mila', title: 'Voor Mila', text: 'Mijn favoriete foto\'s en het verhaal van oma Nel mogen later naar Mila.', mediaIds: state.media.filter((m) => m.favorite).slice(0, 6).map((m) => m.id), storyIds: ['s-nel-appeltaart', 's-nel-recept'], albumIds: ['al-oma-nel'] })
      const n = new URLSearchParams(params); n.delete('wens'); setParams(n, { replace: true })
    }
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps
  const keptStories = state.stories.filter((s) => s.keepFor?.length)
  const heirs = state.people.filter((p) => p.id !== 'sanne' && p.id !== 'nel')

  return (
    <div>
      <PageHeader eyebrow="Samen & later" title="Later doorgeven" sub="Bepaal wie jouw herinneringen later mag ontvangen. Rustig, persoonlijk en altijd aan te passen." />

      <section data-tour="legacy" className="rounded-3xl bg-[linear-gradient(135deg,#FDF2F8,#F2F4FC)] border border-[#F3D9EA] p-6 sm:p-8 mb-8">
        <h2 className="font-display text-xl font-bold mb-5">Zo werkt het (concept)</h2>
        <ol className="grid md:grid-cols-3 gap-3 md:gap-0 items-stretch">
          {[
            { i: Lock, t: 'Nu privé', s: 'Alles blijft van jou. Niemand ziet je wensen of je kluis.' },
            { i: ShieldQuestion, t: 'Op een later moment, na verificatie', s: 'Hoe die verificatie werkt is nog een concept en wordt onderzocht.', concept: true },
            { i: Gift, t: 'Toegang volgens jouw wensen', s: 'Ontvangers krijgen alleen wat jij voor hen hebt bedoeld.' },
          ].map((x, k) => (
            <li key={x.t} className="relative flex md:flex-col gap-3 md:gap-2 md:px-5 first:md:pl-0">
              <span className="h-12 w-12 rounded-2xl bg-white shadow-card flex items-center justify-center text-magenta shrink-0"><x.i size={22} /></span>
              <div><div className="font-semibold flex items-center gap-2 flex-wrap">{x.t}{x.concept && <span className="pill bg-[#FFF3D6] text-[#6B4A00]">Concept</span>}</div><p className="text-[15px] text-ink/70 mt-0.5">{x.s}</p></div>
              {k < 2 && <ArrowRight className="hidden md:block absolute right-0 top-3 text-magenta/50 translate-x-1/2" size={22} />}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold flex items-center gap-2"><UserRound size={19} className="text-brand" /> Mijn contactpersoon</h2><button className="btn-secondary btn-sm" onClick={() => setContacts(true)}><Pencil size={15} /> Wijzigen</button></div>
          {[{ l: 'Primaire contactpersoon', p: P(L.primaryContactId) }, { l: 'Tweede contactpersoon', p: P(L.secondaryContactId) }].map((x) => (
            <div key={x.l} className="flex items-center gap-3 py-3 border-t border-line first:border-0"><Avatar person={x.p} size={48} /><div><div className="text-sm text-meta">{x.l}</div><div className="font-semibold">{x.p?.fullName}</div><div className="text-sm text-meta">{x.p?.relationLabel}</div></div></div>
          ))}
          <p className="text-sm text-meta mt-2">Contactpersonen kunnen later een verzoek indienen. Ze krijgen nu niets te zien.</p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4"><BookImage size={19} className="text-brand" /> Wie krijgt mijn albums?</h2>
          <ul className="divide-y divide-line">
            {state.albums.slice(0, 6).map((a) => { const r = L.albumRecipients.find((x) => x.albumId === a.id); return (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <span className="flex-1 font-medium text-[15px]">{a.title}</span>
                {r ? <span className="flex -space-x-2">{r.personIds.map((pid) => <Avatar key={pid} person={P(pid)} size={28} ring />)}</span> : <span className="text-sm text-meta">Nog niet bepaald</span>}
                <button className="btn-ghost h-9 w-9 p-0 rounded-full" onClick={() => setAlbumEdit(a.id)} aria-label={`Ontvangers van ${a.title} wijzigen`}><Pencil size={15} /></button>
              </li>) })}
          </ul>
        </section>
      </div>

      <section className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold flex items-center gap-2"><FileText size={19} className="text-brand" /> Wie krijgt toegang tot documenten?</h2><Link to="/kluis" className="link text-sm">Naar de kluis</Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {L.documentRecipients.map((r) => { const d = state.documents.find((x) => x.id === r.documentId); return d && (
            <div key={r.documentId} className="flex items-center gap-3 rounded-xl bg-paper p-3"><FileText size={18} className="text-meta" /><span className="flex-1 text-[15px] font-medium leading-tight">{d.title}</span><Avatar person={P(r.personId)} size={28} /></div>) })}
        </div>
        <p className="text-sm text-meta mt-3">Een voorkeur, nooit een automatische autorisatie. Regel per document wie het later mag ontvangen.</p>
      </section>

      <section className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div><h2 className="font-display text-2xl font-bold">Bewaarwensen</h2><p className="text-meta">Persoonlijke selecties met een boodschap, voor later.</p></div>
          <button className="btn-magenta" onClick={() => setEdit({ recipientId: 'mila', title: '', text: '', mediaIds: [], storyIds: [], albumIds: [] })}><Plus size={18} /> Nieuwe bewaarwens</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {L.wishes.map((w) => { const p = P(w.recipientId); const first = state.media.filter((m) => w.mediaIds.includes(m.id)).slice(0, 4); return (
            <article key={w.id} className={cx('card p-5 transition-shadow', highlight === w.id && 'ring-4 ring-magenta/30 shadow-lift')}>
              <div className="flex items-start gap-3">
                <Avatar person={p} size={48} />
                <div className="flex-1 min-w-0"><div className="text-sm text-meta">Voor {p?.name} · {fmtDate(w.createdOn)}</div><h3 className="font-display text-lg font-bold leading-snug">{w.title}</h3></div>
                {highlight === w.id && <span className="pill bg-magenta text-white">Bijgewerkt</span>}
              </div>
              <p className="text-[15px] text-ink/80 mt-3 italic">“{w.text}”</p>
              <div className="flex gap-1.5 mt-4">{first.map((m) => <Img key={m.id} src={m.thumb} alt="" era={m.era} className="h-14 w-14 rounded-lg" />)}{w.mediaIds.length > 4 && <span className="h-14 w-14 rounded-lg bg-paper flex items-center justify-center text-sm text-meta font-semibold">+{w.mediaIds.length - 4}</span>}</div>
              <p className="text-sm text-meta mt-3">{w.mediaIds.length} foto's · {w.storyIds.length} verhalen · {w.albumIds.length} albums · {w.moment}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button className="btn-primary btn-sm" onClick={() => navigate(`/nalatenschap/voorbeeld?wens=${w.id}`)}><Eye size={15} /> Voorbeeld voor {p?.name}</button>
                <button className="btn-secondary btn-sm" onClick={() => setEdit(w)}><Pencil size={15} /> Aanpassen</button>
                <button className="btn-ghost btn-sm text-meta" onClick={() => { removeLegacyWish(w.id); toast({ text: 'Bewaarwens verwijderd' }) }} aria-label="Bewaarwens verwijderen"><Trash2 size={15} /></button>
              </div>
            </article>) })}
          {!L.wishes.length && <div className="card p-8 text-center md:col-span-2"><Gift className="mx-auto text-magenta" /><p className="font-semibold mt-2">Nog geen bewaarwensen</p><p className="text-meta">Begin met iets kleins: één verhaal voor één persoon.</p></div>}
        </div>
        {keptStories.length > 0 && (
          <div className="mt-5 rounded-2xl bg-paper border border-line p-4">
            <div className="text-sm font-semibold mb-2">Losse verhalen die je hebt bewaard</div>
            <div className="flex flex-wrap gap-2">{keptStories.map((s) => <Link key={s.id} to={`/verhalen/${s.id}`} className="pill h-8 px-3 bg-white border border-line text-ink hover:border-brand">{s.title} → {s.keepFor!.map((x) => P(x)?.name).join(', ')}</Link>)}</div>
          </div>
        )}
      </section>

      <DemoNote>Dit is een ontwerpconcept. Er is geen echte overdracht, identiteitsverificatie of juridische garantie. Een testament regel je bij de notaris.</DemoNote>

      {edit && <WishEditor wish={edit} heirs={heirs.map((h) => h.id)} onClose={() => setEdit(null)} />}
      {contacts && <ContactsModal onClose={() => setContacts(false)} onSave={(a, b) => { setLegacyContacts(a, b); setContacts(false); toast({ text: 'Contactpersonen bijgewerkt' }) }} />}
      {albumEdit && <AlbumHeirs albumId={albumEdit} onClose={() => setAlbumEdit(null)} onSave={(ids) => { setAlbumRecipients(albumEdit, ids); setAlbumEdit(null); toast({ text: 'Ontvangers bijgewerkt' }) }} />}
    </div>
  )
}

function WishEditor({ wish, heirs, onClose }: { wish: Partial<DemoLegacyWish>; heirs: string[]; onClose: () => void }) {
  const { state, updateLegacyWish, toast } = useDemo()
  const navigate = useNavigate()
  const [w, setW] = useState<Partial<DemoLegacyWish>>(wish)
  const favs = state.media.filter((m) => m.favorite || w.mediaIds?.includes(m.id)).filter((m) => m.kind === 'photo')
  const toggleIn = (k: 'mediaIds' | 'storyIds' | 'albumIds', id: string) => setW((x) => ({ ...x, [k]: (x[k] ?? []).includes(id) ? (x[k] ?? []).filter((i) => i !== id) : [...(x[k] ?? []), id] }))
  const valid = w.recipientId && (w.title ?? '').trim() && (w.text ?? '').trim()
  const save = (preview: boolean) => {
    const saved = updateLegacyWish({ ...w, recipientId: w.recipientId!, title: w.title!.trim(), text: w.text!.trim() })
    onClose()
    toast({ text: `Bewaarwens voor ${state.people.find((p) => p.id === saved.recipientId)?.name} opgeslagen` })
    if (preview) navigate(`/nalatenschap/voorbeeld?wens=${saved.id}`)
    else navigate(`/nalatenschap?nieuw=${saved.id}`, { replace: true })
  }
  return (
    <Modal open onClose={onClose} title={wish.id ? 'Bewaarwens aanpassen' : 'Nieuwe bewaarwens'} subtitle="Wat mag later naar wie, en wat wil je erbij zeggen?" size="lg"
      footer={<><button className="btn-secondary" onClick={onClose}>Annuleren</button><button className="btn-secondary" disabled={!valid} onClick={() => save(false)}>Opslaan</button><button className="btn-magenta" disabled={!valid} onClick={() => save(true)}><Eye size={17} /> Opslaan en voorbeeld voor {state.people.find((p) => p.id === w.recipientId)?.name}</button></>}>
      <div className="space-y-5">
        <div>
          <div className="label">Voor wie?</div>
          <div className="flex flex-wrap gap-2">{heirs.map((id) => { const p = state.people.find((x) => x.id === id)!; const on = w.recipientId === id; return <button key={id} onClick={() => setW({ ...w, recipientId: id })} aria-pressed={on} className={cx('inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border text-sm font-medium', on ? 'border-magenta bg-magenta-light text-magenta-dark' : 'border-line')}><Avatar person={p} size={30} />{p.name}</button> })}</div>
        </div>
        <div><label className="label" htmlFor="wt">Titel</label><input id="wt" className="input" data-autofocus value={w.title ?? ''} onChange={(e) => setW({ ...w, title: e.target.value })} placeholder="Bijvoorbeeld: Voor Mila" /></div>
        <div><label className="label" htmlFor="wx">Jouw wens</label><textarea id="wx" rows={3} className="textarea" value={w.text ?? ''} onChange={(e) => setW({ ...w, text: e.target.value })} placeholder="Mijn favoriete foto's en het verhaal van oma Nel mogen later naar Mila." /></div>
        <div><div className="label">Verhalen</div><div className="grid sm:grid-cols-2 gap-2">{state.stories.slice(0, 8).map((s) => <Checkbox key={s.id} checked={(w.storyIds ?? []).includes(s.id)} onChange={() => toggleIn('storyIds', s.id)}>{s.title}</Checkbox>)}</div></div>
        <div><div className="label">Foto's <span className="text-meta font-normal">(je favorieten)</span></div>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">{favs.map((m) => { const on = (w.mediaIds ?? []).includes(m.id); return <button key={m.id} onClick={() => toggleIn('mediaIds', m.id)} aria-pressed={on} aria-label={m.title} className={cx('relative aspect-square rounded-lg overflow-hidden tile-focus', on ? 'ring-4 ring-magenta ring-inset' : 'opacity-60')}><Img src={m.thumb} alt="" era={m.era} className="absolute inset-0" /></button> })}</div>
          {!favs.length && <p className="text-sm text-meta">Markeer foto's als favoriet om ze hier te kiezen.</p>}</div>
        <div><label className="label" htmlFor="wm">Wanneer?</label><select id="wm" className="input" value={w.moment ?? 'Op een later moment, na verificatie (concept)'} onChange={(e) => setW({ ...w, moment: e.target.value })}><option>Op een later moment, na verificatie (concept)</option><option>Op haar/zijn 18e verjaardag (concept)</option><option>Zelf bepalen wanneer</option></select></div>
        <DemoNote>Je wens wordt alleen in deze demo bewaard. Er vindt geen echte overdracht plaats.</DemoNote>
      </div>
    </Modal>
  )
}

function ContactsModal({ onClose, onSave }: { onClose: () => void; onSave: (a: string, b: string) => void }) {
  const { state } = useDemo()
  const [a, setA] = useState(state.legacy.primaryContactId); const [b, setB] = useState(state.legacy.secondaryContactId)
  const opts = state.people.filter((p) => p.member && p.id !== 'sanne' && p.id !== 'mila')
  return (
    <Modal open onClose={onClose} title="Contactpersonen wijzigen" size="sm" footer={<><button className="btn-secondary" onClick={onClose}>Annuleren</button><button className="btn-primary" disabled={a === b} onClick={() => onSave(a, b)}>Opslaan</button></>}>
      <div className="space-y-4">
        <div><label className="label" htmlFor="c1">Primaire contactpersoon</label><select id="c1" className="input" value={a} onChange={(e) => setA(e.target.value)}>{opts.map((p) => <option key={p.id} value={p.id}>{p.fullName} · {p.relationLabel}</option>)}</select></div>
        <div><label className="label" htmlFor="c2">Tweede contactpersoon</label><select id="c2" className="input" value={b} onChange={(e) => setB(e.target.value)}>{opts.map((p) => <option key={p.id} value={p.id}>{p.fullName} · {p.relationLabel}</option>)}</select></div>
        {a === b && <p className="text-sm text-magenta-dark">Kies twee verschillende personen.</p>}
        <p className="text-sm text-meta flex gap-2"><Mail size={15} className="mt-0.5 shrink-0" /> In de echte dienst krijgen zij een bericht. In deze demo wordt niets verstuurd.</p>
      </div>
    </Modal>
  )
}

function AlbumHeirs({ albumId, onClose, onSave }: { albumId: string; onClose: () => void; onSave: (ids: string[]) => void }) {
  const { state } = useDemo()
  const a = state.albums.find((x) => x.id === albumId)!
  const [ids, setIds] = useState(state.legacy.albumRecipients.find((x) => x.albumId === albumId)?.personIds ?? [])
  return (
    <Modal open onClose={onClose} title={`Wie krijgt “${a.title}”?`} size="sm" footer={<><button className="btn-secondary" onClick={onClose}>Annuleren</button><button className="btn-primary" onClick={() => onSave(ids)}>Opslaan</button></>}>
      <div className="space-y-2">{state.people.filter((p) => !['sanne', 'nel'].includes(p.id)).map((p) => <Checkbox key={p.id} checked={ids.includes(p.id)} onChange={(v) => setIds((x) => v ? [...x, p.id] : x.filter((i) => i !== p.id))}>{p.fullName} <span className="text-meta">· {p.relationLabel}</span></Checkbox>)}</div>
    </Modal>
  )
}

export function LegacyPreview() {
  const { state } = useDemo()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const w = state.legacy.wishes.find((x) => x.id === params.get('wens')) ?? state.legacy.wishes[0]
  if (!w) return <div className="text-center py-20"><p>Geen bewaarwens gevonden.</p><Link to="/nalatenschap" className="btn-primary mt-4">Terug</Link></div>
  const p = state.people.find((x) => x.id === w.recipientId)
  const stories = w.storyIds.map((id) => state.stories.find((s) => s.id === id)).filter(Boolean)
  const photos = w.mediaIds.map((id) => state.media.find((m) => m.id === id)).filter(Boolean)
  const close = () => navigate(`/nalatenschap?nieuw=${w.id}`)
  return (
    <div className="fixed inset-0 z-[78] bg-[#F6F1E8] overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Voorbeeld voor ${p?.name}`}>
      <div className="sticky top-0 z-10 bg-[#F6F1E8]/90 backdrop-blur border-b border-[#E7DDCB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <span className="pill bg-[#FFF3D6] text-[#6B4A00] h-7"><Info size={12} /> Zo zou dit er later uit kunnen zien</span>
          <button className="ml-auto btn-secondary btn-sm h-10" onClick={close} autoFocus><X size={17} /> Sluiten</button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <div className="text-center">
          <Avatar person={state.people.find((x) => x.id === 'sanne')} size={72} />
          <p className="mt-4 text-[#8A6F45] font-semibold">Voor {p?.name}, van mama</p>
          <h1 className="font-display text-[34px] sm:text-[46px] font-bold leading-tight mt-1 text-[#2A1F12]">{w.title}</h1>
        </div>
        <div className="mt-10 bg-white rounded-3xl shadow-[0_20px_60px_rgba(80,55,20,.12)] p-7 sm:p-12 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-24 bg-magenta/15 rotate-[-2deg] rounded-sm" aria-hidden />
          <p className="font-display text-[20px] leading-[1.7] text-[#2A1F12] whitespace-pre-line">{state.legacy.letterToMila && w.recipientId === 'mila' ? state.legacy.letterToMila : `Lieve ${p?.name},\n\n${w.text}`}</p>
          <p className="font-display text-[20px] mt-6 text-[#2A1F12]">Liefs, mama</p>
        </div>
        {stories.length > 0 && (
          <section className="mt-12">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#8A6F45] mb-5">Verhalen voor jou</h2>
            <div className="space-y-4">
              {stories.map((s) => { const m = state.media.find((x) => x.id === s!.mediaId); return (
                <div key={s!.id} className="bg-white rounded-2xl overflow-hidden grid sm:grid-cols-[200px_1fr] shadow-card">
                  <Img src={m?.thumb ?? ''} alt={m?.alt ?? ''} era={m?.era} grain className="h-44 sm:h-full" />
                  <div className="p-5"><div className="font-display text-xl font-bold text-[#2A1F12]">{s!.title}</div><p className="text-[15px] text-[#5A4A35] mt-1.5 leading-relaxed line-clamp-3">{s!.intro}</p><div className="text-sm text-[#8A6F45] mt-2">Verteld door {state.people.find((x) => x.id === s!.narratorId)?.name}</div></div>
                </div>) })}
            </div>
          </section>
        )}
        {photos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#8A6F45] mb-5">Foto's die ik je wil geven</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{photos.map((m, i) => <div key={m!.id} className="bg-white p-2 pb-8 shadow-card" style={{ transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1, 0.5][i % 6]}deg)` }}><Img src={m!.thumb} alt={m!.alt} era={m!.era} grain className="aspect-square" /><div className="text-[12px] text-[#5A4A35] mt-2 text-center leading-tight">{m!.title}</div></div>)}</div>
          </section>
        )}
        <div className="mt-14 text-center">
          <p className="text-sm text-[#8A6F45] max-w-md mx-auto">Een ontwerpvoorbeeld. Er is geen echte overdracht of verificatie; {p?.name} ziet dit nu niet.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <button className="btn-primary" onClick={close}><Check size={17} /> Terug naar mijn wensen</button>
            <Link to="/verhalen" className="btn-secondary">Bekijk alle verhalen</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
void HeartHandshake
