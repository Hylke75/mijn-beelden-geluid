import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
function useHashScroll() { const { hash } = useLocation(); useEffect(() => { if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80) }, [hash]) }
import { UserPlus, Eye, Users, Lock, Mail, Check, ShieldCheck, FolderOpen, Info } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { Avatar, DemoNote, Img, PageHeader, Toggle } from '../components/ui'
import type { DemoPerson } from '../data/types'
import { QuestionsSection } from '../components/AskFamily'
import { cx, fmtDate } from '../lib/format'

function PersonNode({ p, me }: { p: DemoPerson; me?: boolean }) {
  return (
    <Link to={`/fotos?persoon=${p.id}`} className="flex flex-col items-center text-center group w-[92px] sm:w-[110px]">
      <span className={cx('rounded-full p-1 transition-transform group-hover:scale-105', me ? 'bg-magenta' : 'bg-white shadow-card')}><Avatar person={p} size={me ? 84 : 68} /></span>
      <span className="font-semibold mt-2 text-[15px] leading-tight">{p.name}</span>
      <span className={cx('text-xs mt-0.5', me ? 'text-magenta font-semibold' : 'text-meta')}>{me ? 'Jij' : p.relationLabel}{p.died ? ` · †${p.died}` : ''}</span>
    </Link>
  )
}

export default function Familie() {
  useHashScroll()
  const { state, setViewAs, toast, setDocumentConsent } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const P = (id: string) => state.people.find((p) => p.id === id)!
  const members = state.people.filter((p) => p.id !== 'sanne' && p.member)
  const sharedAlbums = state.albums.filter((a) => a.sharedWith.length)
  return (
    <div>
      <PageHeader eyebrow="Samen & later" title="Familiekring" sub="Wie hoort bij jouw archief, en wie mag wat zien. Iedereen houdt controle over de eigen bestanden."
        actions={<button className="btn-primary" onClick={() => ui.open({ type: 'invite' })}><UserPlus size={18} /> Uitnodigen</button>} />

      <section className="sm:hidden card p-4 mb-8" aria-label="Familie per generatie">
        {[
          { g: 'Grootouders', ids: ['nel'] },
          { g: 'Ouders', ids: ['pieter', 'ineke'] },
          { g: 'Jij, partner en zus', ids: ['sanne', 'thomas', 'marieke'] },
          { g: 'Kinderen', ids: ['mila', 'daan'] },
        ].map((row, k) => (
          <div key={row.g} className={cx('py-3', k > 0 && 'border-t border-line')}>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-meta mb-2">{row.g}</div>
            <div className="flex gap-1">{row.ids.map((id) => <PersonNode key={id} p={P(id)} me={id === 'sanne'} />)}</div>
          </div>
        ))}
      </section>

      <section className="hidden sm:block card p-6 sm:p-10 mb-8 overflow-x-auto" aria-label="Stamboom">
        <div className="min-w-[560px] flex flex-col items-center gap-2">
          <PersonNode p={P('nel')} />
          <div className="h-6 w-px bg-line" />
          <div className="flex items-center gap-6"><PersonNode p={P('pieter')} /><span className="h-px w-10 bg-magenta/50" /><PersonNode p={P('ineke')} /></div>
          <div className="h-6 w-px bg-line" />
          <div className="relative flex items-start gap-16">
            <div className="absolute top-0 left-[55px] right-[55px] h-px bg-line" />
            <div className="flex flex-col items-center pt-6 relative"><div className="absolute top-0 h-6 w-px bg-line" />
              <div className="flex items-center gap-6"><PersonNode p={P('sanne')} me /><span className="h-px w-10 bg-magenta/50" /><PersonNode p={P('thomas')} /></div>
              <div className="h-6 w-px bg-line" />
              <div className="flex gap-6"><PersonNode p={P('mila')} /><PersonNode p={P('daan')} /></div>
            </div>
            <div className="flex flex-col items-center pt-6 relative"><div className="absolute top-0 h-6 w-px bg-line" /><PersonNode p={P('marieke')} /></div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4"><FolderOpen size={19} className="text-brand" /> Gedeelde albums</h2>
          {sharedAlbums.length ? (
            <ul className="space-y-3">
              {sharedAlbums.map((a) => { const c = state.media.find((m) => m.id === a.coverId); return (
                <li key={a.id}><Link to={`/albums/${a.id}`} className="flex items-center gap-3 group"><Img src={c?.thumb ?? ''} alt="" className="h-12 w-12 rounded-xl shrink-0" era={c?.era} /><span className="flex-1"><span className="block font-semibold group-hover:text-brand leading-tight">{a.title}</span><span className="text-sm text-meta">met {a.sharedWith.map((x) => P(x).name).join(', ')}</span></span></Link></li>) })}
            </ul>
          ) : <p className="text-meta text-[15px]">Je hebt nog geen albums gedeeld.</p>}
          <button className="btn-secondary btn-sm w-full mt-5" onClick={() => ui.open({ type: 'share', albumId: 'al-zeeland' })}><Users size={16} /> Deel “Zomers in Zeeland”</button>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4"><Mail size={19} className="text-brand" /> Uitnodigingen</h2>
          <ul className="space-y-3">
            {state.invites.map((inv) => (
              <li key={inv.id} className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-full bg-brand-light text-brand font-semibold flex items-center justify-center shrink-0">{inv.name.slice(0, 1).toUpperCase()}</span>
                <span className="flex-1 min-w-0"><span className="block font-semibold leading-tight truncate">{inv.name}</span><span className="text-sm text-meta">{inv.relation} · {fmtDate(inv.sentOn)}</span></span>
                <span className={cx('pill', inv.status === 'geaccepteerd' ? 'bg-[#E7F6EE] text-[#1E6B43]' : 'bg-[#FFF3D6] text-[#6B4A00]')}>{inv.status === 'geaccepteerd' ? <><Check size={11} /> Geaccepteerd</> : 'Verstuurd (demo)'}</span>
              </li>
            ))}
          </ul>
          <button className="btn-secondary btn-sm w-full mt-5" onClick={() => ui.open({ type: 'invite' })}><UserPlus size={16} /> Iemand uitnodigen</button>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4"><ShieldCheck size={19} className="text-brand" /> Wie ziet wat?</h2>
          <ul className="space-y-1 text-[15px]">
            <li className="flex items-center gap-2 py-1.5"><Check size={16} className="text-[#1E6B43]" /> Gedeelde albums en hun verhalen</li>
            <li className="flex items-center gap-2 py-1.5"><Lock size={16} className="text-meta" /> Je andere foto's en albums</li>
            <li className="flex items-center gap-2 py-1.5"><Lock size={16} className="text-meta" /> Je documentenkluis</li>
            <li className="flex items-center gap-2 py-1.5"><Lock size={16} className="text-meta" /> Je bewaarwensen</li>
          </ul>
          <p className="text-sm text-meta mt-3 leading-relaxed">Toegang tot je foto's betekent nooit automatisch toegang tot je documenten. Dat regel je per document, apart.</p>
        </section>
      </div>

      <QuestionsSection />

      <section className="mb-8">
        <h2 className="font-display text-2xl font-bold mb-4">Leden en toegang</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((p) => {
            const albums = state.albums.filter((a) => a.sharedWith.includes(p.id))
            const docConsent = state.documentDemoConsent.includes(p.id)
            return (
              <div key={p.id} className="card p-5">
                <div className="flex items-center gap-3"><Avatar person={p} size={52} /><div className="flex-1"><div className="font-semibold">{p.fullName}</div><div className="text-sm text-meta">{p.relationLabel} · {albums.length ? `${albums.length} gedeeld album${albums.length > 1 ? 's' : ''}` : 'nog niets gedeeld'}</div></div></div>
                <div className="flex flex-wrap gap-1.5 mt-3 min-h-[28px]">{albums.map((a) => <span key={a.id} className="pill bg-brand-light text-brand">{a.title}</span>)}</div>
                <div className="border-t border-line mt-4 -mb-2">
                  <Toggle checked={docConsent} onChange={(v) => { setDocumentConsent(p.id, v); toast({ text: v ? `Demo-toestemming: ${p.name} mag de kluis bekijken in de kijkweergave` : `${p.name} ziet de kluis niet meer`, tone: 'demo' }) }} label="Documenten (aparte toestemming)" description="Standaard uit. Alleen voor deze demonstratie." />
                </div>
                <button className="btn-secondary btn-sm w-full mt-2" disabled={!albums.length} onClick={() => { setViewAs(p.id); toast({ text: `Je bekijkt nu als ${p.name} (demonstratief)`, tone: 'demo' }); navigate('/albums') }}><Eye size={16} /> Bekijk als {p.name}</button>
                {!albums.length && <p className="text-xs text-meta mt-1.5 text-center">Deel eerst een album om de kijkweergave te zien.</p>}
              </div>
            )
          })}
        </div>
      </section>
      <DemoNote><strong>Kijkweergave is demonstratief.</strong> Er is geen echte identiteitswissel, inlog of beveiligingsmechanisme. Het laat alleen zien welke gedeelde herinneringen een familielid zou zien. <Info size={0} className="hidden" /></DemoNote>
    </div>
  )
}
