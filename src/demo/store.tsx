import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { DemoAlbum, DemoHeritageSubmission, DemoLegacyWish, DemoMedia, DemoSettings, DemoState, DemoStory, Id } from '../data/types'
import { createSeed, SEED_VERSION } from '../data/seed'

export const STORAGE_KEY = 'mbg-demo-v2'

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed.version === SEED_VERSION) return parsed
    }
  } catch {
    /* lege of geblokkeerde opslag: begin met seed */
  }
  return createSeed()
}

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const today = () => new Date().toISOString().slice(0, 10)

export type Toast = { id: string; text: string; tone?: 'success' | 'info' | 'demo'; action?: { label: string; to: string } }

interface Ctx {
  state: DemoState
  toasts: Toast[]
  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  toggleFavorite: (mediaId: Id) => void
  createAlbum: (title: string, selectedMediaIds: Id[], coverId?: Id) => DemoAlbum
  addMediaToAlbum: (mediaId: Id | Id[], albumId: Id) => void
  removeMediaFromAlbum: (mediaId: Id, albumId: Id) => void
  addStory: (mediaId: Id, story: { title: string; body: string; date?: string; peopleIds: Id[]; audio?: boolean }) => DemoStory
  shareAlbum: (albumId: Id, personIds: Id[]) => void
  unshareAlbum: (albumId: Id, personId: Id) => void
  invitePerson: (name: string, email: string | undefined, relation: string, albumIds: Id[]) => void
  completeImport: (sourceId: Id, chosenItems: Id[]) => Id[]
  connectSource: (sourceId: Id) => void
  disconnectSource: (sourceId: Id) => void
  updateLegacyWish: (wish: Partial<DemoLegacyWish> & { recipientId: Id }) => DemoLegacyWish
  removeLegacyWish: (id: Id) => void
  setLegacyContacts: (primary: Id, secondary: Id) => void
  setLegacyLetter: (text: string) => void
  setDocumentRecipient: (documentId: Id, personId: Id | '') => void
  setAlbumRecipients: (albumId: Id, personIds: Id[]) => void
  submitHeritageDemo: (mediaId: Id, context: Omit<DemoHeritageSubmission, 'id' | 'mediaId' | 'status' | 'submittedOn'>) => DemoHeritageSubmission
  withdrawSubmission: (id: Id) => void
  attachSchatkamerReference: (storyId: Id, fragmentId: Id) => void
  detachSchatkamerReference: (storyId: Id, fragmentId: Id) => void
  saveFragment: (fragmentId: Id) => void
  updateMedia: (mediaId: Id, patch: Partial<DemoMedia>) => void
  updateDocument: (docId: Id, patch: { title?: string; year?: number; accessIds?: Id[] }) => void
  updateSettings: (patch: Partial<DemoSettings>) => void
  setViewAs: (personId: Id) => void
  markNotificationsRead: () => void
  setTourDone: (v: boolean) => void
  keepStoryFor: (storyId: Id, personId: Id) => void
  setDocumentConsent: (personId: Id, on: boolean) => void
  resetDemo: () => void
}

const DemoContext = createContext<Ctx | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load)
  const [toasts, setToasts] = useState<Toast[]>([])
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* opslag niet beschikbaar */ }
  }, [state])

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uid('t')
    setToasts((all) => [...all.slice(-2), { ...t, id }])
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 4800)
  }, [])

  const notify = (s: DemoState, text: string): DemoState => ({
    ...s, notifications: [{ id: uid('n'), text, time: 'Zojuist', read: false }, ...s.notifications].slice(0, 20),
  })

  const api = useMemo<Omit<Ctx, 'state' | 'toasts' | 'toast' | 'dismissToast'>>(() => ({
    toggleFavorite: (mediaId) => {
      setState((s) => ({ ...s, media: s.media.map((m) => (m.id === mediaId ? { ...m, favorite: !m.favorite } : m)) }))
    },
    createAlbum: (title, selectedMediaIds, coverId) => {
      const album: DemoAlbum = {
        id: uid('album'), title, subtitle: `${selectedMediaIds.length} ${selectedMediaIds.length === 1 ? 'herinnering' : 'herinneringen'}`,
        coverId: coverId ?? selectedMediaIds[0] ?? 'm-2024-beach-family', mediaIds: [...selectedMediaIds],
        intro: 'Een nieuw album, gemaakt in deze demo. Voeg foto\'s toe vanuit de galerij of de lichtbak.', period: String(new Date().getFullYear()),
        sharedWith: [], createdByDemo: true, storyIds: [],
      }
      setState((s) => ({ ...s, albums: [album, ...s.albums] }))
      return album
    },
    addMediaToAlbum: (mediaId, albumId) => {
      const ids = Array.isArray(mediaId) ? mediaId : [mediaId]
      setState((s) => ({ ...s, albums: s.albums.map((a) => (a.id === albumId ? { ...a, mediaIds: [...a.mediaIds, ...ids.filter((i) => !a.mediaIds.includes(i))] } : a)) }))
    },
    removeMediaFromAlbum: (mediaId, albumId) => {
      setState((s) => ({ ...s, albums: s.albums.map((a) => (a.id === albumId ? { ...a, mediaIds: a.mediaIds.filter((i) => i !== mediaId), coverId: a.coverId === mediaId ? (a.mediaIds.find((i) => i !== mediaId) ?? a.coverId) : a.coverId } : a)) }))
    },
    addStory: (mediaId, { title, body, date, peopleIds, audio }) => {
      const story: DemoStory = {
        id: uid('story'), title, narratorId: 'sanne', date: date || today(), writtenOn: today(), mediaId, linkedMediaIds: [], peopleIds,
        albumIds: [], intro: body.split(/\n+/)[0].slice(0, 180), body: body.split(/\n+/).filter(Boolean), createdByDemo: true, schatkamerIds: [],
        audioId: audio ? 'demo-audio-recording' : undefined,
      }
      setState((s) => {
        const albumIds = s.albums.filter((a) => a.mediaIds.includes(mediaId)).map((a) => a.id)
        return {
          ...s, stories: [{ ...story, albumIds }, ...s.stories],
          media: s.media.map((m) => (m.id === mediaId ? { ...m, storyId: story.id } : m)),
        }
      })
      return story
    },
    shareAlbum: (albumId, personIds) => {
      setState((s) => {
        const albums = s.albums.map((a) => (a.id === albumId ? { ...a, sharedWith: Array.from(new Set([...a.sharedWith, ...personIds])) } : a))
        const permissions = [...s.permissions]
        personIds.forEach((pid) => {
          const p = permissions.find((x) => x.personId === pid)
          if (p) { if (!p.albumIds.includes(albumId)) p.albumIds = [...p.albumIds, albumId] }
          else permissions.push({ personId: pid, albumIds: [albumId], canAddStories: true, documentAccess: false })
        })
        const al = s.albums.find((a) => a.id === albumId)
        const names = personIds.map((id) => s.people.find((p) => p.id === id)?.name).filter(Boolean).join(' en ')
        return notify({ ...s, albums, permissions: permissions.map((p) => ({ ...p })) }, `Je deelde “${al?.title}” met ${names}`)
      })
    },
    unshareAlbum: (albumId, personId) => {
      setState((s) => ({
        ...s,
        albums: s.albums.map((a) => (a.id === albumId ? { ...a, sharedWith: a.sharedWith.filter((x) => x !== personId) } : a)),
        permissions: s.permissions.map((p) => (p.personId === personId ? { ...p, albumIds: p.albumIds.filter((x) => x !== albumId) } : p)),
      }))
    },
    invitePerson: (name, email, relation, albumIds) => {
      setState((s) => notify({ ...s, invites: [{ id: uid('inv'), name, email, relation, sentOn: today(), status: 'verstuurd (demo)', albumIds }, ...s.invites] }, `Uitnodiging voor ${name} klaargezet (demo, er is geen e-mail verstuurd)`))
    },
    completeImport: (sourceId, chosenItems) => {
      const stamp = Date.now().toString(36)
      const added: Id[] = chosenItems.map((id, i) => `${id}-import-${stamp}${i}`)
      setState((s) => {
        const src = s.sources.find((x) => x.id === sourceId)
        if (!src) return s
        const now = new Date().toISOString()
        const clones: DemoMedia[] = chosenItems.map((id) => s.media.find((m) => m.id === id)).filter((m): m is DemoMedia => !!m).map((m) => ({
          ...m, id: `${m.id}-import-${stamp}${chosenItems.indexOf(m.id)}`, sourceId, importedAt: now, favorite: false, storyId: undefined,
          visibility: 'private', title: m.title, description: `${m.description} (Gekopieerd uit ${src.name} in deze demo.)`,
        }))
        return notify({
          ...s, media: [...clones, ...s.media],
          sources: s.sources.map((x) => (x.id === sourceId ? { ...x, status: x.kind === 'auto' ? 'connected' : 'manual', itemsCount: x.itemsCount + clones.length, lastSync: 'Zojuist (demo)' } : x)),
        }, `${clones.length} items uit ${src.name} staan nu in je archief (demo)`)
      })
      return added
    },
    connectSource: (sourceId) => setState((s) => ({ ...s, sources: s.sources.map((x) => (x.id === sourceId ? { ...x, status: 'connected', lastSync: 'Zojuist (demo)' } : x)) })),
    disconnectSource: (sourceId) => setState((s) => ({ ...s, sources: s.sources.map((x) => (x.id === sourceId ? { ...x, status: x.kind === 'auto' ? 'not_set' : 'manual', lastSync: undefined } : x)) })),
    updateLegacyWish: (wish) => {
      const full: DemoLegacyWish = {
        id: wish.id ?? uid('wish'), recipientId: wish.recipientId, title: wish.title ?? 'Bewaarwens', text: wish.text ?? '',
        mediaIds: wish.mediaIds ?? [], storyIds: wish.storyIds ?? [], albumIds: wish.albumIds ?? [], moment: wish.moment ?? 'Op een later moment, na verificatie (concept)', createdOn: wish.createdOn ?? today(),
      }
      setState((s) => {
        const exists = s.legacy.wishes.some((w) => w.id === full.id)
        const wishes = exists ? s.legacy.wishes.map((w) => (w.id === full.id ? full : w)) : [full, ...s.legacy.wishes]
        return { ...s, legacy: { ...s.legacy, wishes, updatedOn: today() } }
      })
      return full
    },
    removeLegacyWish: (id) => setState((s) => ({ ...s, legacy: { ...s.legacy, wishes: s.legacy.wishes.filter((w) => w.id !== id) } })),
    setLegacyContacts: (primary, secondary) => setState((s) => ({ ...s, legacy: { ...s.legacy, primaryContactId: primary, secondaryContactId: secondary, updatedOn: today() } })),
    setLegacyLetter: (text) => setState((s) => ({ ...s, legacy: { ...s.legacy, letterToMila: text, updatedOn: today() } })),
    setDocumentRecipient: (documentId, personId) => setState((s) => ({
      ...s, legacy: { ...s.legacy, documentRecipients: [...s.legacy.documentRecipients.filter((d) => d.documentId !== documentId), ...(personId ? [{ documentId, personId }] : [])] },
    })),
    setAlbumRecipients: (albumId, personIds) => setState((s) => ({
      ...s, legacy: { ...s.legacy, albumRecipients: [...s.legacy.albumRecipients.filter((d) => d.albumId !== albumId), ...(personIds.length ? [{ albumId, personIds }] : [])] },
    })),
    submitHeritageDemo: (mediaId, context) => {
      const sub: DemoHeritageSubmission = { ...context, id: uid('sub'), mediaId, status: 'Ingediend (demo) · wacht op beoordeling', submittedOn: today() }
      setState((s) => notify({ ...s, submissions: [sub, ...s.submissions] }, `Je bood “${context.title}” aan bij het nationaal archief (demo)`))
      return sub
    },
    withdrawSubmission: (id) => setState((s) => ({ ...s, submissions: s.submissions.filter((x) => x.id !== id) })),
    attachSchatkamerReference: (storyId, fragmentId) => setState((s) => ({
      ...s, stories: s.stories.map((st) => (st.id === storyId ? { ...st, schatkamerIds: Array.from(new Set([...st.schatkamerIds, fragmentId])) } : st)),
      savedFragments: Array.from(new Set([...s.savedFragments, fragmentId])),
    })),
    detachSchatkamerReference: (storyId, fragmentId) => setState((s) => ({ ...s, stories: s.stories.map((st) => (st.id === storyId ? { ...st, schatkamerIds: st.schatkamerIds.filter((f) => f !== fragmentId) } : st)) })),
    saveFragment: (fragmentId) => setState((s) => ({ ...s, savedFragments: s.savedFragments.includes(fragmentId) ? s.savedFragments.filter((f) => f !== fragmentId) : [...s.savedFragments, fragmentId] })),
    updateMedia: (mediaId, patch) => setState((s) => ({ ...s, media: s.media.map((m) => (m.id === mediaId ? { ...m, ...patch } : m)) })),
    updateDocument: (docId, patch) => setState((s) => ({ ...s, documents: s.documents.map((d) => (d.id === docId ? { ...d, ...patch } : d)) })),
    updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    setViewAs: (personId) => setState((s) => ({ ...s, viewAs: personId })),
    markNotificationsRead: () => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    setTourDone: (v) => setState((s) => ({ ...s, tourDone: v })),
    keepStoryFor: (storyId, personId) => setState((s) => ({ ...s, stories: s.stories.map((st) => (st.id === storyId ? { ...st, keepFor: Array.from(new Set([...(st.keepFor ?? []), personId])) } : st)) })),
    setDocumentConsent: (personId, on) => setState((s) => ({ ...s, documentDemoConsent: on ? Array.from(new Set([...s.documentDemoConsent, personId])) : s.documentDemoConsent.filter((x) => x !== personId) })),
    resetDemo: () => {
      try { localStorage.removeItem(STORAGE_KEY); sessionStorage.clear() } catch { /* */ }
      setState(createSeed())
    },
  }), [])

  const value = useMemo<Ctx>(() => ({ state, toasts, toast, dismissToast, ...api }), [state, toasts, toast, dismissToast, api])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const c = useContext(DemoContext)
  if (!c) throw new Error('useDemo buiten DemoProvider')
  return c
}
