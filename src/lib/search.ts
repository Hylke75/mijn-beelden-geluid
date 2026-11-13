import type { DemoState } from '../data/types'
import { normalize } from './format'
import { canSeeDocuments, visibleAlbums, visibleMedia } from './selectors'

export const SUGGESTIONS = ['Zeeland', 'Oma Nel', '2012', 'Mila', 'Bruiloft', 'Haarlem', 'Appeltaart']

const SYN: Record<string, string[]> = {
  bruiloft: ['trouw', 'huwelijk', 'bruid', 'ringen', 'trouwdag'],
  trouwen: ['trouw', 'huwelijk', 'bruiloft'],
  oma: ['nel', 'ineke'],
  strand: ['zee', 'zeeland', 'domburg', 'duin'],
  verjaardag: ['jarig', '75', 'taart'],
}

export function searchAll(s: DemoState, q: string) {
  const nq = normalize(q.trim())
  if (!nq) return null
  const terms = nq.split(/\s+/)
  const expand = terms.flatMap((t) => [t, ...(SYN[t] ?? [])])
  const peopleText = (ids: string[]) => ids.map((id) => s.people.find((p) => p.id === id)).map((p) => p ? `${p.name} ${p.fullName} ${p.relationLabel}` : '').join(' ')
  const match = (hay: string) => {
    const h = normalize(hay)
    return terms.every((t) => h.includes(t) || (SYN[t] ?? []).some((x) => h.includes(x))) || (terms.length === 1 && expand.some((t) => h.includes(t)))
  }
  const media = visibleMedia(s).filter((m) => match(`${m.title} ${m.description} ${m.location} ${m.dateTaken.slice(0, 4)} ${peopleText(m.peopleIds)} ${m.kind === 'video' ? 'video' : ''}`))
  const albums = visibleAlbums(s).filter((a) => match(`${a.title} ${a.subtitle} ${a.intro} ${a.period}`))
  const stories = s.stories.filter((st) => (s.viewAs === 'sanne' || st.albumIds.some((id) => visibleAlbums(s).some((a) => a.id === id))) && match(`${st.title} ${st.intro} ${st.body.join(' ')} ${st.date.slice(0, 4)} ${peopleText([...st.peopleIds, st.narratorId])}`))
  const people = s.people.filter((p) => match(`${p.name} ${p.fullName} ${p.relationLabel}`))
  const places = Array.from(new Set(visibleMedia(s).map((m) => m.location))).filter((l) => match(l))
  const years = Array.from(new Set(visibleMedia(s).map((m) => m.dateTaken.slice(0, 4)))).filter((y) => terms.some((t) => y.includes(t) && t.length >= 2))
  const documents = canSeeDocuments(s) ? s.documents.filter((d) => match(`${d.title} ${d.category} ${d.year} ${d.summary}`)) : []
  return { media, albums, stories, people, places, years, documents, total: media.length + albums.length + stories.length + people.length + documents.length }
}
