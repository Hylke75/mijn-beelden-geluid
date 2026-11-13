// Datamodel van de demo. Alle gegevens zijn fictief.
export type Id = string

export type Relation = 'jij' | 'partner' | 'kind' | 'ouder' | 'zus' | 'grootouder' | 'gast'

export interface DemoPerson {
  id: Id
  name: string
  fullName: string
  relation: Relation
  relationLabel: string
  born: number
  died?: number
  avatar?: string
  bio: string
  generation: 1 | 2 | 3 | 4
  email?: string
  /** Kan deze persoon (fictief) inloggen in de familiekring? */
  member: boolean
}

export type MediaKind = 'photo' | 'video' | 'audio'
export type Visibility = 'private' | 'family' | 'heritage'
export type Era = 'bw' | 'eighties' | 'nineties' | 'modern'

export interface DemoMedia {
  id: Id
  title: string
  dateTaken: string // ISO-datum
  location: string
  peopleIds: Id[]
  sourceId: Id
  kind: MediaKind
  src: string
  thumb: string
  alt: string
  description: string
  storyId?: Id
  visibility: Visibility
  favorite: boolean
  era: Era
  /** in seconden, voor video/audio */
  duration?: number
  transcript?: string[]
  eventId?: Id
  /** toegevoegd tijdens de demo (import) */
  importedAt?: string
  w?: number
  h?: number
}

export interface DemoAlbum {
  id: Id
  title: string
  subtitle: string
  coverId: Id
  mediaIds: Id[]
  intro: string
  period: string
  chapters?: { title: string; text: string; mediaIds: Id[] }[]
  sharedWith: Id[]
  createdByDemo?: boolean
  storyIds?: Id[]
}

export interface DemoStory {
  id: Id
  title: string
  narratorId: Id
  date: string // datum van het verhaal / gebeurtenis
  writtenOn: string
  mediaId: Id // hoofdbeeld
  linkedMediaIds: Id[]
  peopleIds: Id[]
  albumIds: Id[]
  intro: string
  body: string[]
  context?: string
  quote?: string
  audioId?: Id
  createdByDemo?: boolean
  schatkamerIds: Id[]
  keepFor?: Id[] // bewaard voor (nalatenschap)
}

export type DocCategory = 'Persoonlijke documenten' | 'Woning' | 'Verzekeringen' | "Diploma's" | 'Familiepapieren'

export interface DemoDocument {
  id: Id
  title: string
  category: DocCategory
  year: number
  kind: string
  pages: number
  owner: Id
  summary: string
  fields: { label: string; value: string }[]
  accessIds: Id[]
  legacyRecipientId?: Id
  added: string
}

export type SourceStatus = 'connected' | 'not_set' | 'manual'
export interface DemoSource {
  id: Id
  name: string
  kind: 'auto' | 'export' | 'device' | 'analog'
  status: SourceStatus
  description: string
  itemsCount: number
  lastSync?: string
  importPool: Id[] // fixtures die bij een demo-import worden toegevoegd
  color: string
  short: string
}

export interface DemoFamilyPermission {
  personId: Id
  albumIds: Id[]
  canAddStories: boolean
  documentAccess: boolean
}

export interface DemoInvite {
  id: Id
  name: string
  email?: string
  relation: string
  sentOn: string
  status: 'verstuurd (demo)' | 'geaccepteerd'
  albumIds: Id[]
}

export interface DemoLegacyInstruction {
  primaryContactId: Id
  secondaryContactId: Id
  wishes: DemoLegacyWish[]
  documentRecipients: { documentId: Id; personId: Id }[]
  albumRecipients: { albumId: Id; personIds: Id[] }[]
  letterToMila: string
  updatedOn: string
}

export interface DemoLegacyWish {
  id: Id
  recipientId: Id
  title: string
  text: string
  mediaIds: Id[]
  storyIds: Id[]
  albumIds: Id[]
  moment: string
  createdOn: string
}

export interface DemoHeritageSubmission {
  id: Id
  mediaId: Id
  title: string
  context: string
  location: string
  year: string
  people: string
  consents: { owner: boolean; recognizable: boolean; license: boolean; review: boolean }
  license: string
  status: 'Ingediend (demo) · wacht op beoordeling' | 'Concept'
  submittedOn: string
}

export interface DemoSchatkamerFragment {
  id: Id
  title: string
  program: string
  year: number
  channel: string
  duration: string
  description: string
  still: string
  tags: string[]
  rights: string
}

export interface DemoNotification {
  id: Id
  text: string
  time: string
  read: boolean
  to?: string
}

export interface DemoSettings {
  largeText: boolean
  reduceMotion: boolean
  notifyFamily: boolean
  notifyMemories: boolean
  notifyWeekly: boolean
  faceGrouping: boolean
  defaultVisibility: Visibility
  showOnThisDay: boolean
  language: 'nl' | 'en'
}

export interface DemoQuestion {
  id: Id
  toId: Id
  question: string
  askedOn: string
  status: 'verstuurd (demo)' | 'beantwoord'
  storyId?: Id
}

export interface DemoState {
  version: number
  media: DemoMedia[]
  albums: DemoAlbum[]
  stories: DemoStory[]
  people: DemoPerson[]
  documents: DemoDocument[]
  sources: DemoSource[]
  permissions: DemoFamilyPermission[]
  invites: DemoInvite[]
  legacy: DemoLegacyInstruction
  submissions: DemoHeritageSubmission[]
  savedFragments: Id[]
  notifications: DemoNotification[]
  settings: DemoSettings
  viewAs: Id // 'sanne' of een familielid (demonstratieve kijkweergave)
  documentDemoConsent: Id[] // personen met afzonderlijke demo-toestemming voor documenten
  tourDone: boolean
  wowsDone: number[]
  questions: DemoQuestion[]
  welcomeDismissed: boolean
}
