import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { MediaViewer } from './components/MediaViewer'
import { GlobalModals } from './components/GlobalModals'
import { Toasts } from './components/Toasts'
import { TourPanel, PresenterPanel, WelcomePanel } from './components/Tour'
import { AutoPlayer } from './components/AutoPlay'
import { useDemo } from './demo/store'
import VoorJou from './pages/VoorJou'
import Fotos from './pages/Fotos'
import FotoDetail from './pages/FotoDetail'
import Tijdlijn from './pages/Tijdlijn'
import TimeMachine from './pages/TimeMachine'
import { AlbumsPage, AlbumDetail } from './pages/Albums'
import { VerhalenPage, VerhaalDetail } from './pages/Verhalen'
import Familie from './pages/Familie'
import Kluis from './pages/Kluis'
import Bronnen from './pages/Bronnen'
import Nalatenschap, { LegacyPreview } from './pages/Nalatenschap'
import NationaalArchief, { HeritageWizard } from './pages/NationaalArchief'
import Schatkamer from './pages/Schatkamer'
import { Instellingen, Zoeken, Hulp, NotFound } from './pages/Overig'

const TITLES: Record<string, string> = {
  'voor-jou': 'Voor jou', fotos: "Foto's & video's", foto: 'Herinnering', tijdlijn: 'Tijdlijn', tijdmachine: 'Tijdmachine', albums: 'Albums', verhalen: 'Verhalen',
  familie: 'Familiekring', kluis: 'Documentenkluis', bronnen: 'Bronnen & importeren', nalatenschap: 'Later doorgeven', 'nationaal-archief': 'Nationaal archief',
  schatkamer: 'De Schatkamer', instellingen: 'Instellingen', zoeken: 'Zoeken', hulp: 'Hulp',
}

export default function App() {
  const loc = useLocation()
  const { state } = useDemo()
  useEffect(() => { document.title = `${TITLES[loc.pathname.split('/')[1]] ?? 'Mijn Beeld & Geluid'} · Mijn Beeld & Geluid (demo)` }, [loc.pathname])
  useEffect(() => {
    document.documentElement.style.fontSize = state.settings.largeText ? '112.5%' : ''
    document.documentElement.classList.toggle('reduce-motion', state.settings.reduceMotion)
  }, [state.settings.largeText, state.settings.reduceMotion])
  const full = loc.pathname === '/tijdmachine' || loc.pathname === '/nalatenschap/voorbeeld'
  return (
    <>
      {full ? (
        <Routes>
          <Route path="/tijdmachine" element={<TimeMachine />} />
          <Route path="/nalatenschap/voorbeeld" element={<LegacyPreview />} />
        </Routes>
      ) : (
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/voor-jou" replace />} />
            <Route path="/voor-jou" element={<VoorJou />} />
            <Route path="/fotos" element={<Fotos />} />
            <Route path="/foto/:id" element={<FotoDetail />} />
            <Route path="/tijdlijn" element={<Tijdlijn />} />
            <Route path="/albums" element={<AlbumsPage />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/verhalen" element={<VerhalenPage />} />
            <Route path="/verhalen/:id" element={<VerhaalDetail />} />
            <Route path="/familie" element={<Familie />} />
            <Route path="/kluis" element={<Kluis />} />
            <Route path="/bronnen" element={<Bronnen />} />
            <Route path="/nalatenschap" element={<Nalatenschap />} />
            <Route path="/nationaal-archief" element={<NationaalArchief />} />
            <Route path="/nationaal-archief/aanbieden" element={<HeritageWizard />} />
            <Route path="/schatkamer" element={<Schatkamer />} />
            <Route path="/instellingen" element={<Instellingen />} />
            <Route path="/zoeken" element={<Zoeken />} />
            <Route path="/hulp" element={<Hulp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      )}
      <MediaViewer />
      <GlobalModals />
      <TourPanel />
      <PresenterPanel />
      <WelcomePanel />
      <AutoPlayer />
      <Toasts />
    </>
  )
}
