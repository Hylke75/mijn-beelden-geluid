# Design direction — Mijn Beeld & Geluid (conceptdemo)

## Concept
**Premium, warm digital family archive.** De eenvoud van een hoogwaardige foto-app, de warmte van een familiealbum en de betrouwbaarheid van een erfgoedinstelling. Geen CMS, geen dashboard-KPI's, geen futuristische AI-look. Fotografie is de held; de interface blijft rustig en wijkt.

De demo is de **gebruikersomgeving van een toekomstige abonnee**: Sanne van Dijk (44, Haarlem) en haar fictieve familie over vier generaties. Iedere bezoeker landt direct in haar gevulde archief.

## Kleuren (tokens in `tailwind.config.js`)
| Token | Waarde | Gebruik |
|---|---|---|
| `paper` | `#F8F7F4` | achtergrond, warm gebroken wit |
| `white` | `#FFFFFF` | kaarten |
| `ink` | `#142348` | titels, belangrijke tekst, donkere vlakken |
| `brand` | `#1937B9` | navigatie, primaire knoppen |
| `magenta` | `#E60088` | emotionele acties (Toevoegen, bewaren voor Mila, aanbieden), accenten — spaarzaam |
| `meta` | `#65738C` | metadata |
| `line` | `#E4E8EE` | randen |
| demo-geel | `#FFF3D6` / `#6B4A00` | alle “demo / concept / fictief”-labels — herkenbaar en consistent |

## Typografie
- **DM Sans** (variable, lokaal via fontsource) voor titels — sluit aan bij de presentatie.
- **Inter** (variable) voor alle UI- en leestekst. Verhalen: 17px, regelafstand 1,8, initiaal in brand-blauw.

## Vorm & beweging
8 px-raster, hoeken 12–20 px (foto's 12–24 px), zeer subtiele schaduwen, overgangen 150–250 ms, crossfades in de tijdmachine. `prefers-reduced-motion` en de instelling “Minder beweging” schakelen animaties uit.

## Beeldbehandeling per tijdperk
Om oude en nieuwe herinneringen als één verhaal te laten voelen, krijgt elk beeld bij het verwerken een tijdperk-behandeling (`scripts/build_media.py`):
`bw` (1957–1977, warm zwart-wit), `eighties` (warm, iets verbleekt), `nineties` (vervaagde kleur), `modern`. Analoge beelden krijgen daarnaast een subtiele korrel (CSS).

## Navigatie
Zijbalk 248 px (desktop ≥ 1024 px) met groepen *Ontdekken · Bewaren · Samen & later · Erfgoed*; topbar met globale zoekfunctie, `+ Toevoegen` (magenta), meldingen en avatar. Tablet/mobiel: compacte header, inklapbaar menu en onderbalk *Voor jou · Foto's · Albums · Meer*.

## Kerncomponenten
`AppShell`, `SearchBox`, `MediaGrid` (justified grid op beeldverhouding), `MediaTile`, `MediaViewer` (lichtbak via `?m=`), `DemoPlayer` (voorbeeldspeler met transcript), `Modal`/`Drawer` (focus-trap, Esc), `GlobalModals`, `TourPanel`, `PresenterPanel`, `Toasts`.

## Schermschetsen (kort)
- **Voor jou** — welkom, grote titel, hero “Zomer in Zeeland · 2024”, vier acties + tijdmachine-kaart; daaronder *Vandaag in je herinneringen* en het verhaal van oma Nel, albums, archiefstatus en “Wat wil je later doorgeven?”.
- **Foto-detail (WOW 2)** — links de foto in een papieren passe-partout, rechts het verhaal als magazine-tekst, generatieketen Nel → Pieter → Sanne → Mila.
- **Tijdmachine (WOW 1)** — fullscreen, één beeld, jaartal in 150 px, één zin; voortgangsbalk bovenin.
- **Later doorgeven (WOW 4)** — rustig schema *Nu privé → Na verificatie (concept) → Volgens jouw wensen*; voorbeeldweergave als brief op crèmekleurig papier.
- **Kluis** — bewust zakelijker: documentminiaturen, drawer, gele demo-waarschuwing.
