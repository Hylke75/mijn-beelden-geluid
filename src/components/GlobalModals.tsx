import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderPlus, Check, Plus, Mic, Square, Users, Eye, ShieldCheck, Download, Link2, Lock, Sparkles, Clock, ArrowRight, RotateCcw, FlaskConical,
  CloudDownload, Smartphone, BookImage, Timer, Landmark, HeartHandshake, BookOpenText, Info, Search,
} from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI, type ModalSpec } from '../demo/ui'
import { Avatar, Checkbox, DemoNote, Img, Modal } from './ui'
import { Waveform } from './Media'
import { cx, fmtDate } from '../lib/format'
import { TOUR } from './Tour'

function PhotoPicker({ selected, onToggle, max, filter }: { selected: string[]; onToggle: (id: string) => void; max?: number; filter?: string }) {
  const { state } = useDemo()
  const [q, setQ] = useState(filter ?? '')
  const items = state.media.filter((m) => m.kind !== 'audio' && !m.importedAt && (!q || `${m.title} ${m.location} ${m.dateTaken}`.toLowerCase().includes(q.toLowerCase())))
  return (
    <div>
      <div className="relative mb-3">
        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-meta" />
        <input className="input pl-10 h-10" placeholder="Zoek in je foto's" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Zoek foto's om te kiezen" />
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {items.map((m) => {
          const on = selected.includes(m.id)
          return (
            <button key={m.id} onClick={() => onToggle(m.id)} disabled={!on && max != null && selected.length >= max}
              className={cx('relative aspect-square rounded-lg overflow-hidden tile-focus', on && 'ring-4 ring-brand ring-inset')} aria-pressed={on} aria-label={m.title}>
              <Img src={m.thumb} alt="" className="absolute inset-0" era={m.era} />
              {on && <span className="absolute top-1 right-1 h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NewAlbumModal({ mediaIds = [] }: { mediaIds?: string[] }) {
  const ui = useUI(); const { createAlbum, toast } = useDemo(); const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [sel, setSel] = useState<string[]>(mediaIds)
  const [cover, setCover] = useState<string | undefined>(mediaIds[0])
  const { state } = useDemo()
  const toggle = (id: string) => setSel((s) => { const n = s.includes(id) ? s.filter((x) => x !== id) : [...s, id]; if (!cover || !n.includes(cover)) setCover(n[0]); return n })
  const submit = () => {
    if (!title.trim()) return
    const a = createAlbum(title.trim(), sel, cover)
    ui.close(); toast({ text: `Album “${a.title}” is gemaakt`, action: { label: 'Bekijk', to: `/albums/${a.id}` } }); navigate(`/albums/${a.id}`)
  }
  return (
    <Modal open onClose={ui.close} title="Nieuw album" subtitle="Geef je album een naam en kies de foto's die erin horen." size="lg"
      footer={<><button className="btn-secondary" onClick={ui.close}>Annuleren</button><button className="btn-primary" disabled={!title.trim()} onClick={submit}><FolderPlus size={18} /> Album maken</button></>}>
      <label className="label" htmlFor="album-title">Naam van het album</label>
      <input id="album-title" data-autofocus className="input" placeholder="Bijvoorbeeld: Familieweekend" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      <div className="flex flex-wrap gap-2 mt-3">
        {['Familieweekend', 'Zondagen bij opa en oma', 'Daans voetbalseizoen', 'Kerst 2026'].map((s) => <button key={s} className="chip-off h-8 text-[13px]" onClick={() => setTitle(s)}>{s}</button>)}
      </div>
      <div className="mt-6 flex items-center justify-between"><span className="label mb-0">Kies foto's</span><span className="text-sm text-meta">{sel.length} gekozen</span></div>
      <div className="mt-2"><PhotoPicker selected={sel} onToggle={toggle} /></div>
      {sel.length > 0 && (
        <div className="mt-5">
          <div className="label">Kies een omslagfoto</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sel.map((id) => { const m = state.media.find((x) => x.id === id)!; return (
              <button key={id} onClick={() => setCover(id)} className={cx('relative h-16 w-20 shrink-0 rounded-lg overflow-hidden', cover === id ? 'ring-4 ring-magenta' : 'opacity-70 hover:opacity-100')} aria-pressed={cover === id} aria-label={`Omslag: ${m.title}`}>
                <Img src={m.thumb} alt="" className="absolute inset-0" />
              </button>) })}
          </div>
        </div>
      )}
    </Modal>
  )
}

function AddToAlbumModal({ mediaIds }: { mediaIds: string[] }) {
  const ui = useUI(); const { state, addMediaToAlbum, createAlbum, toast } = useDemo()
  const [newName, setNewName] = useState('')
  const add = (albumId: string, title: string) => {
    addMediaToAlbum(mediaIds, albumId); ui.close()
    toast({ text: mediaIds.length > 1 ? `${mediaIds.length} foto's toegevoegd aan “${title}”` : `Foto aan album toegevoegd · ${title}`, action: { label: 'Bekijk album', to: `/albums/${albumId}` } })
  }
  return (
    <Modal open onClose={ui.close} title="Toevoegen aan album" subtitle={mediaIds.length > 1 ? `${mediaIds.length} items geselecteerd` : 'Kies een album'}>
      <ul className="space-y-1.5 max-h-[50vh] overflow-y-auto -mx-2 px-2">
        {state.albums.map((a) => {
          const has = mediaIds.every((id) => a.mediaIds.includes(id))
          const cover = state.media.find((m) => m.id === a.coverId)
          return (
            <li key={a.id}>
              <button disabled={has} onClick={() => add(a.id, a.title)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-paper text-left disabled:opacity-60">
                <Img src={cover?.thumb ?? ''} alt="" className="h-14 w-14 rounded-lg shrink-0" />
                <span className="flex-1"><span className="block font-semibold">{a.title}</span><span className="block text-sm text-meta">{a.mediaIds.length} items · {a.period}</span></span>
                {has ? <span className="pill bg-[#E7F6EE] text-[#1E6B43]"><Check size={12} /> Staat erin</span> : <Plus size={20} className="text-brand" />}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-4 pt-4 border-t border-line">
        <label className="label" htmlFor="quick-album">Of maak meteen een nieuw album</label>
        <div className="flex gap-2">
          <input id="quick-album" className="input" placeholder="Naam nieuw album" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button className="btn-primary shrink-0" disabled={!newName.trim()} onClick={() => { const a = createAlbum(newName.trim(), mediaIds); ui.close(); toast({ text: `Album “${a.title}” gemaakt met ${mediaIds.length} ${mediaIds.length === 1 ? 'foto' : "foto's"}`, action: { label: 'Bekijk', to: `/albums/${a.id}` } }) }}>Maken</button>
        </div>
      </div>
    </Modal>
  )
}

function Recorder({ onDone }: { onDone: (secs: number) => void }) {
  const [rec, setRec] = useState(false)
  const [secs, setSecs] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => { if (!rec) return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t) }, [rec])
  return (
    <div className="rounded-2xl bg-ink text-white p-5">
      <div className="flex items-center gap-4">
        <button onClick={() => { if (rec) { setRec(false); setDone(true); onDone(Math.max(secs, 3)) } else { setSecs(0); setDone(false); setRec(true) } }}
          className={cx('relative h-14 w-14 rounded-full flex items-center justify-center shrink-0', rec ? 'bg-white text-magenta' : 'bg-magenta text-white')} aria-label={rec ? 'Stop opname' : 'Start gesimuleerde opname'}>
          {rec && <span className="absolute inset-0 rounded-full bg-magenta/60 animate-pulseRing" />}
          {rec ? <Square size={20} fill="currentColor" /> : <Mic size={24} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">{rec ? 'Opname loopt… (gesimuleerd)' : done ? `Audioverhaal opgenomen · 0:${String(Math.max(secs, 3)).padStart(2, '0')}` : 'Spreek je verhaal in'}</div>
          <div className="text-sm text-white/70">Er wordt geen microfoon gebruikt en niets opgeslagen. Dit is een voorbeeld van de interface.</div>
        </div>
      </div>
      <Waveform seed={rec ? `rec${secs}` : 'rec-idle'} className={cx('w-full h-12 mt-4 transition-opacity', rec || done ? 'opacity-100 text-white/70' : 'opacity-30 text-white/50')} bars={60} progress={done ? 1 : 0} />
    </div>
  )
}

function StoryModal({ mediaId, audio }: { mediaId?: string; audio?: boolean }) {
  const ui = useUI(); const { state, addStory, toast } = useDemo(); const navigate = useNavigate()
  const [pick, setPick] = useState<string | undefined>(mediaId)
  const m = state.media.find((x) => x.id === pick)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(m?.dateTaken ?? '')
  const [ppl, setPpl] = useState<string[]>(m?.peopleIds ?? [])
  const [mode, setMode] = useState<'tekst' | 'audio'>(audio ? 'audio' : 'tekst')
  const [recorded, setRecorded] = useState(0)
  useEffect(() => { if (m) { setDate(m.dateTaken); setPpl(m.peopleIds) } }, [pick]) // eslint-disable-line react-hooks/exhaustive-deps
  const valid = !!pick && title.trim() && (mode === 'tekst' ? body.trim().length > 0 : recorded > 0)
  const save = () => {
    if (!valid || !pick) return
    const text = mode === 'audio' ? (body.trim() || `Audioverhaal van ${recorded} seconden, ingesproken door Sanne (voorbeeld).`) : body
    const s = addStory(pick, { title: title.trim(), body: text, date, peopleIds: ppl, audio: mode === 'audio' })
    ui.close(); toast({ text: 'Je verhaal is bewaard bij de foto en staat nu onder Verhalen', action: { label: 'Lees', to: `/verhalen/${s.id}` } })
    navigate(`/verhalen/${s.id}`)
  }
  return (
    <Modal open onClose={ui.close} title="Vertel het verhaal bij deze foto" subtitle="Wat gebeurde er, wie waren erbij, en waarom wil je het onthouden?" size="lg"
      footer={<><button className="btn-secondary" onClick={ui.close}>Annuleren</button><button className="btn-primary" disabled={!valid} onClick={save}><BookOpenText size={18} /> Verhaal bewaren</button></>}>
      {!m ? (
        <div><div className="label">Kies eerst een foto</div><PhotoPicker selected={pick ? [pick] : []} onToggle={(id) => setPick(id)} max={1} /></div>
      ) : (
        <div className="grid sm:grid-cols-[180px_1fr] gap-5">
          <div>
            <Img src={m.thumb} alt={m.alt} className="aspect-[4/5] rounded-2xl" era={m.era} grain />
            <div className="text-sm font-semibold mt-2 leading-snug">{m.title}</div>
            <div className="text-xs text-meta">{fmtDate(m.dateTaken)}</div>
            {!mediaId && <button className="text-sm link mt-1" onClick={() => setPick(undefined)}>Andere foto kiezen</button>}
          </div>
          <div className="space-y-4">
            <div className="inline-flex rounded-xl bg-paper p-1 border border-line" role="tablist">
              {(['tekst', 'audio'] as const).map((k) => (
                <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cx('h-9 px-4 rounded-lg text-sm font-semibold', mode === k ? 'bg-white shadow-card text-ink' : 'text-meta')}>
                  {k === 'tekst' ? 'Schrijven' : 'Audioverhaal toevoegen'}
                </button>
              ))}
            </div>
            <div><label className="label" htmlFor="st-title">Titel</label><input id="st-title" data-autofocus className="input" placeholder="Bijvoorbeeld: De zondag dat het ging sneeuwen" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            {mode === 'tekst' ? (
              <div><label className="label" htmlFor="st-body">Jouw verhaal</label><textarea id="st-body" rows={6} className="textarea" placeholder="Begin gewoon ergens. Een geur, een geluid, iets wat iemand zei…" value={body} onChange={(e) => setBody(e.target.value)} /></div>
            ) : (
              <div className="space-y-3"><Recorder onDone={setRecorded} /><div><label className="label" htmlFor="st-note">Korte toelichting (optioneel)</label><input id="st-note" className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Waar gaat het audioverhaal over?" /></div></div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label" htmlFor="st-date">Datum</label><input id="st-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            </div>
            <div>
              <div className="label">Wie horen bij dit verhaal?</div>
              <div className="flex flex-wrap gap-2">
                {state.people.map((p) => { const on = ppl.includes(p.id); return (
                  <button key={p.id} onClick={() => setPpl((x) => on ? x.filter((i) => i !== p.id) : [...x, p.id])} aria-pressed={on}
                    className={cx('inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full border text-sm font-medium', on ? 'border-brand bg-brand-50 text-brand' : 'border-line')}>
                    <Avatar person={p} size={26} />{p.name}{on && <Check size={14} />}</button>) })}
              </div>
            </div>
            <p className="text-sm text-meta flex items-center gap-1.5"><Lock size={14} /> Je verhaal is privé, tenzij je het album deelt.</p>
          </div>
        </div>
      )}
    </Modal>
  )
}

function InviteModal() {
  const ui = useUI(); const { state, invitePerson, toast } = useDemo()
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [rel, setRel] = useState('Familie')
  const [albums, setAlbums] = useState<string[]>([])
  const [step, setStep] = useState(1)
  return (
    <Modal open onClose={ui.close} title={step === 1 ? 'Familie uitnodigen' : 'Uitnodiging klaargezet'} subtitle={step === 1 ? 'Nodig iemand uit voor je familiekring. Je kiest zelf welke albums diegene ziet.' : undefined}
      footer={step === 1 ? <><button className="btn-secondary" onClick={ui.close}>Annuleren</button><button className="btn-primary" disabled={!name.trim()} onClick={() => { invitePerson(name.trim(), email.trim() || undefined, rel, albums); setStep(2) }}>Uitnodiging klaarzetten</button></>
        : <><button className="btn-primary" onClick={() => { ui.close(); toast({ text: `${name} staat bij Uitnodigingen`, action: { label: 'Bekijk', to: '/familie' } }) }}>Klaar</button></>}>
      {step === 1 ? (
        <div className="space-y-4">
          <div><label className="label" htmlFor="inv-name">Naam</label><input id="inv-name" data-autofocus className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bijvoorbeeld: tante Joke" /></div>
          <div><label className="label" htmlFor="inv-mail">E-mailadres (optioneel)</label><input id="inv-mail" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naam@voorbeeld.nl" /><p className="text-xs text-meta mt-1">In deze demo wordt er geen e-mail verstuurd.</p></div>
          <div><label className="label" htmlFor="inv-rel">Relatie</label>
            <select id="inv-rel" className="input" value={rel} onChange={(e) => setRel(e.target.value)}>{['Familie', 'Tante / oom', 'Neef / nicht', 'Vriend(in)', 'Gast'].map((r) => <option key={r}>{r}</option>)}</select></div>
          <div>
            <div className="label">Welke albums mag {name || 'deze persoon'} zien?</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {state.albums.slice(0, 6).map((a) => <Checkbox key={a.id} checked={albums.includes(a.id)} onChange={(v) => setAlbums((x) => v ? [...x, a.id] : x.filter((i) => i !== a.id))}>{a.title}</Checkbox>)}
            </div>
          </div>
          <DemoNote>Een uitnodiging geeft nooit automatisch toegang tot je documentenkluis.</DemoNote>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#E7F6EE] text-[#1E6B43] flex items-center justify-center mb-4"><Check size={30} /></div>
          <p className="text-[17px]"><strong>{name}</strong> staat nu bij <em>Uitnodigingen</em> in je familiekring.</p>
          <p className="text-meta mt-1">{albums.length ? `Toegang tot ${albums.length} album${albums.length > 1 ? 's' : ''} na acceptatie.` : 'Nog geen albums gekozen; dat kan later.'} Status: verstuurd (demo).</p>
        </div>
      )}
    </Modal>
  )
}

export function ShareAlbumModal({ albumId }: { albumId: string }) {
  const ui = useUI(); const { state, shareAlbum, unshareAlbum, setViewAs, toast } = useDemo(); const navigate = useNavigate()
  const album = state.albums.find((a) => a.id === albumId)!
  const candidates = state.people.filter((p) => p.id !== 'sanne' && p.member)
  const [sel, setSel] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const shared = album.sharedWith.map((id) => state.people.find((p) => p.id === id)).filter(Boolean)
  return (
    <Modal open onClose={ui.close} title={`Deel “${album.title}” met familie`} subtitle="Familieleden zien de foto's en verhalen in dit album. Niets anders." size="md"
      footer={done ? <><button className="btn-secondary" onClick={ui.close}>Sluiten</button>
        <button className="btn-magenta" onClick={() => { const who = sel[0] ?? album.sharedWith[0]; ui.close(); setViewAs(who); navigate('/albums'); toast({ text: `Je bekijkt nu als ${state.people.find((p) => p.id === who)?.name} (demonstratief)`, tone: 'demo' }) }}><Eye size={18} /> Bekijk als {state.people.find((p) => p.id === (sel[0] ?? album.sharedWith[0]))?.name}</button></>
        : <><button className="btn-secondary" onClick={ui.close}>Annuleren</button><button className="btn-primary" disabled={!sel.length} onClick={() => { shareAlbum(albumId, sel); setDone(true) }}><Users size={18} /> Delen</button></>}>
      {!done ? (
        <div className="space-y-2">
          {candidates.map((p) => {
            const already = album.sharedWith.includes(p.id)
            const on = sel.includes(p.id)
            return (
              <div key={p.id} className={cx('flex items-center gap-3 p-3 rounded-xl border', on ? 'border-brand bg-brand-50' : 'border-line')}>
                <Avatar person={p} size={44} />
                <div className="flex-1"><div className="font-semibold">{p.fullName}</div><div className="text-sm text-meta">{p.relationLabel}</div></div>
                {already ? (
                  <button className="btn-ghost btn-sm text-meta" onClick={() => { unshareAlbum(albumId, p.id); toast({ text: `${p.name} heeft geen toegang meer tot dit album` }) }}>Toegang intrekken</button>
                ) : (
                  <button onClick={() => setSel((x) => on ? x.filter((i) => i !== p.id) : [...x, p.id])} aria-pressed={on} aria-label={`${on ? 'Gekozen' : 'Kies'} ${p.name}`} className={cx('btn-sm btn', on ? 'bg-brand text-white' : 'bg-white border border-line')}>{on ? <><Check size={16} /> Gekozen</> : 'Kiezen'}</button>
                )}
              </div>
            )
          })}
          <DemoNote className="mt-4">Delen geeft alleen toegang tot dit album. Je documentenkluis blijft altijd privé.</DemoNote>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#E7F6EE] text-[#1E6B43] p-4 mb-4"><Check size={22} /><span className="font-semibold">Gedeeld. Dit is nu de toegang tot “{album.title}”:</span></div>
          <ul className="divide-y divide-line">
            <li className="flex items-center gap-3 py-3"><Avatar person={state.people.find((p) => p.id === 'sanne')} size={40} /><span className="flex-1 font-semibold">Sanne (jij)</span><span className="pill bg-ink text-white">Eigenaar</span></li>
            {shared.map((p) => (
              <li key={p!.id} className="flex items-center gap-3 py-3"><Avatar person={p} size={40} /><span className="flex-1"><span className="font-semibold block">{p!.name}</span><span className="text-sm text-meta">Mag bekijken en verhalen toevoegen</span></span><span className="pill bg-brand-light text-brand">Kan bekijken</span></li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-paper p-4 text-[14px] space-y-1.5">
            <div className="flex items-center gap-2"><Check size={15} className="text-[#1E6B43]" /> Foto's en verhalen in dit album</div>
            <div className="flex items-center gap-2"><Lock size={15} className="text-meta" /> Geen toegang tot je documentenkluis</div>
            <div className="flex items-center gap-2"><Lock size={15} className="text-meta" /> Geen toegang tot je andere albums</div>
          </div>
          <p className="text-sm text-meta mt-3">Wil je zien wat zij zien? Gebruik de demonstratieve kijkweergave.</p>
        </div>
      )}
    </Modal>
  )
}

function ShareMediaModal({ mediaId }: { mediaId: string }) {
  const ui = useUI(); const { state, toast } = useDemo()
  const m = state.media.find((x) => x.id === mediaId)!
  const albums = state.albums.filter((a) => a.mediaIds.includes(mediaId))
  return (
    <Modal open onClose={ui.close} title="Delen" subtitle={m.title}>
      <div className="space-y-3">
        <p className="text-[15px] text-ink/80">In Mijn Beeld &amp; Geluid deel je via albums. Zo weet je altijd precies wie wat ziet.</p>
        {albums.length ? albums.map((a) => (
          <button key={a.id} onClick={() => ui.open({ type: 'share', albumId: a.id })} className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:border-brand text-left">
            <Users size={20} className="text-brand" /><span className="flex-1"><span className="font-semibold block">Deel album “{a.title}”</span><span className="text-sm text-meta">{a.sharedWith.length ? `Nu gedeeld met ${a.sharedWith.length}` : 'Nu alleen jij'}</span></span><ArrowRight size={18} />
          </button>
        )) : <DemoNote>Deze foto zit nog in geen album. Voeg hem eerst toe aan een album om te delen.</DemoNote>}
        <button onClick={() => ui.open({ type: 'addToAlbum', mediaIds: [mediaId] })} className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:border-brand text-left"><FolderPlus size={20} className="text-brand" /><span className="flex-1 font-semibold">Toevoegen aan een album</span><ArrowRight size={18} /></button>
        <button onClick={() => { ui.close(); toast({ text: 'Voorbeeldlink gemaakt. In deze demo werkt de link niet buiten deze browser.', tone: 'demo' }) }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:border-brand text-left"><Link2 size={20} className="text-brand" /><span className="flex-1"><span className="font-semibold block">Tijdelijke link maken (demo)</span><span className="text-sm text-meta">Verloopt na 7 dagen · alleen deze foto</span></span></button>
      </div>
    </Modal>
  )
}

function DownloadModal({ mediaId }: { mediaId: string }) {
  const ui = useUI(); const { state, toast } = useDemo()
  const m = state.media.find((x) => x.id === mediaId)!
  const save = () => {
    const txt = `Mijn Beeld & Geluid — demo-download\n\nTitel: ${m.title}\nDatum: ${fmtDate(m.dateTaken)}\nPlaats: ${m.location}\n\n${m.description}\n\nDit is een voorbeeldbestand uit een conceptdemo met fictieve gegevens. Er is geen echt mediabestand gedownload.`
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `${m.id}-voorbeeld.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500)
    ui.close(); toast({ text: 'Voorbeeldbestand met de gegevens van deze foto gedownload', tone: 'demo' })
  }
  return (
    <Modal open onClose={ui.close} title="Downloaden" subtitle={m.title} size="sm"
      footer={<><button className="btn-secondary" onClick={ui.close}>Annuleren</button><button className="btn-primary" onClick={save}><Download size={18} /> Download voorbeeld</button></>}>
      <Img src={m.thumb} alt={m.alt} className="aspect-[3/2] rounded-xl mb-4" era={m.era} grain />
      <div className="space-y-2 text-[15px]">
        <label className="flex items-center gap-3"><input type="radio" name="q" defaultChecked className="accent-[#1937B9] h-4 w-4" /> Origineel met beschrijving en verhaal</label>
        <label className="flex items-center gap-3"><input type="radio" name="q" className="accent-[#1937B9] h-4 w-4" /> Kleiner formaat om te delen</label>
      </div>
      <DemoNote className="mt-4">In deze demo download je een klein tekstbestand met de fictieve gegevens van de foto, geen beeldbestand.</DemoNote>
    </Modal>
  )
}

function AddPhotosModal() {
  const ui = useUI(); const navigate = useNavigate(); const { completeImport, toast } = useDemo()
  const [stage, setStage] = useState<'choose' | 'busy' | 'done'>('choose')
  const [added, setAdded] = useState(0)
  const timer = useRef<number>(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const fromDevice = () => {
    setStage('busy')
    timer.current = window.setTimeout(() => { const ids = completeImport('device', ['m-geluk-drawing', 'm-geluk-rain', 'm-2026-bikes']); setAdded(ids.length); setStage('done') }, 900)
  }
  return (
    <Modal open onClose={ui.close} title="Foto's en video's toevoegen" subtitle="Kies hoe je herinneringen wilt toevoegen." size="md">
      {stage === 'choose' && (
        <div className="space-y-3">
          <button onClick={fromDevice} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-brand/40 bg-brand-50 hover:border-brand text-left">
            <span className="h-12 w-12 rounded-xl bg-brand text-white flex items-center justify-center shrink-0"><Smartphone size={22} /></span>
            <span><span className="font-semibold block">Van je telefoon of computer</span><span className="text-sm text-meta">In de demo voegen we drie voorbeeldfoto's toe</span></span>
          </button>
          <button onClick={() => { ui.close(); navigate('/bronnen') }} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-line hover:border-brand text-left">
            <span className="h-12 w-12 rounded-xl bg-paper text-brand flex items-center justify-center shrink-0"><CloudDownload size={22} /></span>
            <span><span className="font-semibold block">Uit een andere dienst</span><span className="text-sm text-meta">Google Photos, iCloud-export, WhatsApp-export en meer</span></span>
          </button>
          <button onClick={() => { ui.close(); navigate('/bronnen#analoog') }} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-line hover:border-brand text-left">
            <span className="h-12 w-12 rounded-xl bg-magenta-light text-magenta flex items-center justify-center shrink-0"><BookImage size={22} /></span>
            <span><span className="font-semibold block">Oude foto's, dia's of videobanden laten digitaliseren</span><span className="text-sm text-meta">Conceptdienst, eventueel met partners</span></span>
          </button>
        </div>
      )}
      {stage === 'busy' && <div className="py-10 text-center"><div className="mx-auto h-12 w-12 rounded-full border-4 border-brand-light border-t-brand animate-spin" /><p className="mt-4 font-semibold">Voorbeeldbestanden kopiëren…</p></div>}
      {stage === 'done' && (
        <div className="text-center py-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#E7F6EE] text-[#1E6B43] flex items-center justify-center mb-4"><Check size={30} /></div>
          <p className="text-[17px] font-semibold">{added} foto's toegevoegd aan je archief</p>
          <p className="text-meta mt-1">Ze staan bovenaan bij Foto's &amp; video's en zijn alleen voor jou zichtbaar.</p>
          <div className="flex justify-center gap-3 mt-6"><button className="btn-secondary" onClick={ui.close}>Sluiten</button><button className="btn-primary" onClick={() => { ui.close(); navigate('/fotos?sort=toegevoegd'); toast({ text: 'Nieuw toegevoegd staat bovenaan' }) }}>Bekijk in Foto's</button></div>
        </div>
      )}
    </Modal>
  )
}

export const WOWS = [
  { n: 1, title: 'De tijdmachine', text: 'Reis van 1975 naar 2026 door je familiegeschiedenis.', to: '/tijdmachine', icon: Timer, img: 'm-1975-portrait' },
  { n: 2, title: 'Achter iedere foto zit een verhaal', text: 'Oma Nel in de keuken, 1988, en het verhaal van Sanne.', to: '/foto/m-1988-kitchen', icon: BookOpenText, img: 'm-1988-kitchen' },
  { n: 3, title: 'Samen herinneren', text: 'Deel “Zomers in Zeeland” en bekijk het als Ineke.', to: '/albums/al-zeeland?delen=1', icon: Users, img: 'm-2024-beach-family' },
  { n: 4, title: 'Een nalatenschap die raakt', text: 'Maak een bewaarwens voor Mila en zie het voorbeeld.', to: '/nalatenschap?wens=mila', icon: HeartHandshake, img: 'm-2025-opa-mila' },
  { n: 5, title: 'Van familieherinnering naar erfgoed', text: 'Bied Haarlem, 1975 vrijwillig aan het nationaal archief aan.', to: '/nationaal-archief/aanbieden?foto=m-1975-haarlem', icon: Landmark, img: 'm-1975-haarlem' },
]

function WowModal() {
  const ui = useUI(); const navigate = useNavigate(); const { state } = useDemo()
  return (
    <Modal open onClose={ui.close} title="Ontdek de mogelijkheden" subtitle="Vijf korte ervaringen van 1–2 minuten. Je kunt altijd gewoon zelf verder klikken." size="lg" icon={<span className="h-11 w-11 rounded-2xl bg-magenta-light text-magenta flex items-center justify-center"><Sparkles size={22} /></span>}>
      <ul className="grid sm:grid-cols-2 gap-3">
        {WOWS.map((w) => { const m = state.media.find((x) => x.id === w.img); return (
          <li key={w.n} className={w.n === 5 ? 'sm:col-span-2' : ''}>
            <button onClick={() => { ui.close(); navigate(w.to) }} className="w-full group flex items-stretch gap-0 rounded-2xl border border-line overflow-hidden hover:border-brand hover:shadow-lift transition-all text-left bg-white">
              <Img src={m?.thumb ?? ''} alt="" era={m?.era} className="w-28 shrink-0" />
              <span className="p-4 flex-1">
                <span className="flex items-center gap-2 text-xs font-semibold text-magenta mb-1"><w.icon size={14} /> WOW {w.n} · <Clock size={12} /> 1–2 min</span>
                <span className="block font-display font-bold text-[17px] leading-snug">{w.title}</span>
                <span className="block text-sm text-meta mt-0.5">{w.text}</span>
              </span>
            </button>
          </li>) })}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper p-4">
        <span className="text-[15px]"><strong>Liever begeleid?</strong> Een rondleiding in 8 stappen van ongeveer 8 minuten.</span>
        <button className="btn-primary btn-sm" onClick={() => ui.open({ type: 'tourIntro' })}>Geef me een rondleiding</button>
      </div>
    </Modal>
  )
}

function TourIntro() {
  const ui = useUI(); const navigate = useNavigate()
  return (
    <Modal open onClose={ui.close} title="Een rondleiding door het archief van Sanne" subtitle="In 8 stappen zie je hoe Mijn Beeld & Geluid zou kunnen werken. Ongeveer 8 minuten." size="md"
      footer={<><button className="btn-secondary" onClick={ui.close}>Liever zelf ontdekken</button><button className="btn-primary" data-autofocus onClick={() => { ui.close(); ui.setTourStep(0); navigate(TOUR[0].to) }}>Start rondleiding <ArrowRight size={18} /></button></>}>
      <ol className="space-y-2">
        {TOUR.map((t, i) => <li key={t.title} className="flex items-center gap-3 text-[15px]"><span className="h-7 w-7 rounded-full bg-brand-light text-brand text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>{t.title}</li>)}
      </ol>
      <p className="text-sm text-meta mt-4">Je kunt op elk moment terug, verder of stoppen. De rondleiding wisselt zelf van scherm.</p>
    </Modal>
  )
}

function AboutModal() {
  const ui = useUI()
  return (
    <Modal open onClose={ui.close} title="Over deze demo" size="md" icon={<span className="h-11 w-11 rounded-2xl bg-[#FFF3D6] text-[#8A5A00] flex items-center justify-center"><FlaskConical size={22} /></span>}
      footer={<><button className="btn-secondary" onClick={() => ui.open({ type: 'reset' })}><RotateCcw size={17} /> Demo opnieuw starten</button><button className="btn-primary" onClick={ui.close}>Begrepen</button></>}>
      <div className="space-y-4 text-[15px] leading-relaxed text-ink/85">
        <p><strong>Mijn Beeld &amp; Geluid is een concept.</strong> Deze interactieve demo laat zien hoe de dienst zou kunnen werken. Het is geen operationele dienst.</p>
        <ul className="space-y-2">
          {['Alle personen, verhalen, documenten en gegevens zijn fictief. De familie van Dijk / de Wit bestaat niet.',
            "Beelden zijn illustratief: AI-beelden uit de conceptpresentatie en vrij gelicentieerde foto's. Personen op foto's zijn niet de fictieve familieleden.",
            'Er zijn geen echte koppelingen met Google, Apple, Meta of andere diensten, en er wordt niets geüpload.',
            'De documentenkluis is niet beveiligd of versleuteld. Er worden geen echte documenten opgeslagen.',
            'Nalatenschap, verificatie, het nationaal archief en De Schatkamer zijn ontwerpconcepten zonder juridische of technische garantie.',
            'Je acties worden alleen in deze browser bewaard (localStorage) en kun je altijd terugzetten.'].map((t) => <li key={t} className="flex gap-2"><Info size={16} className="text-brand mt-1 shrink-0" />{t}</li>)}
        </ul>
        <p className="text-meta text-sm">Bronvermelding van de beelden staat in DEMO_README.md en public/demo-media/CREDITS.md.</p>
      </div>
    </Modal>
  )
}

function ResetModal() {
  const ui = useUI(); const { resetDemo, toast } = useDemo(); const navigate = useNavigate()
  return (
    <Modal open onClose={ui.close} title="Demo opnieuw starten?" subtitle="Alle wijzigingen die je in deze demo hebt gedaan worden teruggezet: albums, favorieten, verhalen, delen, wensen en aanbiedingen." size="sm"
      footer={<><button className="btn-secondary" onClick={ui.close}>Annuleren</button><button className="btn-primary" data-autofocus onClick={() => { resetDemo(); ui.setTourStep(null); ui.close(); navigate('/voor-jou'); toast({ text: 'De demo is teruggezet naar de beginsituatie' }) }}><RotateCcw size={17} /> Opnieuw starten</button></>}>
      <DemoNote>Dit wist alleen de demo-gegevens in deze browser.</DemoNote>
    </Modal>
  )
}

function UnavailableModal({ title, text }: { title: string; text?: string }) {
  const ui = useUI()
  return (
    <Modal open onClose={ui.close} title={title} size="sm" icon={<span className="h-11 w-11 rounded-2xl bg-[#FFF3D6] text-[#8A5A00] flex items-center justify-center"><FlaskConical size={22} /></span>}
      footer={<button className="btn-primary" onClick={ui.close} data-autofocus>Begrepen</button>}>
      <p className="text-[15px] text-ink/85 leading-relaxed">{text ?? 'Deze functie is in deze conceptdemo nog niet beschikbaar.'}</p>
    </Modal>
  )
}

export function GlobalModals() {
  const { modal } = useUI()
  const key = useMemo(() => JSON.stringify(modal), [modal])
  if (!modal) return null
  const m = modal as ModalSpec
  switch (m.type) {
    case 'newAlbum': return <NewAlbumModal key={key} mediaIds={m.mediaIds} />
    case 'addToAlbum': return <AddToAlbumModal key={key} mediaIds={m.mediaIds} />
    case 'story': return <StoryModal key={key} mediaId={m.mediaId} audio={m.audio} />
    case 'invite': return <InviteModal key={key} />
    case 'share': return <ShareAlbumModal key={key} albumId={m.albumId} />
    case 'shareMedia': return <ShareMediaModal key={key} mediaId={m.mediaId} />
    case 'download': return <DownloadModal key={key} mediaId={m.mediaId} />
    case 'addPhotos': return <AddPhotosModal key={key} />
    case 'wow': return <WowModal key={key} />
    case 'tourIntro': return <TourIntro key={key} />
    case 'about': return <AboutModal key={key} />
    case 'reset': return <ResetModal key={key} />
    case 'unavailable': return <UnavailableModal key={key} title={m.title} text={m.text} />
  }
}
// ShieldCheck behouden voor toekomstige uitbreiding
void ShieldCheck
