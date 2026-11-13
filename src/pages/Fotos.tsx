import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckSquare, X, FolderPlus, Heart, Plus, ImageOff, ArrowDownUp, BookOpenText, Trash2 } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { MediaGrid } from '../components/Media'
import { FilterSelect } from '../components/FilterSelect'
import { EmptyState, PageHeader } from '../components/ui'
import { cx } from '../lib/format'
import { SOURCE_LABEL, visibleMedia } from '../lib/selectors'

const TABS = [
  { v: '', l: 'Alles' }, { v: 'fotos', l: "Foto's" }, { v: 'videos', l: "Video's" }, { v: 'audio', l: 'Audio' }, { v: 'favorieten', l: 'Favorieten' },
]

export default function Fotos() {
  const { state, toggleFavorite, toast } = useDemo()
  const ui = useUI()
  const [p, setP] = useSearchParams()
  const set = (k: string, v: string) => { const n = new URLSearchParams(p); if (v) n.set(k, v); else n.delete(k); n.delete('m'); setP(n, { replace: true }) }
  const filter = p.get('filter') ?? '', year = p.get('jaar') ?? '', person = p.get('persoon') ?? '', place = p.get('plaats') ?? '', source = p.get('bron') ?? '', sort = p.get('sort') ?? 'nieuw'
  const [select, setSelect] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const base = visibleMedia(state)

  const items = useMemo(() => {
    let l = base.filter((m) =>
      (!filter || (filter === 'fotos' && m.kind === 'photo') || (filter === 'videos' && m.kind === 'video') || (filter === 'audio' && m.kind === 'audio') || (filter === 'favorieten' && m.favorite)) &&
      (!year || m.dateTaken.startsWith(year)) &&
      (!person || m.peopleIds.includes(person)) && (!place || m.location === place) && (!source || m.sourceId === source))
    l = [...l].sort((a, b) => sort === 'oud' ? a.dateTaken.localeCompare(b.dateTaken) : sort === 'toegevoegd' ? (b.importedAt ?? '').localeCompare(a.importedAt ?? '') || b.dateTaken.localeCompare(a.dateTaken) : b.dateTaken.localeCompare(a.dateTaken))
    return l
  }, [base, filter, year, person, place, source, sort])

  const years = Array.from(new Set(base.map((m) => m.dateTaken.slice(0, 4)))).sort().reverse()
  const places = Array.from(new Set(base.map((m) => m.location))).sort()
  const anyFilter = year || person || place || source
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const exit = () => { setSelect(false); setSel(new Set()) }
  const family = state.viewAs !== 'sanne'

  return (
    <div>
      <PageHeader eyebrow="Ontdekken" title="Foto's & video's" sub={family ? `Alleen wat met ${state.people.find((x) => x.id === state.viewAs)?.name} is gedeeld.` : `${base.length} herinneringen uit 1975 tot nu, privé tenzij je ze deelt.`}
        actions={!family && <>
          <button className={select ? 'btn-primary' : 'btn-secondary'} onClick={() => (select ? exit() : setSelect(true))} aria-pressed={select}><CheckSquare size={18} /> {select ? 'Klaar met selecteren' : 'Selecteren'}</button>
          <button className="btn-magenta" onClick={() => ui.open({ type: 'addPhotos' })}><Plus size={18} /> Toevoegen</button>
        </>} />

      <div data-tour="filters" className="sticky top-[64px] lg:top-[72px] z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-paper/95 backdrop-blur border-b border-line/70 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="flex rounded-full bg-white border border-line p-1 shrink-0" role="tablist" aria-label="Soort">
            {TABS.map((t) => (
              <button key={t.v} role="tab" aria-selected={filter === t.v} onClick={() => set('filter', t.v)}
                className={cx('h-8 px-3.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors', filter === t.v ? 'bg-ink text-white' : 'text-ink/70 hover:text-ink')}>
                {t.v === 'favorieten' && <Heart size={13} className="inline -mt-0.5 mr-1" fill={filter === t.v ? 'currentColor' : 'none'} />}{t.l}
              </button>
            ))}
          </div>
          <span className="w-px h-6 bg-line mx-1 shrink-0" />
          <FilterSelect label="Jaar" value={year} onChange={(v) => set('jaar', v)} options={years.map((y) => ({ value: y, label: y, count: base.filter((m) => m.dateTaken.startsWith(y)).length }))} />
          <FilterSelect label="Personen" value={person} onChange={(v) => set('persoon', v)} options={state.people.map((x) => ({ value: x.id, label: x.name, count: base.filter((m) => m.peopleIds.includes(x.id)).length })).filter((o) => o.count)} />
          <FilterSelect label="Plaats" value={place} onChange={(v) => set('plaats', v)} options={places.map((x) => ({ value: x, label: x, count: base.filter((m) => m.location === x).length }))} />
          <FilterSelect label="Bron" value={source} onChange={(v) => set('bron', v)} options={Object.keys(SOURCE_LABEL).map((x) => ({ value: x, label: SOURCE_LABEL[x], count: base.filter((m) => m.sourceId === x).length })).filter((o) => o.count)} />
          {anyFilter && <button className="btn-ghost btn-sm text-brand shrink-0" onClick={() => { const n = new URLSearchParams(); if (filter) n.set('filter', filter); setP(n, { replace: true }) }}>Wis filters</button>}
          <div className="ml-auto shrink-0 flex items-center gap-2 pl-2">
            <ArrowDownUp size={16} className="text-meta" />
            <label htmlFor="sort" className="sr-only">Sorteren</label>
            <select id="sort" value={sort} onChange={(e) => set('sort', e.target.value === 'nieuw' ? '' : e.target.value)} className="h-9 rounded-full border border-line bg-white px-3 text-base sm:text-sm font-medium">
              <option value="nieuw">Nieuwste eerst</option><option value="oud">Oudste eerst</option><option value="toegevoegd">Laatst toegevoegd</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm text-meta" aria-live="polite">
        <span>{items.length} {items.length === 1 ? 'resultaat' : 'resultaten'}{filter === 'favorieten' && ' in Favorieten'}</span>
        {select && <span className="font-semibold text-ink">{sel.size} geselecteerd</span>}
      </div>

      {items.length === 0 ? (
        filter === 'favorieten' && !anyFilter ? (
          <EmptyState icon={<Heart size={26} />} title="Nog geen favorieten" text="Tik op het hartje bij een foto om hem hier te bewaren. Favorieten vind je altijd snel terug." action={<button className="btn-primary" onClick={() => set('filter', '')}>Bekijk alle foto's</button>} />
        ) : (
          <EmptyState icon={<ImageOff size={26} />} title="Geen herinneringen gevonden" text="Er zijn geen foto's of video's die bij deze filters passen. Probeer een ander jaar of een andere persoon." action={<button className="btn-primary" onClick={() => setP(new URLSearchParams(), { replace: true })}>Wis alle filters</button>} />
        )
      ) : (
        <div className="[--row:120px] sm:[--row:190px] xl:[--row:230px]">
          <MediaGrid items={items} selectMode={select} selected={sel} onToggle={toggle} />
        </div>
      )}

      {select && (
        <div className="fixed z-[45] left-1/2 -translate-x-1/2 bottom-[84px] lg:bottom-6 lg:ml-[124px] card shadow-modal px-3 py-2.5 flex items-center gap-2 animate-rise max-w-[calc(100vw-24px)] overflow-x-auto" role="toolbar" aria-label="Acties voor selectie">
          <span className="px-2 text-sm font-semibold whitespace-nowrap">{sel.size} gekozen</span>
          <button className="btn-secondary btn-sm" disabled={!sel.size} onClick={() => { ui.open({ type: 'addToAlbum', mediaIds: [...sel] }); exit() }}><FolderPlus size={16} /> <span className="hidden sm:inline">Aan album</span></button>
          <button className="btn-secondary btn-sm" disabled={!sel.size} onClick={() => { ui.open({ type: 'newAlbum', mediaIds: [...sel] }); exit() }}><Plus size={16} /> <span className="hidden sm:inline">Nieuw album</span></button>
          <button className="btn-secondary btn-sm" disabled={!sel.size} onClick={() => { const ids = [...sel]; ids.forEach((id) => { const m = state.media.find((x) => x.id === id); if (m && !m.favorite) toggleFavorite(id) }); toast({ text: `${ids.length} toegevoegd aan Favorieten`, action: { label: 'Bekijk', to: '/fotos?filter=favorieten' } }); exit() }}><Heart size={16} /> <span className="hidden sm:inline">Favoriet</span></button>
          <button className="btn-secondary btn-sm" disabled={sel.size !== 1} onClick={() => { ui.open({ type: 'story', mediaId: [...sel][0] }); exit() }} title="Kies één foto"><BookOpenText size={16} /> <span className="hidden sm:inline">Verhaal</span></button>
          <button className="btn-secondary btn-sm" disabled={!sel.size} onClick={() => ui.open({ type: 'unavailable', title: 'Verwijderen', text: 'Verwijderen is in deze conceptdemo uitgeschakeld, zodat de voorbeeldfamilie compleet blijft. In de echte dienst zou je hier kunnen kiezen tussen “uit dit archief” en “ook uit de bron”.' })}><Trash2 size={16} /></button>
          <button className="btn-ghost btn-sm" onClick={exit} aria-label="Selectie annuleren"><X size={16} /></button>
        </div>
      )}
    </div>
  )
}
