import type { DemoPerson } from './types'

const A = (id: string) => `/demo-media/avatars/${id}.jpg`

export const people: DemoPerson[] = [
  { id: 'sanne', name: 'Sanne', fullName: 'Sanne van Dijk', relation: 'jij', relationLabel: 'Jij', born: 1982, avatar: A('sanne'), generation: 3, member: true,
    bio: 'Woont in Haarlem en houdt de herinneringen van haar gezin en ouders bij. Begon het familiearchief toen ze de schoenendozen van oma Nel erfde.', email: 'sanne@voorbeeld.nl' },
  { id: 'thomas', name: 'Thomas', fullName: 'Thomas van Dijk', relation: 'partner', relationLabel: 'Partner', born: 1980, avatar: A('thomas'), generation: 3, member: true,
    bio: 'Fotografeert alles met zijn telefoon en vergeet het daarna. Primaire contactpersoon voor Sannes bewaarwensen.', email: 'thomas@voorbeeld.nl' },
  { id: 'mila', name: 'Mila', fullName: 'Mila van Dijk', relation: 'kind', relationLabel: 'Dochter', born: 2012, avatar: A('mila'), generation: 4, member: true,
    bio: 'Veertien, tekent graag en wil later alles weten over oma Nel, naar wie haar tweede naam verwijst.' },
  { id: 'daan', name: 'Daan', fullName: 'Daan van Dijk', relation: 'kind', relationLabel: 'Zoon', born: 2016, avatar: A('daan'), generation: 4, member: false,
    bio: 'Tien jaar, voetbalt op zaterdag en verzamelt schelpen op elk strand dat hij tegenkomt.' },
  { id: 'pieter', name: 'Pieter', fullName: 'Pieter de Wit', relation: 'ouder', relationLabel: 'Vader', born: 1950, avatar: A('pieter'), generation: 2, member: true,
    bio: 'Gepensioneerd onderwijzer uit Haarlem. Bewaarde dertig jaar aan dia\'s in een kast op zolder.', email: 'pieter@voorbeeld.nl' },
  { id: 'ineke', name: 'Ineke', fullName: 'Ineke de Wit', relation: 'ouder', relationLabel: 'Moeder', born: 1954, avatar: A('ineke'), generation: 2, member: true,
    bio: 'Kent van iedere foto de datum, de plek en wie er net buiten beeld stond.', email: 'ineke@voorbeeld.nl' },
  { id: 'marieke', name: 'Marieke', fullName: 'Marieke de Wit', relation: 'zus', relationLabel: 'Zus', born: 1985, avatar: A('marieke'), generation: 3, member: true,
    bio: 'Sannes jongere zus, woont in Utrecht. Tweede contactpersoon in Sannes bewaarwensen.', email: 'marieke@voorbeeld.nl' },
  { id: 'nel', name: 'Oma Nel', fullName: 'Petronella (Nel) de Wit-Bakker', relation: 'grootouder', relationLabel: 'Grootmoeder', born: 1930, died: 2016, avatar: A('nel'), generation: 1, member: false,
    bio: 'Moeder van Pieter. Bakte elke zondag appeltaart en schreef haar recepten in een schrift met een blauwe kaft.' },
]

export const personById = (id: string) => people.find((p) => p.id === id)
