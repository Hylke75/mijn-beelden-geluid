import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles, Images, CalendarRange, BookImage, BookOpenText, LockKeyhole, CloudDownload, Users, HeartHandshake, Landmark, Tv,
  Settings, LifeBuoy, RotateCcw, Search, Plus, Bell, Menu, X, Home, LayoutGrid, Eye, ChevronRight, Info, Compass, PlayCircle, LogOut, UserRound,
} from 'lucide-react'
import { Logo } from './Logo'
import { Avatar } from './ui'
import { useDemo } from '../demo/store'
import { useUI } from '../demo/ui'
import { cx } from '../lib/format'
import { personName } from '../lib/selectors'
import { SearchBox } from './SearchBox'
import { AutoPlayButton } from './AutoPlay'

export const NAV = [
  { group: 'Ontdekken', items: [
    { to: '/voor-jou', label: 'Voor jou', icon: Sparkles },
    { to: '/fotos', label: "Foto's & video's", icon: Images },
    { to: '/tijdlijn', label: 'Tijdlijn', icon: CalendarRange },
    { to: '/albums', label: 'Albums', icon: BookImage },
    { to: '/verhalen', label: 'Verhalen', icon: BookOpenText },
  ] },
  { group: 'Bewaren', items: [
    { to: '/kluis', label: 'Documentenkluis', icon: LockKeyhole },
    { to: '/bronnen', label: 'Bronnen & importeren', icon: CloudDownload },
  ] },
  { group: 'Samen & later', items: [
    { to: '/familie', label: 'Familiekring', icon: Users },
    { to: '/nalatenschap', label: 'Later doorgeven', icon: HeartHandshake },
  ] },
  { group: 'Erfgoed', items: [
    { to: '/nationaal-archief', label: 'Nationaal archief', icon: Landmark },
    { to: '/schatkamer', label: 'De Schatkamer', icon: Tv },
  ] },
]

function NavItem({ to, label, icon: Icon, onClick, hidden }: { to: string; label: string; icon: typeof Sparkles; onClick?: () => void; hidden?: boolean }) {
  return (
    <NavLink to={to} onClick={onClick} data-tour={`nav-${to.slice(1)}`}
      className={({ isActive }) => cx('group flex items-center gap-3 h-10 px-3 rounded-xl text-[15px] font-medium transition-colors duration-150',
        isActive ? 'bg-brand text-white shadow-sm' : 'text-ink/80 hover:bg-ink/[.05] hover:text-ink', hidden && 'opacity-40')}>
      <Icon size={19} strokeWidth={1.9} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useDemo()
  const ui = useUI()
  const famView = state.viewAs !== 'sanne'
  return (
    <div className="flex flex-col h-full">
      <Link to="/voor-jou" onClick={onNavigate} className="px-5 h-[72px] flex items-center shrink-0" aria-label="Mijn Beeld & Geluid, naar Voor jou"><Logo /></Link>
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none" aria-label="Hoofdnavigatie">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-meta">{g.group}</div>
            <div className="space-y-0.5">
              {g.items.map((i) => <NavItem key={i.to} {...i} onClick={onNavigate} hidden={famView && ['/kluis', '/bronnen', '/nalatenschap'].includes(i.to)} />)}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-line space-y-0.5 shrink-0">
        <NavItem to="/instellingen" label="Instellingen" icon={Settings} onClick={onNavigate} />
        <NavItem to="/hulp" label="Hulp" icon={LifeBuoy} onClick={onNavigate} />
        <button onClick={() => { onNavigate?.(); ui.open({ type: 'reset' }) }} className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-[15px] font-medium text-ink/80 hover:bg-ink/[.05]">
          <RotateCcw size={19} strokeWidth={1.9} /> Demo opnieuw starten
        </button>
      </div>
    </div>
  )
}

function Popover({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const t = setTimeout(() => document.addEventListener('mousedown', onDoc), 0)
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open, onClose])
  if (!open) return null
  return <div ref={ref} className={cx('absolute right-0 top-full mt-2 z-50 card shadow-lift animate-rise', className)}>{children}</div>
}

function AddButton() {
  const [open, setOpen] = useState(false)
  const ui = useUI()
  const items = [
    { label: "Foto's of video's toevoegen", sub: 'Van je telefoon, computer of een gekoppelde bron', icon: Images, run: () => ui.open({ type: 'addPhotos' }) },
    { label: 'Album maken', sub: 'Bundel herinneringen rond een moment', icon: BookImage, run: () => ui.open({ type: 'newAlbum' }) },
    { label: 'Een verhaal vertellen', sub: 'Schrijf of spreek het verhaal achter een foto in', icon: BookOpenText, run: () => ui.open({ type: 'story' }) },
    { label: 'Familie uitnodigen', sub: 'Deel albums met wie je wilt', icon: Users, run: () => ui.open({ type: 'invite' }) },
  ]
  return (
    <div className="relative">
      <button className="btn-magenta h-10 px-3.5 sm:px-4" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" data-tour="add">
        <Plus size={19} strokeWidth={2.4} /><span className="hidden sm:inline">Toevoegen</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="w-[340px] p-2">
        <div role="menu">
          {items.map((i) => (
            <button key={i.label} role="menuitem" onClick={() => { setOpen(false); i.run() }} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-paper text-left">
              <span className="h-10 w-10 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0"><i.icon size={19} /></span>
              <span><span className="block font-semibold text-ink">{i.label}</span><span className="block text-sm text-meta">{i.sub}</span></span>
            </button>
          ))}
        </div>
      </Popover>
    </div>
  )
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const { state, markNotificationsRead } = useDemo()
  const unread = state.notifications.filter((n) => !n.read).length
  const navigate = useNavigate()
  return (
    <div className="relative">
      <button className="btn-ghost h-10 w-10 p-0 rounded-full relative" aria-label={`Meldingen${unread ? `, ${unread} nieuw` : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Bell size={20} />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-magenta text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-paper">{unread}</span>}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="w-[360px] max-w-[calc(100vw-24px)]">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="font-display font-bold text-lg">Meldingen</h2>
          <button className="text-sm link" onClick={markNotificationsRead} disabled={!unread}>Alles gelezen</button>
        </div>
        <ul className="max-h-[360px] overflow-y-auto pb-2">
          {state.notifications.map((n) => (
            <li key={n.id}>
              <button className="w-full text-left flex gap-3 px-4 py-3 hover:bg-paper" onClick={() => { setOpen(false); markNotificationsRead(); if (n.to) navigate(n.to) }}>
                <span className={cx('mt-1.5 h-2 w-2 rounded-full shrink-0', n.read ? 'bg-transparent' : 'bg-magenta')} />
                <span className="flex-1"><span className="block text-[15px] text-ink leading-snug">{n.text}</span><span className="text-xs text-meta">{n.time}</span></span>
              </button>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2.5 border-t border-line text-xs text-meta">Voorbeeldmeldingen · er worden geen echte berichten verstuurd</div>
      </Popover>
    </div>
  )
}

function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const { state } = useDemo()
  const ui = useUI()
  const navigate = useNavigate()
  const me = state.people.find((p) => p.id === 'sanne')
  const go = (to: string) => { setOpen(false); navigate(to) }
  return (
    <div className="relative">
      <button className="flex items-center gap-2 rounded-full pl-1 pr-1 sm:pr-3 h-10 hover:bg-ink/5" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Profielmenu van Sanne">
        <Avatar person={me} size={34} />
        <span className="hidden lg:block text-[15px] font-semibold">Sanne</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} className="w-[280px] p-2">
        <div className="flex items-center gap-3 p-3">
          <Avatar person={me} size={44} />
          <div><div className="font-semibold">Sanne van Dijk</div><div className="text-sm text-meta">Familiearchief · Concept</div></div>
        </div>
        <div className="h-px bg-line my-1" />
        {[
          { l: 'Mijn profiel', i: UserRound, r: () => go('/instellingen') },
          { l: 'Instellingen', i: Settings, r: () => go('/instellingen#privacy') },
          { l: 'Hulp & veelgestelde vragen', i: LifeBuoy, r: () => go('/hulp') },
          { l: 'Over deze demo', i: Info, r: () => { setOpen(false); ui.open({ type: 'about' }) } },
          { l: 'Uitloggen', i: LogOut, r: () => { setOpen(false); ui.open({ type: 'unavailable', title: 'Uitloggen', text: 'In deze conceptdemo is er geen echte inlog. Je blijft in het fictieve archief van Sanne. Gebruik "Demo opnieuw starten" om alles terug te zetten.' }) } },
        ].map((x) => (
          <button key={x.l} onClick={x.r} className="w-full flex items-center gap-3 px-3 h-11 rounded-xl hover:bg-paper text-[15px]"><x.i size={18} className="text-meta" /> {x.l}</button>
        ))}
      </Popover>
    </div>
  )
}

function MobileMore({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-ink/40 animate-fadeIn" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-paper shadow-modal animate-[rise_.2s_ease-out]">
        <button onClick={onClose} className="absolute right-3 top-4 btn-ghost h-10 w-10 p-0 rounded-full" aria-label="Menu sluiten"><X size={20} /></button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  )
}

function BottomNav({ onMore }: { onMore: () => void }) {
  const loc = useLocation()
  const items = [
    { to: '/voor-jou', label: 'Voor jou', icon: Home },
    { to: '/fotos', label: "Foto's", icon: Images },
    { to: '/albums', label: 'Albums', icon: BookImage },
  ]
  const mainActive = items.some((i) => loc.pathname.startsWith(i.to))
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Snelmenu">
      <div className="grid grid-cols-4 h-16">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => cx('flex flex-col items-center justify-center gap-0.5 text-[12px] font-semibold', isActive ? 'text-brand' : 'text-meta')}>
            <i.icon size={22} strokeWidth={1.9} />{i.label}
          </NavLink>
        ))}
        <button onClick={onMore} className={cx('flex flex-col items-center justify-center gap-0.5 text-[12px] font-semibold', !mainActive ? 'text-brand' : 'text-meta')}>
          <LayoutGrid size={22} strokeWidth={1.9} />Meer
        </button>
      </div>
    </nav>
  )
}

function ViewAsBanner() {
  const { state, setViewAs } = useDemo()
  const navigate = useNavigate()
  if (state.viewAs === 'sanne') return null
  const name = personName(state, state.viewAs)
  return (
    <div className="sticky top-0 z-[45] bg-magenta text-white" role="status">
      <div className="max-w-content mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
        <Eye size={18} className="shrink-0" />
        <span className="flex-1 min-w-[200px]"><strong>Demonstratieve kijkweergave:</strong> zo ziet {name} jouw gedeelde herinneringen. Geen echte inlog of identiteitswissel.</span>
        <button className="btn h-9 px-3 bg-white text-magenta-dark hover:bg-white/90 text-sm" onClick={() => { setViewAs('sanne'); navigate('/familie') }}>Terug naar Sanne</button>
      </div>
    </div>
  )
}

export function DemoIndicator() {
  const ui = useUI()
  return (
    <button onClick={() => ui.open({ type: 'about' })}
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#FFF3D6] text-[#6B4A00] text-[12px] font-semibold border border-[#F3DFB4] hover:bg-[#FFEBC0] whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full bg-[#D99500]" /> Demo-omgeving · fictieve gegevens
    </button>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [more, setMore] = useState(false)
  const ui = useUI()
  const [params] = useSearchParams()
  const loc = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => { if (!params.get('m')) window.scrollTo({ top: 0 }) }, [loc.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn-primary">Naar de inhoud</a>
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-[248px] bg-paper border-r border-line z-30"><SidebarContent /></aside>
      <MobileMore open={more} onClose={() => setMore(false)} />
      <div className="lg:pl-[248px] overflow-x-clip">
        <ViewAsBanner />
        <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-line/70">
          <div className="max-w-content mx-auto h-[64px] lg:h-[72px] px-4 sm:px-8 flex items-center gap-3">
            <button className="lg:hidden btn-ghost h-10 w-10 p-0 -ml-2 rounded-full" onClick={() => setMore(true)} aria-label="Menu openen"><Menu size={22} /></button>
            <Link to="/voor-jou" className="lg:hidden mr-auto" aria-label="Naar Voor jou"><Logo /></Link>
            <div className="hidden md:block flex-1 max-w-[560px]" data-tour="search"><SearchBox /></div>
            <div className="hidden xl:block ml-2"><DemoIndicator /></div>
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              <Link to="/zoeken" className="md:hidden btn-ghost h-10 w-10 p-0 rounded-full" aria-label="Zoeken"><Search size={20} /></Link>
              <AddButton />
              <Notifications />
              <ProfileMenu />
            </div>
          </div>
          <div className="xl:hidden border-t border-line/60 px-4 sm:px-8 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <DemoIndicator />
            <AutoPlayButton compact className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-ink text-white text-[12px] font-semibold whitespace-nowrap" />
            <button onClick={() => ui.open({ type: 'wow' })} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white border border-line text-[12px] font-semibold text-ink whitespace-nowrap"><Compass size={13} /> Ontdek de mogelijkheden</button>
            <button onClick={() => ui.open({ type: 'tourIntro' })} className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white border border-line text-[12px] font-semibold text-ink whitespace-nowrap"><PlayCircle size={13} /> Rondleiding</button>
          </div>
        </header>
        <main id="main" ref={mainRef} className="max-w-content mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-28 lg:pb-16 outline-none" tabIndex={-1}>
          {children}
        </main>
        <footer className="max-w-content mx-auto px-4 sm:px-8 pb-28 lg:pb-10 text-sm text-meta flex flex-wrap gap-x-6 gap-y-2">
          <span>Mijn Beeld &amp; Geluid · conceptdemo</span>
          <button className="hover:text-ink underline-offset-4 hover:underline" onClick={() => ui.open({ type: 'about' })}>Over deze demo</button>
          <Link to="/hulp" className="hover:text-ink underline-offset-4 hover:underline">Hulp</Link>
          <button className="hover:text-ink underline-offset-4 hover:underline" onClick={() => ui.open({ type: 'reset' })}>Demo opnieuw starten</button>
          <span className="inline-flex items-center gap-1">Interactieve demo · fictieve gegevens <ChevronRight size={14} className="hidden" /></span>
        </footer>
      </div>
      <BottomNav onMore={() => setMore(true)} />
    </div>
  )
}
