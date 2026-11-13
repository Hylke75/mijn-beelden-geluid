import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Check, Plus, ArrowRight, ArrowLeft, FileArchive, Smartphone, Film, BookImage, Disc3, Unplug, Info, Zap, Hand } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { DemoNote, Img, Modal, PageHeader, Checkbox } from '../components/ui'
import type { DemoSource } from '../data/types'
import { cx } from '../lib/format'

function StatusPill({ s }: { s: DemoSource }) {
  if (s.status === 'connected') return <span className="pill bg-[#E7F6EE] text-[#1E6B43]"><Check size={11} /> Voorbeeld verbonden</span>
  if (s.status === 'manual') return <span className="pill bg-brand-light text-brand"><Hand size={11} /> Handmatig importeren</span>
  return <span className="pill bg-[#EEF0F3] text-meta">Nog niet ingesteld</span>
}
function SourceIcon({ s, size = 48 }: { s: DemoSource; size?: number }) {
  return <span className="rounded-2xl flex items-center justify-center text-white font-display font-bold shrink-0" style={{ background: s.color, width: size, height: size, fontSize: size * 0.34 }} aria-hidden>{s.short}</span>
}

export default function Bronnen() {
  const { state, disconnectSource, toast } = useDemo()
  const ui = useUI()
  const [wizard, setWizard] = useState<string | null>(null)
  const auto = state.sources.filter((s) => s.kind === 'auto')
  const manual = state.sources.filter((s) => s.kind === 'export' || s.kind === 'device')
  useEffect(() => { if (window.location.hash === '#analoog') document.getElementById('analoog')?.scrollIntoView({ behavior: 'smooth' }) }, [])
  const Card = ({ s }: { s: DemoSource }) => (
    <div className="card p-5 flex flex-col">
      <div className="flex items-start gap-3"><SourceIcon s={s} /><div className="flex-1 min-w-0"><h3 className="font-semibold text-[17px] leading-tight">{s.name}</h3><div className="mt-1.5"><StatusPill s={s} /></div></div></div>
      <p className="text-[15px] text-meta mt-3 leading-relaxed flex-1">{s.description}</p>
      {s.itemsCount > 0 && <p className="text-sm mt-3"><strong>{s.itemsCount.toLocaleString('nl-NL')}</strong> <span className="text-meta">items gekopieerd{s.lastSync ? ` · ${s.lastSync}` : ''}</span></p>}
      <div className="flex gap-2 mt-4">
        <button className={s.status === 'connected' ? 'btn-secondary btn-sm flex-1' : 'btn-primary btn-sm flex-1'} onClick={() => setWizard(s.id)}>
          {s.status === 'connected' ? <><RefreshCw size={15} /> Nu kopiëren</> : s.kind === 'auto' ? <><Plus size={15} /> Bron koppelen</> : <><FileArchive size={15} /> Importeren</>}
        </button>
        {s.status === 'connected' && <button className="btn-ghost btn-sm" onClick={() => { disconnectSource(s.id); toast({ text: `${s.name} losgekoppeld (demo). Gekopieerde items blijven bewaard.` }) }} aria-label={`${s.name} loskoppelen`}><Unplug size={16} /></button>}
      </div>
    </div>
  )
  return (
    <div>
      <PageHeader eyebrow="Bewaren" title="Bronnen & importeren" sub="Je eigen apps blijf je gewoon gebruiken. Mijn Beeld & Geluid maakt er een tweede kopie van, op één plek." actions={<button className="btn-primary" onClick={() => setWizard('pick')}><Plus size={18} /> Bron koppelen</button>} />
      <DemoNote className="mb-8">Er zijn in deze demo geen echte koppelingen. “Voorbeeld verbonden” laat zien hoe het eruit zou kunnen zien. Welke automatische koppelingen haalbaar zijn, wordt in het haalbaarheidsonderzoek getoetst.</DemoNote>

      <section className="mb-10">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-1"><Zap size={19} className="text-brand" /> Automatische koppelingen</h2>
        <p className="text-meta mb-4">Nieuwe foto's worden vanzelf gekopieerd, zodra een koppeling bestaat.</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{auto.map((s) => <Card key={s.id} s={s} />)}</div>
      </section>
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-1"><FileArchive size={19} className="text-brand" /> Handmatige export en import</h2>
        <p className="text-meta mb-4">Je vraagt bij de dienst zelf een download aan en zet die hier neer.</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{manual.map((s) => <Card key={s.id} s={s} />)}</div>
      </section>

      <section id="analoog" className="rounded-3xl overflow-hidden grid lg:grid-cols-2 bg-ink text-white scroll-mt-24">
        <Img src="/demo-media/full/m-2016-scanning.jpg" alt="Iemand scant oude foto's aan de keukentafel" className="h-[260px] lg:h-full min-h-[300px]" />
        <div className="p-7 sm:p-10">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7AC4]">Ook het verleden krijgt een plek</div>
          <h2 className="font-display text-[28px] sm:text-[34px] font-bold leading-tight mt-2">Oude foto's laten digitaliseren</h2>
          <p className="text-white/80 mt-3 leading-relaxed">Fotoboeken, dia's en familievideo's verdienen een tweede leven. Mijn Beeld &amp; Geluid kan digitalisering aanbieden, eventueel met partners.</p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[{ i: BookImage, l: 'Fotoboeken', s: 'Pagina voor pagina' }, { i: Disc3, l: "Dia's", s: 'Ook in carrousels' }, { i: Film, l: 'Videobanden', s: 'VHS, Video8, Super 8' }].map((x) => (
              <div key={x.l} className="rounded-2xl bg-white/8 border border-white/10 p-3"><x.i size={20} className="text-[#FF7AC4]" /><div className="font-semibold mt-2 text-[15px]">{x.l}</div><div className="text-xs text-white/60">{x.s}</div></div>
            ))}
          </div>
          <button className="btn-white mt-6" onClick={() => ui.open({ type: 'unavailable', title: 'Mogelijkheden voor digitaliseren', text: 'Dit is een conceptdienst. Gedacht wordt aan: een verzendpakket voor fotoboeken en dia\'s, ophalen van videobanden, en een kopie die direct in je archief verschijnt met datum en plaats. Prijzen en partners zijn nog niet bepaald.' })}>Bekijk mogelijkheden <ArrowRight size={17} /></button>
          <p className="text-xs text-white/50 mt-3">In 2016 liet Sanne 318 foto's en dia's van oma Nel digitaliseren (voorbeeld).</p>
        </div>
      </section>

      {wizard && <ImportWizard initial={wizard} onClose={() => setWizard(null)} />}
    </div>
  )
}

function ImportWizard({ initial, onClose }: { initial: string; onClose: () => void }) {
  const { state, completeImport, connectSource } = useDemo()
  const navigate = useNavigate()
  const [step, setStep] = useState(initial === 'pick' ? 0 : 1)
  const [srcId, setSrcId] = useState(initial === 'pick' ? '' : initial)
  const src = state.sources.find((s) => s.id === srcId)
  const pool = (src?.importPool ?? []).map((id) => state.media.find((m) => m.id === id)).filter(Boolean)
  const [chosen, setChosen] = useState<string[]>([])
  const [kinds, setKinds] = useState({ photos: true, videos: true, docs: false })
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(0)
  useEffect(() => { setChosen(src?.importPool ?? []) }, [srcId]) // eslint-disable-line react-hooks/exhaustive-deps
  const steps = ['Kies bron', 'Welke bestanden?', 'Controleer', 'Klaar (demo)']
  const finish = () => {
    setBusy(true)
    window.setTimeout(() => { if (src?.kind === 'auto') connectSource(src.id); const ids = completeImport(srcId, chosen); setAdded(ids.length); setBusy(false); setStep(3) }, 1100)
  }
  return (
    <Modal open onClose={onClose} title={src ? `${src.name} koppelen` : 'Bron koppelen'} size="lg"
      subtitle={<div className="flex items-center gap-1.5 mt-2 flex-wrap">{steps.map((s, i) => <span key={s} className={cx('flex items-center gap-1.5 text-sm', i === step ? 'text-ink font-semibold' : i < step ? 'text-brand' : 'text-meta')}><span className={cx('h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center', i < step ? 'bg-brand text-white' : i === step ? 'bg-ink text-white' : 'bg-line text-meta')}>{i < step ? <Check size={13} /> : i + 1}</span>{s}{i < 3 && <span className="text-line mx-1">—</span>}</span>)}</div>}
      footer={step === 3 ? <><button className="btn-secondary" onClick={onClose}>Sluiten</button><button className="btn-primary" onClick={() => { onClose(); navigate('/fotos?sort=toegevoegd') }}>Bekijk in Foto's <ArrowRight size={17} /></button></>
        : <>{step > 0 && <button className="btn-secondary mr-auto" onClick={() => setStep(step - 1)} disabled={busy}><ArrowLeft size={17} /> Terug</button>}
          {step === 0 && <button className="btn-primary" disabled={!srcId} onClick={() => setStep(1)}>Verder <ArrowRight size={17} /></button>}
          {step === 1 && <button className="btn-primary" disabled={!chosen.length} onClick={() => setStep(2)}>Verder <ArrowRight size={17} /></button>}
          {step === 2 && <button className="btn-primary" onClick={finish} disabled={busy}>{busy ? <><RefreshCw size={17} className="animate-spin" /> Bezig met kopiëren…</> : <>Start import (demo)</>}</button>}</>}>
      {step === 0 && (
        <div className="grid sm:grid-cols-2 gap-2">
          {state.sources.filter((s) => s.kind !== 'analog').map((s) => (
            <button key={s.id} onClick={() => setSrcId(s.id)} aria-pressed={srcId === s.id} className={cx('flex items-center gap-3 p-3 rounded-2xl border text-left', srcId === s.id ? 'border-brand bg-brand-50' : 'border-line hover:border-[#C9D0DB]')}>
              <SourceIcon s={s} size={40} /><span className="flex-1"><span className="block font-semibold leading-tight">{s.name}</span><span className="text-xs text-meta">{s.kind === 'auto' ? 'Automatisch (concept)' : 'Handmatige export'}</span></span>{srcId === s.id && <Check size={18} className="text-brand" />}
            </button>
          ))}
        </div>
      )}
      {step === 1 && src && (
        <div>
          {src.kind === 'auto' ? (
            <div className="rounded-2xl bg-paper p-4 mb-5 flex gap-3"><Info size={18} className="text-brand shrink-0 mt-0.5" /><p className="text-[15px]">In de echte dienst log je hier in bij {src.name} en geef je toestemming om een kopie te maken. <strong>In deze demo slaan we dat over</strong>: er wordt niets gekoppeld of ingelezen.</p></div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-line p-5 mb-5 text-center"><Smartphone className="mx-auto text-brand" /><p className="font-semibold mt-2">Exportbestand van {src.name}</p><p className="text-sm text-meta">In deze demo gebruiken we een voorbeeldexport. Er wordt niets van je apparaat gelezen.</p></div>
          )}
          <div className="label">Wat wil je kopiëren?</div>
          <div className="grid sm:grid-cols-3 gap-2 mb-5">
            <Checkbox checked={kinds.photos} onChange={(v) => setKinds({ ...kinds, photos: v })}>Foto's</Checkbox>
            <Checkbox checked={kinds.videos} onChange={(v) => setKinds({ ...kinds, videos: v })}>Video's</Checkbox>
            <Checkbox checked={kinds.docs} onChange={(v) => setKinds({ ...kinds, docs: v })}>Documenten</Checkbox>
          </div>
          <div className="label">Gevonden in de voorbeeldexport ({chosen.length} van {pool.length} gekozen)</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {pool.map((m) => { const on = chosen.includes(m!.id); return (
              <button key={m!.id} onClick={() => setChosen((c) => on ? c.filter((x) => x !== m!.id) : [...c, m!.id])} aria-pressed={on} aria-label={m!.title} className={cx('relative aspect-square rounded-xl overflow-hidden tile-focus', on ? 'ring-4 ring-brand ring-inset' : 'opacity-60')}>
                <Img src={m!.thumb} alt="" className="absolute inset-0" era={m!.era} />{on && <span className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center"><Check size={14} strokeWidth={3} /></span>}
              </button>) })}
          </div>
        </div>
      )}
      {step === 2 && src && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-paper divide-y divide-line">
            {[['Bron', src.name], ['Soort koppeling', src.kind === 'auto' ? 'Automatisch (voorbeeld)' : 'Handmatige export'], ['Aantal items', `${chosen.length}`], ['Zichtbaarheid', 'Alleen ik (privé)'], ['Origineel', `Blijft gewoon in ${src.name}`]].map(([k, v]) => <div key={k} className="flex px-4 py-3 text-[15px]"><span className="text-meta w-40">{k}</span><span className="font-medium">{v}</span></div>)}
          </div>
          <DemoNote>Bij het starten worden {chosen.length} voorbeeldbestanden uit deze demo als kopie aan je galerij toegevoegd. Er worden geen echte bestanden ingelezen.</DemoNote>
        </div>
      )}
      {step === 3 && src && (
        <div className="text-center py-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-[#E7F6EE] text-[#1E6B43] flex items-center justify-center"><Check size={30} /></div>
          <h3 className="font-display text-2xl font-bold mt-4">Klaar (demo)</h3>
          <p className="text-meta mt-1">{added} items uit {src.name} staan nu in je archief, bovenaan bij Foto's &amp; video's.</p>
        </div>
      )}
    </Modal>
  )
}
