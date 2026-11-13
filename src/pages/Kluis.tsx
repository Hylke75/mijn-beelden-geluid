import { useState } from 'react'
import { LockKeyhole, FileText, Eye, Pencil, KeyRound, ShieldAlert, Lock, Upload, Search, Users, Check, HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { Avatar, DemoNote, Drawer, EmptyState, Modal, PageHeader, Checkbox } from '../components/ui'
import type { DemoDocument, DocCategory } from '../data/types'
import { cx, fmtDate } from '../lib/format'
import { canSeeDocuments } from '../lib/selectors'

const CATS: DocCategory[] = ['Persoonlijke documenten', 'Woning', 'Verzekeringen', "Diploma's", 'Familiepapieren']

export function DocThumb({ d, big }: { d: DemoDocument; big?: boolean }) {
  const scan = d.kind.toLowerCase().includes('scan')
  const handwritten = d.id === 'doc-receptenboek'
  return (
    <div className={cx('relative rounded-lg border border-line overflow-hidden', scan ? 'bg-[#FBF7EE]' : 'bg-white', big ? 'p-8 aspect-[3/4]' : 'p-3 aspect-[3/4]')} aria-hidden>
      <div className={cx('font-display font-bold text-ink/80 leading-tight', big ? 'text-lg' : 'text-[9px]')}>{d.title.replace(' (voorbeeld)', '')}</div>
      <div className={cx('mt-2 space-y-1', big && 'mt-5 space-y-2.5')}>
        {Array.from({ length: big ? 12 : 7 }, (_, i) => <div key={i} className={cx('rounded-full', handwritten ? 'bg-[#2c4a8a]/25 h-[3px]' : 'bg-ink/10', big ? 'h-2' : 'h-[3px]')} style={{ width: `${55 + ((i * 37 + d.year) % 40)}%`, transform: handwritten ? `rotate(${(i % 3) - 1}deg)` : undefined }} />)}
      </div>
      <div className={cx('absolute font-bold uppercase tracking-widest text-magenta/25 rotate-[-20deg]', big ? 'text-3xl bottom-1/3 left-6' : 'text-[10px] bottom-6 left-2')}>Voorbeeld</div>
      {big && <div className="absolute bottom-6 right-8 h-14 w-14 rounded-full border-2 border-brand/25" />}
    </div>
  )
}

export default function Kluis() {
  const { state, updateDocument, toast, setDocumentRecipient } = useDemo()
  const ui = useUI()
  const [cat, setCat] = useState<string>('')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'access' | null>(null)
  const [unlocked, setUnlocked] = useState(() => { try { return sessionStorage.getItem('mbg-vault') === '1' } catch { return false } })
  if (!canSeeDocuments(state)) return <EmptyState icon={<Lock size={26} />} title="De documentenkluis is privé" text={`${state.people.find((p) => p.id === state.viewAs)?.name} heeft geen toegang tot de documentenkluis van Sanne. Gedeelde albums geven nooit automatisch toegang tot documenten.`} />
  const docs = state.documents.filter((d) => (!cat || d.category === cat) && (!q || `${d.title} ${d.summary}`.toLowerCase().includes(q.toLowerCase())))
  const d = state.documents.find((x) => x.id === openId)
  const recipient = d && state.legacy.documentRecipients.find((r) => r.documentId === d.id)

  if (!unlocked) return (
    <div className="max-w-xl mx-auto text-center py-10 sm:py-16" data-tour="vault">
      <div className="mx-auto h-20 w-20 rounded-3xl bg-ink text-white flex items-center justify-center shadow-lift"><LockKeyhole size={36} /></div>
      <h1 className="font-display text-[34px] font-bold mt-6">Documentenkluis</h1>
      <p className="text-meta text-[17px] mt-2">Belangrijke papieren, apart van je herinneringen. Alleen jij hebt toegang, tenzij je per document iets anders regelt.</p>
      <button className="btn-primary mt-8 h-12 px-6" onClick={() => { setUnlocked(true); try { sessionStorage.setItem('mbg-vault', '1') } catch { /* */ } }}><KeyRound size={18} /> Open de kluis (demo)</button>
      <DemoNote tone="warn" className="mt-8 text-left">In deze demo worden geen echte documenten opgeslagen of beveiligd. Er is geen echte extra verificatie; de knop opent direct de voorbeeldkluis.</DemoNote>
    </div>
  )

  return (
    <div data-tour="vault">
      <PageHeader eyebrow="Bewaren" title="Documentenkluis" sub="Rustig, overzichtelijk en privé. Paspoort, polissen, diploma's en familiepapieren op één plek."
        actions={<button className="btn-primary" onClick={() => ui.open({ type: 'unavailable', title: 'Document toevoegen', text: 'In deze conceptdemo kun je geen echte documenten uploaden. De kluis toont tien fictieve voorbeelddocumenten. In de echte dienst zou je hier een scan of PDF kiezen.' })}><Upload size={18} /> Document toevoegen</button>} />
      <DemoNote tone="warn" className="mb-6"><strong>In deze demo worden geen echte documenten opgeslagen of beveiligd.</strong> Alle documenten zijn fictieve voorbeelden zonder echte nummers of persoonsgegevens.</DemoNote>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-meta" /><input className="input pl-10" placeholder="Zoek in documenten" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Zoek in documenten" /></div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          <button className={!cat ? 'chip-on' : 'chip-off'} onClick={() => setCat('')}>Alles <span className="opacity-60">{state.documents.length}</span></button>
          {CATS.map((c) => <button key={c} className={cat === c ? 'chip-on whitespace-nowrap' : 'chip-off whitespace-nowrap'} onClick={() => setCat(cat === c ? '' : c)}>{c} <span className="opacity-60">{state.documents.filter((x) => x.category === c).length}</span></button>)}
        </div>
      </div>

      {docs.length === 0 ? <EmptyState icon={<FileText size={26} />} title="Geen documenten gevonden" text="Pas je zoekopdracht of categorie aan." /> : (
        (cat ? [cat] : CATS).map((c) => {
          const list = docs.filter((x) => x.category === c)
          if (!list.length) return null
          return (
            <section key={c} className="mb-8">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-meta mb-3">{c}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {list.map((doc) => (
                  <button key={doc.id} onClick={() => { setOpenId(doc.id); setMode(null) }} className="card p-3 text-left hover:shadow-lift hover:border-[#D5DBE5] transition-all group">
                    <DocThumb d={doc} />
                    <div className="mt-3 flex items-start gap-2">
                      <div className="flex-1 min-w-0"><div className="font-semibold text-[15px] leading-tight line-clamp-2 group-hover:text-brand">{doc.title}</div><div className="text-sm text-meta mt-0.5">{doc.year} · {doc.kind}</div></div>
                      <Lock size={15} className="text-meta shrink-0 mt-0.5" aria-label="Privé" />
                    </div>
                    <div className="mt-2 text-xs">{doc.accessIds.length ? <span className="text-brand font-medium">Ook: {doc.accessIds.map((x) => state.people.find((p) => p.id === x)?.name).join(', ')}</span> : <span className="text-meta">Alleen jij</span>}</div>
                  </button>
                ))}
              </div>
            </section>
          )
        })
      )}

      <Drawer open={!!d} onClose={() => setOpenId(null)} title={d?.title ?? ''}
        footer={d && <><button className="btn-primary flex-1" onClick={() => setMode('view')}><Eye size={17} /> Bekijken</button><button className="btn-secondary" onClick={() => setMode('edit')}><Pencil size={17} /> <span className="hidden sm:inline">Informatie aanpassen</span></button><button className="btn-secondary" onClick={() => setMode('access')}><KeyRound size={17} /> <span className="hidden sm:inline">Toegang regelen</span></button></>}>
        {d && (
          <div>
            <div className="max-w-[220px] mx-auto"><DocThumb d={d} /></div>
            <div className="flex justify-center mt-4"><span className="pill bg-ink text-white"><Lock size={11} /> Privé · {d.category}</span></div>
            <p className="text-[15px] text-ink/80 mt-5 leading-relaxed">{d.summary}</p>
            <dl className="mt-5 rounded-2xl bg-paper divide-y divide-line">
              {[{ label: 'Jaar', value: String(d.year) }, { label: 'Type', value: `${d.kind} · ${d.pages} pagina${d.pages > 1 ? "'s" : ''}` }, ...d.fields, { label: 'Toegevoegd', value: fmtDate(d.added) }].map((f) => (
                <div key={f.label} className="flex gap-3 px-4 py-3 text-[15px]"><dt className="text-meta w-[130px] shrink-0">{f.label}</dt><dd className="font-medium">{f.value}</dd></div>
              ))}
            </dl>
            <div className="mt-5">
              <div className="text-sm font-semibold mb-2">Toegang</div>
              <div className="flex items-center gap-2"><Avatar person={state.people.find((p) => p.id === 'sanne')} size={30} /><span className="text-[15px]">Sanne</span>{d.accessIds.map((x) => <span key={x} className="flex items-center gap-2 ml-2"><Avatar person={state.people.find((p) => p.id === x)} size={30} /><span className="text-[15px]">{state.people.find((p) => p.id === x)?.name}</span></span>)}</div>
              <p className="text-sm text-meta mt-3 flex items-center gap-1.5"><HeartHandshake size={14} /> Later: {recipient ? `naar ${state.people.find((p) => p.id === recipient.personId)?.name} (wens)` : 'nog niets vastgelegd'} · <Link to="/nalatenschap" className="link">regelen</Link></p>
            </div>
            <DemoNote tone="warn" className="mt-6"><ShieldAlert size={0} className="hidden" />In deze demo worden geen echte documenten opgeslagen of beveiligd.</DemoNote>
          </div>
        )}
      </Drawer>

      {d && mode === 'view' && (
        <Modal open onClose={() => setMode(null)} title={d.title} subtitle="Documentvoorbeeld · fictief" size="lg">
          <div className="bg-[#E9ECF1] rounded-2xl p-4 sm:p-8"><div className="max-w-md mx-auto shadow-lift"><DocThumb d={d} big /></div></div>
          <p className="text-sm text-meta text-center mt-3">Pagina 1 van {d.pages} · Dit is een gegenereerde voorbeeldweergave, geen echt document.</p>
        </Modal>
      )}
      {d && mode === 'edit' && <EditDoc d={d} onClose={() => setMode(null)} onSave={(t, y) => { updateDocument(d.id, { title: t, year: y }); setMode(null); toast({ text: 'Documentinformatie bijgewerkt' }) }} />}
      {d && mode === 'access' && <AccessDoc d={d} onClose={() => setMode(null)} onSave={(ids, heir) => { updateDocument(d.id, { accessIds: ids }); setDocumentRecipient(d.id, heir); setMode(null); toast({ text: 'Toegang bijgewerkt (demo)' }) }} />}
    </div>
  )
}

function EditDoc({ d, onClose, onSave }: { d: DemoDocument; onClose: () => void; onSave: (t: string, y: number) => void }) {
  const [t, setT] = useState(d.title); const [y, setY] = useState(String(d.year))
  return (
    <Modal open onClose={onClose} title="Informatie aanpassen" size="sm" footer={<><button className="btn-secondary" onClick={onClose}>Annuleren</button><button className="btn-primary" disabled={!t.trim()} onClick={() => onSave(t.trim(), Number(y) || d.year)}>Opslaan</button></>}>
      <div className="space-y-4">
        <div><label className="label" htmlFor="dt">Naam</label><input id="dt" data-autofocus className="input" value={t} onChange={(e) => setT(e.target.value)} /></div>
        <div><label className="label" htmlFor="dy">Jaar</label><input id="dy" inputMode="numeric" className="input" value={y} onChange={(e) => setY(e.target.value.replace(/\D/g, '').slice(0, 4))} /></div>
      </div>
    </Modal>
  )
}

function AccessDoc({ d, onClose, onSave }: { d: DemoDocument; onClose: () => void; onSave: (ids: string[], heir: string) => void }) {
  const { state } = useDemo()
  const [ids, setIds] = useState<string[]>(d.accessIds)
  const [heir, setHeir] = useState(state.legacy.documentRecipients.find((r) => r.documentId === d.id)?.personId ?? '')
  const ppl = state.people.filter((p) => p.member && p.id !== 'sanne')
  return (
    <Modal open onClose={onClose} title="Toegang regelen" subtitle={d.title} footer={<><button className="btn-secondary" onClick={onClose}>Annuleren</button><button className="btn-primary" onClick={() => onSave(ids, heir)}><Check size={17} /> Opslaan</button></>}>
      <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Users size={16} /> Wie mag dit document nu inzien?</div>
      <div className="grid sm:grid-cols-2 gap-2">{ppl.map((p) => <Checkbox key={p.id} checked={ids.includes(p.id)} onChange={(v) => setIds((x) => v ? [...x, p.id] : x.filter((i) => i !== p.id))}>{p.name} <span className="text-meta">· {p.relationLabel}</span></Checkbox>)}</div>
      <div className="mt-6"><label className="label" htmlFor="heir">Wie mag dit later ontvangen? (bewaarwens)</label>
        <select id="heir" className="input" value={heir} onChange={(e) => setHeir(e.target.value)}><option value="">Nog niet bepaald</option>{ppl.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></div>
      <DemoNote className="mt-5">Een voorkeur voor later is nooit een automatische autorisatie. In deze demo wordt niets echt gedeeld.</DemoNote>
    </Modal>
  )
}
