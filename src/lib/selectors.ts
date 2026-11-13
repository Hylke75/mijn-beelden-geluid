import type { DemoState, DemoMedia, Id } from '../data/types'

export const SOURCE_LABEL: Record<string, string> = {
  'google-photos': 'Google Photos', icloud: 'iCloud-foto-export', 'google-drive': 'Google Drive', onedrive: 'OneDrive', dropbox: 'Dropbox',
  device: 'Telefoon of computer', whatsapp: 'WhatsApp-export', instagram: 'Instagram/Facebook-export', tiktok: 'TikTok-gegevens', scan: 'Gedigitaliseerd (analoog)',
}

export const albumIdsFor = (s: DemoState, mediaId: Id) => s.albums.filter((a) => a.mediaIds.includes(mediaId)).map((a) => a.id)
export const mediaById = (s: DemoState, id: Id) => s.media.find((m) => m.id === id)
export const storyById = (s: DemoState, id: Id) => s.stories.find((m) => m.id === id)
export const personName = (s: DemoState, id: Id) => s.people.find((p) => p.id === id)?.name ?? id

/** Wat mag de huidige kijker zien? Sanne ziet alles; een familielid alleen gedeelde albums. */
export function visibleMedia(s: DemoState): DemoMedia[] {
  if (s.viewAs === 'sanne') return s.media
  const shared = new Set(s.albums.filter((a) => a.sharedWith.includes(s.viewAs)).flatMap((a) => a.mediaIds))
  return s.media.filter((m) => shared.has(m.id))
}
export const visibleAlbums = (s: DemoState) => (s.viewAs === 'sanne' ? s.albums : s.albums.filter((a) => a.sharedWith.includes(s.viewAs)))
export const canSeeDocuments = (s: DemoState) => s.viewAs === 'sanne' || s.documentDemoConsent.includes(s.viewAs)

export const sortByDate = (list: DemoMedia[], dir: 'asc' | 'desc' = 'desc') =>
  [...list].sort((a, b) => (dir === 'desc' ? b.dateTaken.localeCompare(a.dateTaken) : a.dateTaken.localeCompare(b.dateTaken)))
