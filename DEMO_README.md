# Mijn Beeld & Geluid — interactieve conceptdemo

Een volledig doorklikbare productdemo van **Mijn Beeld & Geluid**: het familiearchief van Nederland, zoals een toekomstige abonnee het zou ervaren. Alle personen, verhalen en documenten zijn **fictief**. Er is geen backend: alles draait in de browser.

## Starten
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # productiebuild in dist/
npm run preview    # bekijk de build
```
Presentator-modus: open `http://localhost:5173/voor-jou?presenter=1` (uitzetten met `?presenter=0`).

## Vier manieren om de demo te gebruiken
0. **Speel de demo af** — de knop naast de titel op *Voor jou* (en in welkomstpaneel, hoogtepuntenvenster, Hulp en presentatorpaneel) speelt de hele demo automatisch af in ±1,5 minuut: 13 scènes met ondertitel, pauze/vorige/volgende/stoppen (spatie = pauze, Esc = stoppen). Er wordt niets aan de demo-gegevens veranderd.
1. **Zelf ontdekken** (standaard) — je landt in het archief van Sanne. De knop *Ontdek de mogelijkheden* toont vijf WOW-ervaringen van 1–2 minuten.
2. **Rondleiding** — *Geef me een rondleiding*: 8 stappen met spotlight, wisselt zelf van scherm (entree → foto terugvinden → verhaal → tijdmachine → delen → kluis & import → later doorgeven → bijdragen aan Nederland).
3. **Presentator-modus** — `?presenter=1` toont een klein zwevend paneel met snelkoppelingen en *Reset demo*.

## Routes
| Route | Scherm |
|---|---|
| `/voor-jou` | Startscherm |
| `/fotos` | Foto's & video's (filters via URL: `filter`, `jaar`, `persoon`, `plaats`, `bron`, `sort`) |
| `/foto/:id` | Foto-detail met verhaal (WOW 2: `/foto/m-1988-kitchen`) |
| `?m=:id` | Lichtbak, op elke route (vorige/volgende, Esc) |
| `/tijdlijn`, `/tijdmachine` | Tijdlijn en fullscreen tijdreis (WOW 1) |
| `/albums`, `/albums/:id` | Albums; `?delen=1` opent direct het deelvenster (WOW 3) |
| `/verhalen`, `/verhalen/:id` | Verhalenboek |
| `/familie` | Familiekring, uitnodigen, kijkweergave |
| `/kluis` | Documentenkluis (fictief) |
| `/bronnen` | Bronnen & importwizard, digitaliseren |
| `/nalatenschap`, `/nalatenschap/voorbeeld?wens=:id` | Later doorgeven en voorbeeld voor ontvanger (WOW 4; `?wens=mila` start de wens) |
| `/nationaal-archief`, `/nationaal-archief/aanbieden?foto=:id` | Erfgoed en aanbiedingswizard (WOW 5) |
| `/schatkamer` | De Schatkamer (conceptfragmenten) |
| `/instellingen`, `/hulp`, `/zoeken?q=` | Instellingen, hulp/FAQ, universeel zoeken |

## Demo-engine
- `src/demo/store.tsx` — centrale state in localStorage onder **`mbg-demo-v2`**, met `SEED_VERSION` in `src/data/seed.ts`. Bronseed en gebruikerswijzigingen zijn gescheiden: *Reset* zet de seed opnieuw neer.
- Mutaties: `toggleFavorite`, `createAlbum`, `addMediaToAlbum`, `removeMediaFromAlbum`, `addStory`, `shareAlbum`, `unshareAlbum`, `invitePerson`, `completeImport` (kloont lokale fixtures), `updateLegacyWish`, `setLegacyContacts`, `setDocumentRecipient`, `setAlbumRecipients`, `submitHeritageDemo`, `attachSchatkamerReference`, `saveFragment`, `updateDocument`, `updateSettings`, `setViewAs`, `resetDemo`.
- Alle acties hebben een zichtbaar en blijvend effect op andere schermen (zie `DEMO_TEST_REPORT.md`).

## Mockdata
| Wat | Aantal | Bestand |
|---|---|---|
| Personen (4 generaties) | 8 | `src/data/people.ts` |
| Media met echte thumbnail | 71 (63 foto's, 8 video-stills) + 3 audioberichten | `src/data/media.json` (gegenereerd) |
| Albums | 10 | `src/data/seed.ts` |
| Verhalen (≥ 150 woorden, elke generatie) | 7 | `src/data/stories.ts` |
| Documenten (fictief) | 12 | `src/data/documents.ts` |
| Bronnen | 10 | `src/data/sources.ts` |
| Schatkamer-conceptfragmenten | 5 | `src/data/schatkamer.ts` |

Types: `src/data/types.ts` (`DemoPerson`, `DemoMedia`, `DemoAlbum`, `DemoStory`, `DemoDocument`, `DemoSource`, `DemoFamilyPermission`, `DemoLegacyInstruction`, `DemoHeritageSubmission`, `DemoSchatkamerFragment`, …).

## Beelden, herkomst en licenties
- Lokaal in `public/demo-media/{full,thumbs,avatars}` — geen hotlinks.
- `public/demo-media/manifest.json`: per beeld `id, file, alt, copyrightNote, personIds, eventId, year`.
- `public/demo-media/CREDITS.md`: licentie, maker en bron-URL per bestand.
- Herkomst: (1) AI-beelden uit de conceptpresentatie *Mijn Beeld & Geluid* (o.a. de familieleden-avatars en de hero); (2) vrij gelicentieerde foto's (CC0, publiek domein, CC BY, CC BY-SA) via Openverse en Wikimedia Commons, bewerkt (uitsnede, verkleining, tijdperk-kleurbehandeling).
- **Personen op de foto's zijn niet de fictieve familieleden**; de beelden zijn illustratief. Beelden waarop herkenbare publieke figuren stonden zijn bewust verwijderd.
- Regenereren: `python3 scripts/build_media.py <kandidaten> <pdf-beelden>` (bron in `scripts/media_source.py`). Controle op kapotte paden en onbekende ID's: `python3 scripts/check_refs.py`.
- Ontbreekt een beeld toch, dan toont de `Img`-component een rustige fallback (“Afbeelding niet beschikbaar”) in plaats van een kapot icoon.

## Testen
```bash
npm run dev
ONLY=main node tests/e2e.cjs        # scenario's (ook: ONLY=vp voor 1440/768/390 px)
node tests/dead-buttons.cjs         # klikt elke zichtbare knop
```
Uitslag in `tests/results-*.json`; dode-knoppencheck: `node tests/dead-buttons.cjs`. Verslag in `DEMO_TEST_REPORT.md` en `WOW_SCORECARD.md`.

## Beperkingen (bewust)
- Geen backend, inlog, uploads, betalingen, e-mail, versleuteling of echte koppelingen. Alles wat zo lijkt, is gelabeld als *demo*, *voorbeeld* of *concept*.
- Video's en audio zijn voorbeeldspelers (still + tijdlijn + transcript); er wordt geen echt beeld/geluid afgespeeld.
- “Bekijk als …” is een demonstratieve weergave, geen identiteitswissel.
- Verificatie, nalatenschap, het nationaal archief en De Schatkamer zijn ontwerpconcepten zonder juridische of technische garantie.
- Bewerken van bestaande verhalen, verwijderen van foto's en eigen uploads zijn niet beschikbaar; die knoppen tonen een duidelijke uitleg.
