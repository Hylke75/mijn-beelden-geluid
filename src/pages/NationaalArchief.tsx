import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Landmark, ArrowRight, ArrowLeft, Check, Lock, Sparkles, UserCheck, Copy, ShieldCheck, Clock, X, Image as ImageIcon } from 'lucide-react'
import { useDemo } from '../demo/store'
import { Checkbox, DemoNote, Img, PageHeader } from '../components/ui'
import { cx, fmtDate } from '../lib/format'

const PROCESS = [
  { t: 'Kies een foto', s: 'Jij kiest vrijwillig welke foto je aanbiedt.', i: ImageIcon },
  { t: 'Voeg context toe', s: 'Waar, wanneer, wie, en waarom het ertoe doet.', i: Sparkles },
  { t: 'Controleer rechten en toestemming', s: 'Ben jij de maker of rechthebbende? Zijn mensen herkenbaar?', i: ShieldCheck },
  { t: 'Bied aan', s: 'Er gaat een aparte kopie naar de beoordeling.', i: Copy },
  { t: 'Beoordeling door archivaris', s: 'AI kan hoogstens helpen bij een voorselectie. Een archivaris beslist.', i: UserCheck },
]

export default function NationaalArchief() {
  const { state, withdrawSubmission, toast } = useDemo()
  const navigate = useNavigate()
  const subs = state.submissions
  const hero = ['m-1975-haarlem', 'm-1975-portrait', 'm-1994-huts', 'm-1988-kitchen'].map((id) => state.media.find((m) => m.id === id)!)
  return (
    <div>
      <section className="relative rounded-3xl overflow-hidden bg-ink text-white mb-10" data-tour="heritage">
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4 opacity-55">{hero.map((m) => <Img key={m.id} src={m.thumb} alt="" className="h-full bw" />)}</div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1226] via-[#0B1226]/85 to-[#0B1226]/30" />
        <div className="relative p-7 sm:p-12 max-w-2xl">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF7AC4]">Van privéfoto naar gezamenlijk erfgoed</div>
          <h1 className="font-display text-[34px] sm:text-[48px] font-bold leading-[1.04] mt-3">Jouw foto kan deel worden van ons gezamenlijke verhaal</h1>
          <p className="text-white/80 text-[17px] mt-4 leading-relaxed">Niet alleen bekende gebeurtenissen. Juist ook het gewone leven: onze straten, onze buurten, onze families. Helemaal vrijwillig.</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button className="btn-magenta" onClick={() => navigate('/nationaal-archief/aanbieden')}><Landmark size={18} /> Een foto aanbieden</button>
            <button className="btn h-11 bg-white/10 hover:bg-white/20 text-white" onClick={() => navigate('/nationaal-archief/aanbieden?foto=m-1975-haarlem')}>Bekijk het voorbeeld: Haarlem, 1975</button>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl font-bold mb-5">Zo werkt aanbieden</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PROCESS.map((p, i) => (
            <li key={p.t} className="card p-5">
              <span className={cx('h-10 w-10 rounded-full flex items-center justify-center font-bold text-white', i === 4 ? 'bg-magenta' : 'bg-brand')}>{i + 1}</span>
              <div className="font-semibold mt-3 leading-snug">{p.t}</div><p className="text-sm text-meta mt-1">{p.s}</p>
            </li>
          ))}
        </ol>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {[{ i: Check, t: 'Altijd vrijwillig', s: 'Niets gaat automatisch. Jij kiest per foto.' }, { i: Lock, t: 'Privé blijft privé', s: 'Je origineel blijft in je eigen archief, alleen voor jou.' }, { i: UserCheck, t: 'Een mens beslist', s: 'Een archivaris van Beeld & Geluid beoordeelt elke aanbieding.' }].map((x) => (
            <div key={x.t} className="flex gap-3 rounded-2xl bg-white border border-line p-4"><x.i size={20} className="text-brand shrink-0 mt-0.5" /><div><div className="font-semibold">{x.t}</div><div className="text-sm text-meta">{x.s}</div></div></div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_1.2fr] gap-6 mb-10">
        <div className="card overflow-hidden">
          <Img src={state.media.find((m) => m.id === 'm-1975-haarlem')!.src} alt="Fictieve familieopname in een Haarlemse winkelstraat, 1975" className="h-[260px] bw" grain era="bw" />
          <div className="p-5">
            <span className="pill bg-[#FFF3D6] text-[#6B4A00]">Voorbeeldkaart · fictief</span>
            <h3 className="font-display text-xl font-bold mt-2">Zaterdag in de Grote Houtstraat, 1975</h3>
            <p className="text-[15px] text-meta mt-1">Een gewone zaterdag in Haarlem, gefotografeerd door Pieter de Wit op de ochtend van zijn trouwdag. Winkelpuien, fietsen, mensen op weg naar de markt.</p>
            <Link to="/nationaal-archief/aanbieden?foto=m-1975-haarlem" className="link inline-flex items-center gap-1 mt-3">Deze foto aanbieden <ArrowRight size={16} /></Link>
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">Mijn bijdragen</h2>
          {subs.length ? (
            <div className="space-y-3">
              {subs.map((s) => { const m = state.media.find((x) => x.id === s.mediaId); return (
                <div key={s.id} className="card p-4 flex gap-4">
                  <Img src={m?.thumb ?? ''} alt="" era={m?.era} className="h-24 w-24 rounded-xl shrink-0 bw" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-snug">{s.title}</div>
                    <div className="text-sm text-meta">{s.location} · {s.year} · ingediend {fmtDate(s.submittedOn)}</div>
                    <div className="mt-2 flex flex-wrap gap-2"><span className="pill bg-[#FFF3D6] text-[#6B4A00]"><Clock size={11} /> {s.status}</span><span className="pill bg-[#EEF0F3] text-ink"><Lock size={11} /> Origineel blijft privé</span></div>
                    <button className="text-sm text-meta hover:text-ink mt-2" onClick={() => { withdrawSubmission(s.id); toast({ text: 'Aanbieding ingetrokken (demo)' }) }}>Aanbieding intrekken</button>
                  </div>
                </div>) })}
            </div>
          ) : (
            <div className="card p-8 text-center"><Landmark className="mx-auto text-brand" /><p className="font-semibold mt-2">Je hebt nog niets aangeboden</p><p className="text-meta text-[15px]">Wanneer je een foto aanbiedt, zie je hier de status van de beoordeling.</p><button className="btn-primary mt-4" onClick={() => navigate('/nationaal-archief/aanbieden')}>Een foto aanbieden</button></div>
          )}
        </div>
      </section>
      <DemoNote>Conceptdemo: aanbiedingen worden niet echt verstuurd en nooit publiek gemaakt. Er is geen echte beoordeling.</DemoNote>
    </div>
  )
}

export function HeritageWizard() {
  const { state, submitHeritageDemo } = useDemo()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const pre = params.get('foto') ?? ''
  const [step, setStep] = useState(pre ? 1 : 0)
  const [mediaId, setMediaId] = useState(pre)
  const m = state.media.find((x) => x.id === mediaId)
  const [ctx, setCtx] = useState({ title: m?.id === 'm-1975-haarlem' ? 'Zaterdag in de Grote Houtstraat, Haarlem' : m?.title ?? '', context: m?.id === 'm-1975-haarlem' ? 'Gefotografeerd door mijn vader, Pieter de Wit, op 14 juni 1975, de ochtend van zijn trouwdag. Hij liep van zijn ouderlijk huis naar het stadhuis en maakte onderweg foto\'s van de straat. Je ziet de winkels van toen en hoe druk het op zaterdag was.' : m?.description ?? '', location: m?.location ?? '', year: m?.dateTaken.slice(0, 4) ?? '', people: 'Voorbijgangers, niet bij naam bekend' })
  const [cons, setCons] = useState({ owner: false, recognizable: false, license: false, review: false })
  const [license, setLicense] = useState('CC BY 4.0 · naamsvermelding')
  const [done, setDone] = useState(false)
  const old = state.media.filter((x) => x.kind === 'photo' && Number(x.dateTaken.slice(0, 4)) < 2005 && !x.importedAt)
  const steps = ['Foto selecteren', 'Verhaal en context', 'Rechten en toestemming', 'Overzicht']
  const pick = (id: string) => { const mm = state.media.find((x) => x.id === id)!; setMediaId(id); setCtx({ title: mm.title, context: mm.description, location: mm.location, year: mm.dateTaken.slice(0, 4), people: '' }) }
  const allCons = cons.owner && cons.recognizable && cons.license && cons.review

  if (done && m) {
    const sub = state.submissions.find((s) => s.mediaId === m.id)
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8"><div className="mx-auto h-16 w-16 rounded-full bg-[#E7F6EE] text-[#1E6B43] flex items-center justify-center"><Check size={30} /></div><h1 className="font-display text-[30px] sm:text-[38px] font-bold mt-4">Ingediend (demo)</h1><p className="text-meta text-[17px] mt-1">Dank je wel. Zo zou je aanbieding er bij de beoordeling uitzien.</p></div>
        <div className="rounded-3xl border border-line bg-white overflow-hidden shadow-lift">
          <div className="bg-ink text-white px-5 py-3 flex items-center gap-2 text-sm"><Landmark size={16} /> Curatoroverzicht · conceptmatige preview<span className="ml-auto pill bg-white/15 text-white">Niet publiek</span></div>
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <Img src={m.src} alt={m.alt} era={m.era} grain className="h-[300px] md:h-full bw" />
            <div className="p-6">
              <span className="pill bg-[#FFF3D6] text-[#6B4A00]"><Clock size={11} /> {sub?.status ?? 'Ingediend (demo) · wacht op beoordeling'}</span>
              <h2 className="font-display text-2xl font-bold mt-3">{ctx.title}</h2>
              <dl className="mt-4 text-[15px] space-y-2">
                {[['Plaats', ctx.location], ['Jaar', ctx.year], ['Personen', ctx.people || 'Niet opgegeven'], ['Licentie', license], ['Aangeboden door', 'Sanne van Dijk (fictief)']].map(([k, v]) => <div key={k} className="flex gap-3"><dt className="text-meta w-32 shrink-0">{k}</dt><dd>{v}</dd></div>)}
              </dl>
              <p className="text-[15px] text-ink/80 mt-4 leading-relaxed">{ctx.context}</p>
              <div className="mt-5 rounded-xl bg-paper p-3 text-sm flex gap-2"><Sparkles size={16} className="text-brand shrink-0 mt-0.5" /> Voorselectie (concept): straatbeeld, jaren 70, Haarlem. De archivaris beslist.</div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#EEF0F3] p-4 text-[15px]"><Lock size={18} /> Je oorspronkelijke foto in je eigen archief blijft ongewijzigd privé. Er is alleen een aparte kopie aangeboden.</div>
        <p className="text-center font-display text-[26px] sm:text-[32px] font-bold leading-tight mt-12 max-w-2xl mx-auto">De herinneringen van vandaag zijn het erfgoed van morgen.</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6"><Link to="/nationaal-archief" className="btn-primary">Bekijk mijn bijdragen</Link><Link to={`/foto/${m.id}`} className="btn-secondary">Bekijk deze herinnering</Link><Link to="/voor-jou" className="btn-secondary">Ga zelf verder</Link></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/nationaal-archief')} className="btn-ghost btn-sm -ml-3 mb-4"><X size={17} /> Annuleren</button>
      <PageHeader eyebrow="Nationaal archief · vrijwillig" title="Een foto aanbieden" />
      <ol className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-none" aria-label="Stappen">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2 shrink-0">
            <span className={cx('h-8 w-8 rounded-full text-sm font-bold flex items-center justify-center', i < step ? 'bg-brand text-white' : i === step ? 'bg-ink text-white' : 'bg-line text-meta')} aria-current={i === step ? 'step' : undefined}>{i < step ? <Check size={15} /> : i + 1}</span>
            <span className={cx('text-sm font-semibold', i === step ? 'text-ink' : 'text-meta')}>{s}</span>{i < steps.length - 1 && <span className="w-6 h-px bg-line" />}
          </li>
        ))}
      </ol>

      <div className="card p-5 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="font-display text-xl font-bold">Welke foto wil je aanbieden?</h2>
            <p className="text-meta mb-5">Oudere foto's van straten, buurten en het dagelijks leven zijn extra waardevol.</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {old.map((x) => <button key={x.id} onClick={() => pick(x.id)} aria-pressed={mediaId === x.id} className={cx('group text-left rounded-xl p-1', mediaId === x.id ? 'bg-brand-50 ring-2 ring-brand' : '')}><Img src={x.thumb} alt={x.alt} era={x.era} grain className="aspect-square rounded-lg" /><span className="block text-[12px] mt-1 leading-tight line-clamp-2">{x.title}</span></button>)}
            </div>
          </div>
        )}
        {step >= 1 && m && step < 3 && (
          <div className="flex items-center gap-3 rounded-2xl bg-paper p-3 mb-6"><Img src={m.thumb} alt="" era={m.era} className="h-16 w-16 rounded-xl" /><div className="flex-1"><div className="font-semibold">{m.title}</div><div className="text-sm text-meta flex items-center gap-1.5"><Lock size={13} /> Blijft privé in je archief</div></div>{!pre && <button className="link text-sm" onClick={() => setStep(0)}>Wijzig</button>}</div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Vertel wat we zien</h2>
            <div><label className="label" htmlFor="h-t">Titel</label><input id="h-t" className="input" value={ctx.title} onChange={(e) => setCtx({ ...ctx, title: e.target.value })} /></div>
            <div><label className="label" htmlFor="h-c">Verhaal en context</label><textarea id="h-c" rows={5} className="textarea" value={ctx.context} onChange={(e) => setCtx({ ...ctx, context: e.target.value })} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="label" htmlFor="h-l">Plaats</label><input id="h-l" className="input" value={ctx.location} onChange={(e) => setCtx({ ...ctx, location: e.target.value })} /></div>
              <div><label className="label" htmlFor="h-y">Jaar</label><input id="h-y" className="input" value={ctx.year} onChange={(e) => setCtx({ ...ctx, year: e.target.value })} /></div>
              <div><label className="label" htmlFor="h-p">Personen</label><input id="h-p" className="input" value={ctx.people} onChange={(e) => setCtx({ ...ctx, people: e.target.value })} /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold">Rechten en toestemming</h2>
            <p className="text-meta">Alle vier zijn nodig. Twijfel je? Dan kun je de foto beter (nog) niet aanbieden.</p>
            <Checkbox checked={cons.owner} onChange={(v) => setCons({ ...cons, owner: v })}>Ik heb deze foto zelf gemaakt, of ik heb toestemming van de maker of rechthebbende (hier: Pieter de Wit).</Checkbox>
            <Checkbox checked={cons.recognizable} onChange={(v) => setCons({ ...cons, recognizable: v })}>Herkenbare personen zijn niet in een kwetsende of privé-situatie in beeld, of hebben toestemming gegeven.</Checkbox>
            <Checkbox checked={cons.license} onChange={(v) => setCons({ ...cons, license: v })}>Ik geef Beeld &amp; Geluid toestemming om een kopie op te nemen en te tonen onder de gekozen licentie.</Checkbox>
            <Checkbox checked={cons.review} onChange={(v) => setCons({ ...cons, review: v })}>Ik begrijp dat een archivaris beslist over opname, en dat mijn origineel privé blijft.</Checkbox>
            <div className="pt-2"><label className="label" htmlFor="lic">Licentie</label><select id="lic" className="input" value={license} onChange={(e) => setLicense(e.target.value)}><option>CC BY 4.0 · naamsvermelding</option><option>CC BY-SA 4.0 · naamsvermelding, gelijk delen</option><option>Alleen tonen bij Beeld &amp; Geluid</option></select></div>
          </div>
        )}
        {step === 3 && m && (
          <div>
            <h2 className="font-display text-xl font-bold mb-4">Overzicht</h2>
            <div className="grid sm:grid-cols-[200px_1fr] gap-5">
              <Img src={m.thumb} alt={m.alt} era={m.era} grain className="aspect-square rounded-2xl" />
              <dl className="text-[15px] space-y-2">
                {[['Titel', ctx.title], ['Plaats', ctx.location], ['Jaar', ctx.year], ['Personen', ctx.people || '—'], ['Licentie', license], ['Toestemming', allCons ? 'Alle vier bevestigd' : 'Onvolledig']].map(([k, v]) => <div key={k} className="flex gap-3"><dt className="text-meta w-28 shrink-0">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                <div className="pt-2 text-ink/80">{ctx.context}</div>
              </dl>
            </div>
            <DemoNote className="mt-6">Bij “Indienen in demo” wordt niets verstuurd of gepubliceerd. Je ziet alleen hoe de aanbieding zou verschijnen.</DemoNote>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-6">
        {step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Vorige</button>}
        <div className="ml-auto">
          {step < 3 ? <button className="btn-primary" disabled={(step === 0 && !mediaId) || (step === 1 && !ctx.title.trim()) || (step === 2 && !allCons)} onClick={() => setStep(step + 1)}>Volgende <ArrowRight size={17} /></button>
            : <button className="btn-magenta" disabled={!allCons} onClick={() => { submitHeritageDemo(mediaId, { title: ctx.title, context: ctx.context, location: ctx.location, year: ctx.year, people: ctx.people, consents: cons, license }); setDone(true); window.scrollTo({ top: 0 }) }}><Landmark size={18} /> Indienen in demo</button>}
        </div>
      </div>
      {step === 2 && !allCons && <p className="text-sm text-meta text-right mt-2">Bevestig alle vier de punten om verder te gaan.</p>}
    </div>
  )
}
