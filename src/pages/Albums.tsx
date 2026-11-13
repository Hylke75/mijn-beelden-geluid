import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, Users, ArrowLeft, Share2, Eye, ImagePlus, BookOpenText, Lock, ArrowRight, X, MoreHorizontal, Gift, FolderOpen } from 'lucide-react'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { AvatarStack, EmptyState, Img, PageHeader, Avatar, Modal } from '../components/ui'
import { MediaGrid } from '../components/Media'
import { plural } from '../lib/format'
import { visibleAlbums } from '../lib/selectors'

export function AlbumsPage() {
  const { state } = useDemo()
  const ui = useUI()
  const albums = visibleAlbums(state)
  const family = state.viewAs !== 'sanne'
  return (
    <div>
      <PageHeader eyebrow="Ontdekken" title="Albums" sub={family ? `Albums die Sanne met ${state.people.find((p) => p.id === state.viewAs)?.name} heeft gedeeld.` : 'Herinneringen gebundeld rond mensen, plekken en momenten.'}
        actions={!family && <button className="btn-primary" onClick={() => ui.open({ type: 'newAlbum' })}><Plus size={18} /> Nieuw album</button>} />
      {albums.length === 0 ? (
        <EmptyState icon={<FolderOpen size={26} />} title="Nog niets gedeeld" text="Sanne heeft nog geen albums met jou gedeeld." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {albums.map((a, i) => {
            const c = state.media.find((m) => m.id === a.coverId)
            const thumbs = a.mediaIds.filter((id) => id !== a.coverId).slice(0, 2).map((id) => state.media.find((m) => m.id === id)).filter(Boolean)
            return (
              <Link key={a.id} to={`/albums/${a.id}`} className="group block tile-focus rounded-3xl">
                <div className="relative grid grid-cols-[2fr_1fr] gap-1.5 h-[240px] rounded-3xl overflow-hidden">
                  <Img src={c?.thumb ?? ''} alt={c?.alt ?? a.title} era={c?.era} grain eager={i < 3} className="h-full row-span-2" imgClassName="group-hover:scale-[1.03] transition-transform duration-700" />
                  <div className="grid grid-rows-2 gap-1.5">
                    {thumbs.length ? thumbs.map((t) => <Img key={t!.id} src={t!.thumb} alt="" era={t!.era} className="h-full" />) : <div className="bg-sand row-span-2 flex items-center justify-center text-meta text-sm p-3 text-center">Voeg foto's toe</div>}
                    {thumbs.length === 1 && <div className="bg-sand" />}
                  </div>
                  {a.createdByDemo && <span className="absolute top-3 left-3 pill bg-white text-ink">Nieuw</span>}
                </div>
                <div className="flex items-start justify-between gap-3 mt-3 px-1">
                  <div>
                    <h2 className="font-display text-[20px] font-bold leading-tight group-hover:text-brand transition-colors">{a.title}</h2>
                    <p className="text-sm text-meta mt-0.5">{plural(a.mediaIds.length, 'item', 'items')} · {a.period}</p>
                  </div>
                  {a.sharedWith.length > 0 ? <span className="flex items-center gap-1.5 pt-1"><AvatarStack people={a.sharedWith.map((id) => state.people.find((p) => p.id === id))} size={26} /></span> : <span className="pill bg-[#EEF0F3] text-ink mt-1"><Lock size={11} /> Privé</span>}
                </div>
              </Link>
            )
          })}
          {!family && (
            <button onClick={() => ui.open({ type: 'newAlbum' })} className="rounded-3xl border-2 border-dashed border-line h-[240px] flex flex-col items-center justify-center gap-2 text-meta hover:border-brand hover:text-brand transition-colors">
              <Plus size={28} /><span className="font-semibold">Nieuw album</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function AlbumDetail() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { state, setViewAs, removeMediaFromAlbum, toast, setAlbumRecipients } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const a = state.albums.find((x) => x.id === id)
  const [manage, setManage] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    if (params.get('delen') === '1' && a && state.viewAs === 'sanne') { ui.open({ type: 'share', albumId: a.id }); const n = new URLSearchParams(params); n.delete('delen'); setParams(n, { replace: true }) }
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!a) return <EmptyState icon={<FolderOpen size={26} />} title="Album niet gevonden" text="Dit album bestaat niet (meer). Misschien is de demo opnieuw gestart." action={<Link to="/albums" className="btn-primary">Naar albums</Link>} />
  const family = state.viewAs !== 'sanne'
  if (family && !a.sharedWith.includes(state.viewAs)) return <EmptyState icon={<Lock size={26} />} title="Dit album is niet gedeeld" text={`${state.people.find((p) => p.id === state.viewAs)?.name} heeft geen toegang tot dit album.`} action={<Link to="/albums" className="btn-primary">Naar gedeelde albums</Link>} />
  const cover = state.media.find((m) => m.id === a.coverId)
  const items = a.mediaIds.map((mid) => state.media.find((m) => m.id === mid)).filter(Boolean) as NonNullable<ReturnType<typeof state.media.find>>[]
  const stories = state.stories.filter((s) => s.albumIds.includes(a.id) || items.some((m) => m.storyId === s.id))
  const shared = a.sharedWith.map((pid) => state.people.find((p) => p.id === pid)).filter(Boolean)
  const legacy = state.legacy.albumRecipients.find((r) => r.albumId === a.id)

  return (
    <div>
      <button onClick={() => navigate('/albums')} className="btn-ghost btn-sm -ml-3 mb-4"><ArrowLeft size={17} /> Albums</button>
      <section className="relative rounded-3xl overflow-hidden h-[320px] sm:h-[400px] mb-8">
        {cover && <Img src={cover.src} alt={cover.alt} eager era={cover.era} grain className="absolute inset-0" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1226]/90 via-[#0B1226]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-white/80">{a.period} · {plural(items.length, 'herinnering', 'herinneringen')}</div>
            <h1 className="font-display text-[36px] sm:text-[52px] font-bold leading-[1.02] tracking-[-0.02em] mt-1">{a.title}</h1>
            <p className="text-white/85 mt-2 text-[17px]">{a.subtitle}</p>
          </div>
          {!family && (
            <div className="flex flex-wrap gap-2" data-tour="share">
              <button className="btn-white" onClick={() => ui.open({ type: 'share', albumId: a.id })}><Share2 size={18} /> Deel met familie</button>
              {a.sharedWith.length > 0 && <button className="btn h-11 bg-white/15 hover:bg-white/25 text-white backdrop-blur" onClick={() => { setViewAs(a.sharedWith.includes('ineke') ? 'ineke' : a.sharedWith[0]); toast({ text: 'Demonstratieve kijkweergave gestart', tone: 'demo' }); navigate('/albums') }}><Eye size={18} /> Bekijk als {state.people.find((p) => p.id === (a.sharedWith.includes('ineke') ? 'ineke' : a.sharedWith[0]))?.name}</button>}
            </div>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 mb-10">
        <div>
          <div className="eyebrow mb-2">Over dit album</div>
          <p className="text-[18px] leading-relaxed text-ink/85 max-w-3xl">{a.intro}</p>
          {a.chapters && (
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {a.chapters.map((ch, i) => { const m = state.media.find((x) => x.id === ch.mediaIds[0]); return (
                <a key={ch.title} href={`#hoofdstuk-${i}`} className="card overflow-hidden hover:shadow-lift transition-shadow">
                  {m && <Img src={m.thumb} alt="" era={m.era} grain className="h-28" />}
                  <div className="p-4"><div className="text-xs font-semibold text-magenta">Hoofdstuk {i + 1}</div><div className="font-display font-bold leading-snug">{ch.title}</div></div>
                </a>) })}
            </div>
          )}
        </div>
        <aside className="card p-5 h-fit">
          <h2 className="font-semibold mb-3">Wie ziet dit album</h2>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-3"><Avatar person={state.people.find((p) => p.id === 'sanne')} size={36} /><span className="flex-1 text-[15px] font-medium">Sanne (jij)</span><span className="text-xs text-meta">Eigenaar</span></li>
            {shared.map((p) => <li key={p!.id} className="flex items-center gap-3"><Avatar person={p} size={36} /><span className="flex-1 text-[15px] font-medium">{p!.name}</span><span className="text-xs text-meta">Kan bekijken</span></li>)}
          </ul>
          {!shared.length && <p className="text-sm text-meta mt-3 flex items-center gap-1.5"><Lock size={14} /> Alleen jij ziet dit album.</p>}
          {!family && <button className="btn-secondary btn-sm w-full mt-4" onClick={() => ui.open({ type: 'share', albumId: a.id })}><Users size={16} /> Toegang beheren</button>}
          {!family && (
            <div className="mt-4 pt-4 border-t border-line">
              <div className="text-sm font-semibold mb-1">Later doorgeven</div>
              {legacy ? <p className="text-sm text-meta">Gaat later naar {legacy.personIds.map((x) => state.people.find((p) => p.id === x)?.name).join(' en ')}. <Link to="/nalatenschap" className="link">Wijzig</Link></p>
                : <button className="link text-sm inline-flex items-center gap-1" onClick={() => { setAlbumRecipients(a.id, ['mila', 'daan']); toast({ text: `“${a.title}” gaat later naar Mila en Daan (wens)`, action: { label: 'Bekijk', to: '/nalatenschap' } }) }}><Gift size={14} /> Bewaar voor Mila en Daan</button>}
            </div>
          )}
        </aside>
      </div>

      {stories.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold mb-4">Verhalen in dit album</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {stories.map((s) => { const m = state.media.find((x) => x.id === s.mediaId); const n = state.people.find((p) => p.id === s.narratorId); return (
              <Link key={s.id} to={`/verhalen/${s.id}`} className="card flex overflow-hidden hover:shadow-lift transition-shadow group">
                <Img src={m?.thumb ?? ''} alt="" era={m?.era} grain className="w-32 sm:w-40 shrink-0" />
                <div className="p-5"><div className="text-xs text-meta flex items-center gap-1.5"><BookOpenText size={13} /> Verteld door {n?.name}</div><div className="font-display text-lg font-bold leading-snug mt-1 group-hover:text-brand">{s.title}</div><p className="text-sm text-meta mt-1 line-clamp-2">{s.intro}</p></div>
              </Link>) })}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-2xl font-bold">Alle herinneringen</h2>
          {!family && (
            <div className="flex gap-2 relative">
              <AddPhotosToAlbum albumId={a.id} />
              <button className="btn-secondary btn-sm" onClick={() => setMenu(true)} aria-label="Meer albumopties"><MoreHorizontal size={17} /></button>
            </div>
          )}
        </div>
        {a.chapters ? a.chapters.map((ch, i) => (
          <div key={ch.title} id={`hoofdstuk-${i}`} className="mb-10 scroll-mt-28">
            <div className="flex items-baseline gap-3 mb-1"><span className="text-sm font-semibold text-magenta">Hoofdstuk {i + 1}</span><h3 className="font-display text-xl font-bold">{ch.title}</h3></div>
            <p className="text-meta mb-4 max-w-3xl">{ch.text}</p>
            <div className="[--row:120px] sm:[--row:180px]"><MediaGrid items={ch.mediaIds.map((x) => state.media.find((m) => m.id === x)).filter(Boolean) as typeof items} listIds={items.map((x) => x.id)} /></div>
          </div>
        )) : null}
        {(() => {
          const inCh = new Set(a.chapters?.flatMap((c) => c.mediaIds) ?? [])
          const rest = items.filter((m) => !inCh.has(m.id))
          if (!rest.length && a.chapters) return null
          return rest.length ? (
            <div>
              {a.chapters && <h3 className="font-display text-xl font-bold mb-4">Later toegevoegd</h3>}
              {manage ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                  {rest.map((m) => (
                    <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden">
                      <Img src={m.thumb} alt={m.alt} era={m.era} className="absolute inset-0" />
                      <button onClick={() => { removeMediaFromAlbum(m.id, a.id); toast({ text: 'Uit album gehaald. De foto zelf staat nog in je archief.' }) }} className="absolute top-1.5 right-1.5 h-8 w-8 rounded-full bg-white text-ink shadow flex items-center justify-center" aria-label={`Haal ${m.title} uit dit album`}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              ) : <div className="[--row:120px] sm:[--row:180px]"><MediaGrid items={rest} listIds={items.map((x) => x.id)} /></div>}
            </div>
          ) : (
            <EmptyState icon={<ImagePlus size={26} />} title="Dit album is nog leeg" text="Voeg foto's toe vanuit je archief. Ze blijven ook gewoon in je galerij staan." action={<AddPhotosToAlbum albumId={a.id} primary />} />
          )
        })()}
      </section>

      <Modal open={menu} onClose={() => setMenu(false)} title="Albumopties" size="sm">
        <div className="space-y-2">
          <button className="w-full btn-secondary justify-start" onClick={() => { setMenu(false); setManage((x) => !x) }}><ImagePlus size={17} /> {manage ? 'Klaar met beheren' : "Foto's uit album halen"}</button>
          <button className="w-full btn-secondary justify-start" onClick={() => { setMenu(false); ui.open({ type: 'story', mediaId: a.coverId }) }}><BookOpenText size={17} /> Verhaal bij de omslagfoto</button>
          <Link className="w-full btn-secondary justify-start" to={`/nationaal-archief`} onClick={() => setMenu(false)}><ArrowRight size={17} /> Een foto aanbieden aan het nationaal archief</Link>
        </div>
      </Modal>
    </div>
  )
}

function AddPhotosToAlbum({ albumId, primary }: { albumId: string; primary?: boolean }) {
  const { state, addMediaToAlbum, toast } = useDemo()
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<string[]>([])
  const a = state.albums.find((x) => x.id === albumId)!
  const pool = state.media.filter((m) => !a.mediaIds.includes(m.id) && m.kind !== 'audio')
  return (
    <>
      <button className={primary ? 'btn-primary' : 'btn-secondary btn-sm'} onClick={() => { setSel([]); setOpen(true) }}><ImagePlus size={17} /> Foto's toevoegen</button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Foto's toevoegen aan “${a.title}”`} size="lg"
        footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Annuleren</button><button className="btn-primary" disabled={!sel.length} onClick={() => { addMediaToAlbum(sel, albumId); setOpen(false); toast({ text: `${sel.length} ${sel.length === 1 ? 'foto' : "foto's"} toegevoegd aan “${a.title}”` }) }}>Toevoegen ({sel.length})</button></>}>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[55vh] overflow-y-auto">
          {pool.map((m) => { const on = sel.includes(m.id); return (
            <button key={m.id} onClick={() => setSel((s) => on ? s.filter((x) => x !== m.id) : [...s, m.id])} aria-pressed={on} aria-label={m.title} className={`relative aspect-square rounded-lg overflow-hidden tile-focus ${on ? 'ring-4 ring-brand ring-inset' : ''}`}>
              <Img src={m.thumb} alt="" era={m.era} className="absolute inset-0" />
              {on && <span className="absolute top-1 right-1 h-6 w-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">{sel.indexOf(m.id) + 1}</span>}
            </button>) })}
        </div>
      </Modal>
    </>
  )
}
