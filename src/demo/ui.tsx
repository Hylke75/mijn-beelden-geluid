import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Id } from '../data/types'

export type ModalSpec =
  | { type: 'addPhotos' }
  | { type: 'newAlbum'; mediaIds?: Id[] }
  | { type: 'addToAlbum'; mediaIds: Id[] }
  | { type: 'story'; mediaId?: Id; audio?: boolean }
  | { type: 'invite' }
  | { type: 'share'; albumId: Id }
  | { type: 'about' }
  | { type: 'wow' }
  | { type: 'tourIntro' }
  | { type: 'reset' }
  | { type: 'shareMedia'; mediaId: Id }
  | { type: 'download'; mediaId: Id }
  | { type: 'unavailable'; title: string; text?: string }

interface UI {
  modal: ModalSpec | null
  open: (m: ModalSpec) => void
  close: () => void
  tourStep: number | null
  setTourStep: (n: number | null) => void
  autoplay: boolean
  setAutoplay: (v: boolean) => void
}
const UICtx = createContext<UI | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalSpec | null>(null)
  const [tourStep, setTourStepRaw] = useState<number | null>(() => {
    try { const v = sessionStorage.getItem('mbg-tour-step'); return v ? Number(v) : null } catch { return null }
  })
  const setTourStep = useCallback((n: number | null) => {
    setTourStepRaw(n)
    try { if (n == null) sessionStorage.removeItem('mbg-tour-step'); else sessionStorage.setItem('mbg-tour-step', String(n)) } catch { /* */ }
  }, [])
  const [autoplay, setAutoplay] = useState(false)
  const open = useCallback((m: ModalSpec) => setModal(m), [])
  const close = useCallback(() => setModal(null), [])
  const v = useMemo(() => ({ modal, open, close, tourStep, setTourStep, autoplay, setAutoplay }), [modal, open, close, tourStep, setTourStep, autoplay])
  return <UICtx.Provider value={v}>{children}</UICtx.Provider>
}
export function useUI() {
  const c = useContext(UICtx)
  if (!c) throw new Error('useUI buiten provider')
  return c
}
