import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircleQuestion, Send, Mic, Check, Clock } from 'lucide-react'
import { useDemo } from '../demo/store'
import { Avatar, Modal } from './ui'
import { cx, fmtDate } from '../lib/format'

const SUGGESTIONS: Record<string, string[]> = {
  ineke: ['Wat was je eerste baan?', 'Hoe heb je papa leren kennen?', 'Wat at je als kind op zondag?'],
  pieter: ['Welke dia zou je als eerste redden?', 'Hoe was school in de jaren vijftig?', 'Wat weet je nog van je eigen opa?'],
  marieke: ['Wat herinner je je van oma Nel?', 'Wat was jouw favoriete vakantie?'],
  thomas: ['Wat wil je dat de kinderen later over ons weten?'],
}

/** Stuurt de vraag (demo) en laat na enkele seconden een gesimuleerd antwoord binnenkomen. */
export function useAsk() {
  const { askQuestion, answerQuestion, toast, state } = useDemo()
  return (toId: string, question: string) => {
    const qid = askQuestion(toId, question)
    const name = state.people.find((p) => p.id === toId)?.name
    toast({ text: `Vraag klaargezet voor ${name}. Er wordt niets echt verstuurd.`, tone: 'demo' })
    window.setTimeout(() => {
      const sid = answerQuestion(qid)
      toast({ text: `${name} heeft geantwoord met een ingesproken verhaal (demo)`, action: { label: 'Luister', to: `/verhalen/${sid}` } })
    }, 6500)
  }
}

export function AskFamilyModal({ open, onClose, initialTo = 'ineke' }: { open: boolean; onClose: () => void; initialTo?: string }) {
  const { state } = useDemo()
  const ask = useAsk()
  const [to, setTo] = useState(initialTo)
  const [q, setQ] = useState(SUGGESTIONS[initialTo]?.[0] ?? '')
  const ppl = state.people.filter((p) => SUGGESTIONS[p.id])
  return (
    <Modal open={open} onClose={onClose} title="Vraag het aan de familie" subtitle="Eén vraag, één verhaal. Het antwoord wordt bewaard bij jullie herinneringen." size="md"
      footer={<><button className="btn-secondary" onClick={onClose}>Annuleren</button><button className="btn-magenta" disabled={!q.trim()} onClick={() => { ask(to, q.trim()); onClose() }}><Send size={17} /> Vraag versturen (demo)</button></>}>
      <div className="label">Aan wie?</div>
      <div className="flex flex-wrap gap-2 mb-5">
        {ppl.map((p) => <button key={p.id} onClick={() => { setTo(p.id); setQ(SUGGESTIONS[p.id][0]) }} aria-pressed={to === p.id} className={cx('inline-flex items-center gap-2 h-10 pl-1 pr-3 rounded-full border text-sm font-medium', to === p.id ? 'border-magenta bg-magenta-light text-magenta-dark' : 'border-line')}><Avatar person={p} size={30} />{p.name}</button>)}
      </div>
      <label className="label" htmlFor="ask-q">Jouw vraag</label>
      <textarea id="ask-q" rows={2} className="textarea" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="flex flex-wrap gap-2 mt-3">{(SUGGESTIONS[to] ?? []).map((s) => <button key={s} className="chip-off h-8 text-[13px]" onClick={() => setQ(s)}>{s}</button>)}</div>
      <div className="mt-5 rounded-2xl bg-paper p-4 flex gap-3 text-[14px] text-ink/80"><Mic size={18} className="text-magenta shrink-0 mt-0.5" /><span>In het concept krijgt {state.people.find((p) => p.id === to)?.name} een bericht en kan ze of hij antwoorden door het verhaal in te spreken, <strong>zonder app of account</strong>. In deze demo komt na een paar seconden een voorbeeldantwoord binnen.</span></div>
    </Modal>
  )
}

export function AskFamilyCard() {
  const { state } = useDemo()
  const [open, setOpen] = useState(false)
  const ineke = state.people.find((p) => p.id === 'ineke')
  const open_ = state.questions.filter((q) => q.status !== 'beantwoord').length
  return (
    <div className="rounded-2xl p-6 bg-white border border-line flex flex-col">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-xl bg-magenta-light text-magenta flex items-center justify-center"><MessageCircleQuestion size={22} /></span>
        <div><div className="text-sm text-meta">Vraag van de week</div><div className="font-display font-bold text-lg leading-tight">Vraag het aan de familie</div></div>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-paper p-3">
        <Avatar person={ineke} size={40} />
        <p className="text-[15px] italic text-ink/85">“Oma, wat was je eerste baan?”</p>
      </div>
      <p className="text-sm text-meta mt-3">Verhalen die anders verloren gaan, ingesproken door wie ze nog weet.{open_ > 0 && ` ${open_} vraag open.`}</p>
      <div className="flex gap-2 mt-auto pt-4">
        <button className="btn-primary btn-sm h-10" onClick={() => setOpen(true)}><Send size={15} /> Stel een vraag</button>
        <Link to="/familie#vragen" className="btn-secondary btn-sm h-10">Bekijk vragen</Link>
      </div>
      {open && <AskFamilyModal open onClose={() => setOpen(false)} />}
    </div>
  )
}

export function QuestionsSection() {
  const { state, answerQuestion, toast } = useDemo()
  const [open, setOpen] = useState(false)
  return (
    <section id="vragen" className="mb-8 scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div><h2 className="font-display text-2xl font-bold">Vragen aan de familie</h2><p className="text-meta">Stel een vraag; het antwoord wordt een verhaal in jullie archief.</p></div>
        <button className="btn-magenta" onClick={() => setOpen(true)}><Send size={17} /> Stel een vraag</button>
      </div>
      <div className="card divide-y divide-line">
        {state.questions.map((q) => { const p = state.people.find((x) => x.id === q.toId); return (
          <div key={q.id} className="flex flex-wrap items-center gap-3 p-4">
            <Avatar person={p} size={40} />
            <div className="flex-1 min-w-[200px]"><div className="font-semibold">“{q.question}”</div><div className="text-sm text-meta">Aan {p?.name} · {fmtDate(q.askedOn)}</div></div>
            {q.status === 'beantwoord' ? (
              <Link to={`/verhalen/${q.storyId}`} className="pill h-8 px-3 bg-[#E7F6EE] text-[#1E6B43]"><Check size={13} /> Beantwoord · luister</Link>
            ) : (
              <>
                <span className="pill bg-[#FFF3D6] text-[#6B4A00]"><Clock size={12} /> Wacht op antwoord (demo)</span>
                <button className="btn-secondary btn-sm" onClick={() => { const sid = answerQuestion(q.id); toast({ text: `${p?.name} heeft geantwoord (gesimuleerd)`, action: { label: 'Luister', to: `/verhalen/${sid}` } }) }}>Simuleer antwoord</button>
              </>
            )}
          </div>) })}
        {!state.questions.length && <p className="p-5 text-meta">Nog geen vragen gesteld.</p>}
      </div>
      {open && <AskFamilyModal open onClose={() => setOpen(false)} />}
    </section>
  )
}
