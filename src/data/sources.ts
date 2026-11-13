import type { DemoSource } from './types'

// importPool verwijst naar bestaande demo-media die bij een import als kopie worden toegevoegd.
export const sources: DemoSource[] = [
  { id: 'google-photos', name: 'Google Photos', short: 'GP', color: '#4285F4', kind: 'auto', status: 'connected', itemsCount: 1284, lastSync: 'vandaag, 07:12 (voorbeeld)',
    description: 'Automatische kopie van nieuwe foto\'s en video\'s. In deze demo is dit een voorbeeldkoppeling.', importPool: ['m-2026-spaarne', 'm-2026-markt', 'm-2026-hofje'] },
  { id: 'icloud', name: 'iCloud-foto-export', short: 'iC', color: '#3693F3', kind: 'export', status: 'manual', itemsCount: 412,
    description: 'Exporteer je fotobibliotheek vanuit iCloud en importeer het bestand hier.', importPool: ['m-2024-icecream', 'm-2024-sunset', 'm-2021-heide'] },
  { id: 'google-drive', name: 'Google Drive', short: 'GD', color: '#0F9D58', kind: 'auto', status: 'not_set', itemsCount: 0,
    description: 'Kopieer mappen met foto\'s en documenten. Nog niet ingesteld.', importPool: ['m-2003-bike', 'm-reis-tulpen'] },
  { id: 'onedrive', name: 'OneDrive', short: 'OD', color: '#0364B8', kind: 'auto', status: 'not_set', itemsCount: 0,
    description: 'Voorbeeld van een automatische koppeling met OneDrive.', importPool: ['m-2010-rings', 'm-2010-dance'] },
  { id: 'dropbox', name: 'Dropbox', short: 'Db', color: '#0061FE', kind: 'auto', status: 'not_set', itemsCount: 0,
    description: 'Voorbeeld van een automatische koppeling met Dropbox.', importPool: ['m-geluk-breakfast', 'm-geluk-rain'] },
  { id: 'device', name: 'Telefoon of computer', short: 'TC', color: '#142348', kind: 'device', status: 'manual', itemsCount: 236,
    description: 'Sleep bestanden hierheen of kies ze van je apparaat. In de demo gebruiken we voorbeeldbestanden.', importPool: ['m-2024-kite', 'm-2024-dunes-kids'] },
  { id: 'whatsapp', name: 'WhatsApp-export', short: 'WA', color: '#25D366', kind: 'export', status: 'manual', itemsCount: 58,
    description: 'Exporteer een chat met media en importeer die. De mogelijkheden van WhatsApp zijn beperkt; dit wordt nog onderzocht.', importPool: ['m-2025-cake', 'm-2025-gift'] },
  { id: 'instagram', name: 'Instagram/Facebook-export', short: 'IG', color: '#E1306C', kind: 'export', status: 'not_set', itemsCount: 0,
    description: 'Vraag een download van je gegevens aan bij Meta en importeer het archief.', importPool: ['m-reis-italie', 'm-2026-hofje'] },
  { id: 'tiktok', name: 'TikTok-gegevens', short: 'TT', color: '#111111', kind: 'export', status: 'not_set', itemsCount: 0,
    description: 'Importeer video\'s uit je TikTok-gegevensdownload.', importPool: ['v-2024-waves'] },
  { id: 'scan', name: 'Oude foto\'s laten digitaliseren', short: 'An', color: '#E60088', kind: 'analog', status: 'manual', itemsCount: 318, lastSync: 'september 2016 (voorbeeld)',
    description: 'Fotoboeken, dia\'s en videobanden digitaliseren, eventueel met partners. Conceptdienst.', importPool: ['m-1994-huts', 'm-1988-table'] },
]
