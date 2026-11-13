import type { DemoAlbum, DemoMedia, DemoState } from './types'
import mediaJson from './media.json'
import { people } from './people'
import { stories } from './stories'
import { documents } from './documents'
import { sources } from './sources'

/** Verhoog bij wijzigingen in de seed, zodat oude localStorage-state wordt vervangen. */
export const SEED_VERSION = 8

const media = mediaJson as DemoMedia[]
const ids = (prefix: string | RegExp) => media.filter((m) => (typeof prefix === 'string' ? m.id.startsWith(prefix) : prefix.test(m.id))).map((m) => m.id)

const albums: DemoAlbum[] = [
  {
    id: 'al-zeeland', title: 'Zomers in Zeeland', subtitle: 'Dertig jaar hetzelfde duinpad', coverId: 'm-2024-beach-family', period: '1994 – 2024',
    intro: 'In 1994 huurden Pieter en Ineke voor het eerst een huisje achter de duinen bij Domburg. Dertig jaar later loopt Ineke daar met haar dochter en kleindochter. Dit album verbindt die zomers: dezelfde strandpalen, hetzelfde duinpad, drie generaties.',
    chapters: [
      { title: 'De eerste zomer, 1994', text: 'Een vakantiehuisje, een nieuwe camera van Pieter en een zee die Sanne nooit meer wilde verlaten.', mediaIds: ['m-1994-beach', 'm-1994-sandcastle', 'm-1994-huts', 'm-1994-dunes', 'm-1994-towel', 'v-1994-super8'] },
      { title: 'Terug met de kinderen, 2024', text: 'Mila en Daan op dezelfde plekken. Oma Ineke loopt nog steeds het hardst.', mediaIds: ['m-2024-beach-family', 'm-2024-dunes-kids', 'm-2024-siblings', 'm-2024-kite', 'm-2024-palen', 'v-2024-waves', 'v-2024-kite'] },
      { title: 'De avonden', text: 'Zonsondergangen, mosselen in Veere en een vuurtoren met tegenwind.', mediaIds: ['m-2024-sunset', 'm-2024-icecream', 'm-2024-veere', 'm-2024-lighthouse', 'm-2024-walk'] },
    ],
    mediaIds: [], sharedWith: [], storyIds: ['s-zeeland-1994', 's-zeeland-2024'],
  },
  {
    id: 'al-vroeger', title: 'De familie van vroeger', subtitle: 'Zwart-wit, sepia en de verhalen erachter', coverId: 'm-1975-portrait', period: '1957 – 1988',
    intro: 'De oudste foto\'s uit de schoenendozen van oma Nel en de enveloppen van Ineke. Gescand in 2016 en sindsdien aangevuld met de verhalen die Pieter en Ineke erbij vertellen.',
    mediaIds: ['m-1957-sint', 'm-1975-portrait', 'm-1975-car', 'm-1975-guests', 'm-1975-rings', 'm-1975-haarlem', 'm-1977-zandvoort', 'm-1986-fotograaf', 'm-1988-kitchen', 'm-1988-pie', 'm-1988-table', 'm-1994-beach'],
    sharedWith: ['ineke', 'pieter'], storyIds: ['s-trouwdag-1975', 's-nel-appeltaart'],
  },
  {
    id: 'al-huwelijk', title: 'Ons huwelijk', subtitle: 'Sanne & Thomas, 19 juni 2010', coverId: 'm-2010-couple', period: '2010',
    intro: 'Een tuin in Overveen, een speech van zeven minuten en een dansvloer die om middernacht nog vol stond. En, 35 jaar eerder, de bruiloft van Pieter en Ineke.',
    chapters: [
      { title: 'Sanne & Thomas, 2010', text: 'Van de wandeling door de tuin tot de laatste dans.', mediaIds: ['m-2010-couple', 'm-2010-rings', 'm-2010-hands', 'm-2010-cheers', 'm-2010-dance', 'v-2010-dance'] },
      { title: 'En 35 jaar eerder: Pieter & Ineke', text: 'Een geleende Opel, een sluier in de wind en taart van oma Nel.', mediaIds: ['m-1975-portrait', 'm-1975-car', 'm-1975-rings'] },
    ],
    mediaIds: [], sharedWith: ['thomas'], storyIds: ['s-trouwdag-1975'],
  },
  {
    id: 'al-kinderen', title: 'Mila & Daan', subtitle: 'Onze kinderen, van de eerste dag tot nu', coverId: 'm-2024-siblings', period: '2012 – 2026',
    intro: 'Mila werd geboren op de eerste warme dag van 2012, Daan vier jaar later. Hier staan hun eerste dagen, de gewone zaterdagen en alles daartussen.',
    mediaIds: ['m-2012-mila-sleep', 'm-2012-feet', 'm-2012-blanket', 'm-2016-belly', 'm-2016-daan', 'v-2016-daan', 'm-2016-siblings', 'm-geluk-reading', 'm-geluk-drawing', 'm-geluk-bike', 'm-kerst-2019', 'm-2024-siblings', 'm-2024-dunes-kids', 'm-2025-opa-mila'],
    sharedWith: ['thomas'], storyIds: ['s-mila-geboren'],
  },
  {
    id: 'al-oma-nel', title: 'Oma Nel', subtitle: '1930 – 2016 · Ze bakte voor iedereen', coverId: 'm-1988-kitchen', period: '1957 – 2016',
    intro: 'Petronella de Wit-Bakker, voor iedereen oma Nel. Haar keuken aan de Zijlweg, haar appeltaart, haar receptenschrift en de enige opname van haar stem.',
    mediaIds: ['m-1988-kitchen', 'm-1988-pie', 'm-1988-table', 'm-1957-sint', 'm-1975-guests', 'm-2012-blanket', 'm-2016-recipe', 'm-2016-scanning', 'a-nel-recept'],
    sharedWith: ['marieke'], storyIds: ['s-nel-appeltaart', 's-nel-recept'],
  },
  {
    id: 'al-geluk', title: 'Kleine geluksmomenten', subtitle: 'Gewone dagen die je niet wilt vergeten', coverId: 'm-geluk-drawing', period: '2019 – 2026',
    intro: 'Geen verjaardagen of vakanties, maar zondagsontbijt, regen tegen het raam en een ijsje dat niet op de grond viel.',
    mediaIds: ['m-geluk-breakfast', 'm-geluk-rain', 'm-geluk-reading', 'm-geluk-drawing', 'm-geluk-bike', 'm-2024-icecream', 'm-2021-green', 'm-2024-sunset', 'm-2026-sanne'],
    sharedWith: [], storyIds: [],
  },
  {
    id: 'al-reizen', title: 'Reizen samen', subtitle: 'Van Pisa tot de Veluwe', coverId: 'm-2021-heide', period: '2018 – 2024',
    intro: 'Verre en dichtbije reizen. Twee lekke banden in Italië, natuurijs op de Gouwzee en twaalf kilometer over de heide.',
    mediaIds: ['m-reis-skate', 'm-reis-italie', 'm-reis-tulpen', 'm-2021-heide', 'm-2021-forest', 'm-2021-deer', 'm-2021-green', 'v-2021-forest', 'm-2024-lighthouse'],
    sharedWith: [], storyIds: [],
  },
  {
    id: 'al-feest', title: 'Feestdagen', subtitle: 'Sinterklaas, kerst en verjaardagen', coverId: 'm-kerst-2019', period: '1957 – 2025',
    intro: 'Schoen zetten bij de kachel in 1957, kerstkoekjes met oma Ineke en de taart voor opa.',
    mediaIds: ['m-1957-sint', 'm-kerst-2019', 'm-kerst-2022', 'm-2025-cake'],
    sharedWith: ['ineke'], storyIds: [],
  },
  {
    id: 'al-pieter-75', title: 'Pieter 75', subtitle: 'Een verjaardag met drie generaties', coverId: 'm-2025-opa-mila', period: 'mei 2025',
    intro: 'Voor opa\'s 75ste scanden Mila en Sanne 1.200 dia\'s. Op zijn verjaardag kwamen de oude albums op tafel en hield hij een toespraak van zeven minuten.',
    mediaIds: ['m-2025-opa-mila', 'm-2025-photobook', 'm-2025-cake', 'm-2025-gift', 'v-2025-speech', 'a-pieter-1975', 'm-1975-portrait'],
    sharedWith: ['pieter', 'ineke', 'marieke'], storyIds: ['s-pieter-75'],
  },
  {
    id: 'al-haarlem', title: 'Haarlem thuis', subtitle: 'Onze stad, toen en nu', coverId: 'm-2026-spaarne', period: '1975 – 2026',
    intro: 'Een weekend in eigen stad in april 2026, en dezelfde straten in 1975, gefotografeerd door Pieter op de ochtend van zijn trouwdag.',
    mediaIds: ['m-2026-spaarne', 'm-2026-markt', 'm-2026-hofje', 'm-2026-bikes', 'v-2026-spaarne', 'm-2026-sanne', 'm-1975-haarlem'],
    sharedWith: [], storyIds: [],
  },
]
// albums met hoofdstukken: mediaIds = alle hoofdstukitems
albums.forEach((a) => { if (a.chapters) a.mediaIds = Array.from(new Set(a.chapters.flatMap((c) => c.mediaIds))) })

export function createSeed(): DemoState {
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
  void ids
  return clone({
    version: SEED_VERSION,
    media, albums, stories, people, documents, sources,
    permissions: [
      { personId: 'ineke', albumIds: ['al-vroeger', 'al-feest', 'al-pieter-75'], canAddStories: true, documentAccess: false },
      { personId: 'pieter', albumIds: ['al-vroeger', 'al-pieter-75'], canAddStories: true, documentAccess: false },
      { personId: 'marieke', albumIds: ['al-oma-nel', 'al-pieter-75'], canAddStories: true, documentAccess: false },
      { personId: 'thomas', albumIds: ['al-huwelijk', 'al-kinderen'], canAddStories: true, documentAccess: true },
    ],
    invites: [
      { id: 'inv-bram', name: 'Bram de Wit', email: 'bram@voorbeeld.nl', relation: 'Neef', sentOn: '2026-09-14', status: 'geaccepteerd', albumIds: ['al-vroeger'] },
      { id: 'inv-joke', name: 'Tante Joke', relation: 'Tante', sentOn: '2026-10-30', status: 'verstuurd (demo)', albumIds: ['al-oma-nel'] },
    ],
    legacy: {
      primaryContactId: 'thomas', secondaryContactId: 'marieke', updatedOn: '2026-10-12',
      wishes: [
        { id: 'wish-daan', recipientId: 'daan', title: 'Voor Daan', text: 'Al je eerste keren: je eerste dag, je eerste fiets en de vlieger die ervandoor ging. Zodat je later weet hoe vrolijk je was.', mediaIds: ['m-2016-daan', 'm-geluk-bike', 'm-2024-kite', 'm-2024-dunes-kids'], storyIds: [], albumIds: ['al-kinderen'], moment: 'Op zijn 18e verjaardag (concept)', createdOn: '2026-10-12' },
      ],
      documentRecipients: [
        { documentId: 'doc-testament', personId: 'thomas' }, { documentId: 'doc-koopakte', personId: 'thomas' },
        { documentId: 'doc-receptenboek', personId: 'mila' }, { documentId: 'doc-trouwboekje-1975', personId: 'marieke' },
      ],
      albumRecipients: [{ albumId: 'al-oma-nel', personIds: ['mila', 'marieke'] }, { albumId: 'al-kinderen', personIds: ['mila', 'daan'] }],
      letterToMila: 'Lieve Mila,\n\nToen je klein was, vroeg je me eens waarom ik zoveel foto\'s bewaar. Ik zei toen dat het voor later was. Nu is het later.\n\nIn deze verzameling zitten mijn favoriete foto\'s, en het verhaal van oma Nel. Haar appeltaart, haar blauwe schrift, de zondagen in haar keuken. Jij hebt haar nog net gekend; ik hoop dat je haar hierin terugvindt.\n\nBak de taart. Meet niets af. Voel het.',
    },
    submissions: [],
    savedFragments: ['f-zomer-zeeland-1994'],
    notifications: [
      { id: 'n1', text: 'Ineke heeft een verhaal toegevoegd bij “De eerste vakantie in Zeeland”', time: 'Gisteren', read: false, to: '/verhalen/s-zeeland-1994' },
      { id: 'n2', text: 'Op deze dag: herinneringen uit eerdere jaren', time: 'Vandaag', read: false, to: '/voor-jou' },
      { id: 'n3', text: '3 nieuwe foto\'s gekopieerd uit Google Photos (voorbeeld)', time: '2 dagen geleden', read: true, to: '/fotos?bron=google-photos' },
      { id: 'n4', text: 'Neef Bram heeft je uitnodiging geaccepteerd', time: 'September', read: true, to: '/familie' },
    ],
    settings: { largeText: false, reduceMotion: false, notifyFamily: true, notifyMemories: true, notifyWeekly: false, faceGrouping: false, defaultVisibility: 'private', showOnThisDay: true, language: 'nl' },
    viewAs: 'sanne', documentDemoConsent: [], tourDone: false, wowsDone: [], welcomeDismissed: false,
    questions: [
      { id: 'q-pieter-dias', toId: 'pieter', question: 'Welke dia zou je als eerste redden als het huis in brand stond?', askedOn: '2026-10-28', status: 'verstuurd (demo)' },
    ],
  } satisfies DemoState)
}
