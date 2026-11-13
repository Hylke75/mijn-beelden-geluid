import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Tv, Radio, Bookmark, BookmarkCheck, Link2, PenLine, Info, Check, Play } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { DemoNote, Img, Modal, PageHeader } from '../components/ui'
import { fragments } from '../data/schatkamer'
import { cx, normalize } from '../lib/format'

export default function Schatkamer() {
  const { state, saveFragment, attachSchatkamerReference, toast } = useDemo()
  const ui = useUI()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [detail, setDetail] = useState<string | null>(params.get('f'))
  const [linkFor, setLinkFor] = useState<string | null>(null)
  const forStory = params.get('verhaal')
  const story = state.stories.find((s) => s.id === forStory)
  const res = useMemo(() => {
    const n = normalize(q.trim())
    if (!n) return fragments
    return fragments.filter((f) => { const hay = normalize(`${f.title} ${f.program} ${f.year} ${f.channel} ${f.description} ${f.tags.join(' ')}`); return n.split(/\s+/).every((t) => hay.includes(t)) })
  }, [q])
  const f = fragments.find((x) => x.id === detail)
  const link = (storyId: string, fragId: string) => {
    attachSchatkamerReference(storyId, fragId); setLinkFor(null); setDetail(null)
    const s = state.stories.find((x) => x.id === storyId)
    toast({ text: `Verwijzing gekoppeld aan “${s?.title}”`, action: { label: 'Bekijk verhaal', to: `/verhalen/${storyId}` } })
  }
  return (
    <div>
      <PageHeader eyebrow="Erfgoed" title="De Schatkamer" sub="Was jij of een familielid ooit op tv of radio? Bewaar dat moment bij je eigen herinneringen, met het verhaal erbij." />
      {story && <div className="mb-6 rounded-2xl bg-brand-50 border border-brand-light p-4 flex flex-wrap items-center gap-3"><PenLine size={18} className="text-brand" /><span className="flex-1">Je zoekt een fragment voor het verhaal <strong>“{story.title}”</strong>.</span><button className="btn-ghost btn-sm" onClick={() => { const n = new URLSearchParams(params); n.delete('verhaal'); setParams(n) }}>Annuleren</button></div>}
      <form onSubmit={(e) => { e.preventDefault(); const n = new URLSearchParams(params); if (q) n.set('q', q); else n.delete('q'); setParams(n, { replace: true }) }} className="relative max-w-2xl mb-3" role="search">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-meta" />
        <label htmlFor="sk" className="sr-only">Zoek een televisie- of radiomoment</label>
        <input id="sk" className="input h-14 pl-12 text-[17px] rounded-2xl" placeholder="Zoek een televisie- of radiomoment" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <div className="flex flex-wrap gap-2 mb-6">{['Zeeland', 'appeltaart', '1975', 'schaatsen', 'radio'].map((s) => <button key={s} className="chip-off h-8 text-[13px]" onClick={() => setQ(s)}>{s}</button>)}</div>
      <DemoNote className="mb-6">Dit zijn <strong>fictieve demonstratieresultaten</strong>. Er wordt geen echt beeld- of geluidsmateriaal getoond en er is geen werkende koppeling met De Schatkamer. Beschikbaarheid hangt af van rechten en technische haalbaarheid.</DemoNote>
      <div className="text-sm text-meta mb-3" aria-live="polite">{res.length} {res.length === 1 ? 'fragment' : 'fragmenten'}</div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {res.map((x) => { const saved = state.savedFragments.includes(x.id); return (
          <article key={x.id} className="card overflow-hidden flex flex-col">
            <button onClick={() => setDetail(x.id)} className="relative group" aria-label={`Bekijk detail: ${x.title}`}>
              <Img src={x.still} alt="" className="h-48 bw" imgClassName="group-hover:scale-[1.03] transition-transform duration-500" />
              <span className="absolute top-3 left-3 pill bg-[#FFF3D6] text-[#6B4A00]">Conceptfragment</span>
              <span className="absolute bottom-3 left-3 pill bg-black/60 text-white">{x.channel === 'Radio' ? <Radio size={11} /> : <Tv size={11} />} {x.duration}</span>
            </button>
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-sm text-meta">{x.program} · {x.year}</div>
              <h2 className="font-display text-lg font-bold leading-snug mt-0.5">{x.title}</h2>
              <p className="text-[15px] text-meta mt-1.5 line-clamp-3">{x.description}</p>
              <div className="flex flex-wrap gap-2 mt-auto pt-4">
                <button className="btn-secondary btn-sm" onClick={() => setDetail(x.id)}>Bekijk detail</button>
                <button className={cx('btn-sm btn', saved ? 'bg-[#E7F6EE] text-[#1E6B43]' : 'btn-secondary')} onClick={() => { saveFragment(x.id); toast({ text: saved ? 'Verwijzing verwijderd uit je herinneringen' : 'Verwijzing bewaard bij je herinneringen' }) }} aria-pressed={saved}>{saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />} {saved ? 'Bewaard' : 'Bewaar verwijzing'}</button>
                <button className="btn-primary btn-sm" onClick={() => (story ? link(story.id, x.id) : setLinkFor(x.id))}><Link2 size={15} /> Voeg het verhaal toe</button>
              </div>
            </div>
          </article>) })}
      </div>
      {!res.length && <div className="card p-10 text-center mt-2"><Tv className="mx-auto text-brand" /><p className="font-semibold mt-2">Geen fragmenten gevonden</p><p className="text-meta">In deze demo zijn vijf fictieve fragmenten beschikbaar. Probeer “Zeeland” of “1975”.</p></div>}

      {f && (
        <Modal open onClose={() => { setDetail(null); const n = new URLSearchParams(params); n.delete('f'); setParams(n, { replace: true }) }} title={f.title} subtitle={`${f.program} · ${f.year} · ${f.channel}`} size="lg"
          footer={<><button className="btn-secondary" onClick={() => { saveFragment(f.id); toast({ text: state.savedFragments.includes(f.id) ? 'Verwijzing verwijderd' : 'Verwijzing bewaard bij je herinneringen' }) }}>{state.savedFragments.includes(f.id) ? <><BookmarkCheck size={16} /> Bewaard</> : <><Bookmark size={16} /> Bewaar verwijzing bij mijn herinneringen</>}</button><button className="btn-primary" onClick={() => (story ? link(story.id, f.id) : setLinkFor(f.id))}><Link2 size={16} /> Voeg het verhaal toe</button></>}>
          <div className="relative rounded-2xl overflow-hidden">
            <Img src={f.still} alt="" className="aspect-video bw" />
            <button onClick={() => ui.open({ type: 'unavailable', title: 'Fragment afspelen', text: 'In deze conceptdemo wordt geen echt beeld- of geluidsmateriaal afgespeeld. Of een fragment in de echte dienst beschikbaar is, hangt af van rechten en technische haalbaarheid.' })} className="absolute inset-0 flex items-center justify-center" aria-label="Afspelen (niet beschikbaar in demo)"><span className="h-16 w-16 rounded-full bg-white/90 text-ink flex items-center justify-center"><Play size={26} fill="currentColor" className="ml-1" /></span></button>
            <span className="absolute top-3 left-3 pill bg-[#FFF3D6] text-[#6B4A00]">Conceptfragment · plaatsvervangende still</span>
          </div>
          <p className="text-[15px] text-ink/85 mt-4 leading-relaxed">{f.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">{f.tags.map((t) => <span key={t} className="pill bg-paper text-meta border border-line">{t}</span>)}</div>
          <div className="mt-4 flex gap-2 text-sm text-meta"><Info size={16} className="shrink-0 mt-0.5" /> {f.rights}</div>
        </Modal>
      )}
      {linkFor && (
        <Modal open onClose={() => setLinkFor(null)} title="Bij welk verhaal hoort dit fragment?" size="md">
          <ul className="space-y-1.5">
            {state.stories.map((s) => { const has = s.schatkamerIds.includes(linkFor); const m = state.media.find((x) => x.id === s.mediaId); return (
              <li key={s.id}><button disabled={has} onClick={() => link(s.id, linkFor)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-paper text-left disabled:opacity-60">
                <Img src={m?.thumb ?? ''} alt="" era={m?.era} className="h-12 w-12 rounded-lg shrink-0" /><span className="flex-1 font-medium">{s.title}</span>{has && <span className="pill bg-[#E7F6EE] text-[#1E6B43]"><Check size={11} /> Gekoppeld</span>}
              </button></li>) })}
          </ul>
          <button className="btn-secondary w-full mt-4" onClick={() => { setLinkFor(null); ui.open({ type: 'story' }) }}><PenLine size={16} /> Of schrijf een nieuw verhaal</button>
        </Modal>
      )}
      {state.savedFragments.length > 0 && (
        <section className="mt-12"><h2 className="font-display text-xl font-bold mb-3">Bewaard bij mijn herinneringen</h2>
          <div className="flex flex-wrap gap-2">{state.savedFragments.map((id) => { const x = fragments.find((y) => y.id === id); const st = state.stories.filter((s) => s.schatkamerIds.includes(id)); return x && <button key={id} onClick={() => (st[0] ? navigate(`/verhalen/${st[0].id}`) : setDetail(id))} className="chip-off"><Tv size={14} /> {x.title}{st[0] && <span className="text-meta">· bij “{st[0].title}”</span>}</button> })}</div>
        </section>
      )}
    </div>
  )
}
