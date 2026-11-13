# Demo-testverslag

**Datum:** 13 november 2026 · **Omgeving:** productiebuild (`vite build` + `vite preview`), Chromium via Playwright · **Scripts:** `tests/e2e.cjs` (scenario's en viewports), `tests/dead-buttons.cjs` (alle knoppen), `scripts/check_refs.py` (data en paden)

## Samenvatting
| Onderdeel | Resultaat |
|---|---|
| Scenariotests (`ONLY=main`) | **21 / 21 geslaagd** |
| Viewports 1440 / 768 / 390 px (`ONLY=vp`) | **Geslaagd**: geen horizontale scroll, geen kapotte beelden op 20 routes × 3 breedtes |
| Dode knoppen (`tests/dead-buttons.cjs`) | Bezig: uitslag volgt in een volgende commit |
| Data en paden (`scripts/check_refs.py`) | **OK**: 74 media (63 foto's, 8 video's, 3 audio), alle ID's en bestanden bestaan |
| JS-fouten en 404's | **0** tijdens alle scenario's |
| TypeScript (`tsc -b`) en build | Zonder fouten |

## De 14 kritieke scenario's uit de masterprompt
| # | Scenario | Resultaat | Opmerking |
|---|---|---|---|
| 1 | Alle routes direct via URL en via het menu; back/forward | ✅ | 20 routes, 13 menu-items |
| 2 | Alle zichtbare knoppen en links functioneel | ⏳ Bezig | Elke knop vanuit een schone state geklikt; een effect is een URL-wijziging, DOM-wijziging of geopende dialoog/menu |
| 3 | Album “Familieweekend” met twee foto's → in Albums → blijft na refresh | ✅ | Ook: een foto via de lichtbak toevoegen staat echt in het album |
| 4 | Favoriet aan → in Favorieten → uit → weg | ✅ | |
| 5 | Verhaal bij een foto van oma Nel → in Verhalen → detail → terug; ook bij de foto | ✅ | |
| 6 | “Zomers in Zeeland” delen met Ineke → Bekijk als Ineke → gedeelde albums, geen kluis | ✅ | Ook zoeken op documenten levert niets op in de kijkweergave |
| 7 | Import met een demobron → nieuwe items in Foto's | ✅ | 74 → 76 |
| 8 | Bewaarwens → voorbeeld voor de ontvanger → terug naar een bijgewerkt overzicht | ✅ | Ook het startscherm toont het nieuwe aantal |
| 9 | Nationaal-archiefwizard met verplichte toestemming → status zichtbaar, origineel privé | ✅ | Zonder alle vier de toestemmingen kun je niet verder; de privacy van het origineel blijft gelijk |
| 10 | 5 WOW-scenario's en de volledige rondleiding | ✅ | Rondleiding: /voor-jou → /fotos → /foto/m-1988-kitchen → /tijdlijn → /albums/al-zeeland → /kluis → /nalatenschap → /nationaal-archief → eindscherm |
| 11 | Toetsenbord: Tab, Enter, Esc, pijltjes in de lichtbak, focus, modals | ✅ | Bug gevonden en opgelost: bij snelle pijltjesdrukken sprong de lichtbak naar de verkeerde foto |
| 12 | 1440 / 768 / 390 px, mobiel menu | ✅ | Bug gevonden en opgelost: het welkomstpaneel lag over het mobiele menu |
| 13 | Netwerk en console | ✅ | 0 fouten, 0 × 404 |
| 14 | Reset → oorspronkelijke staat | ✅ | Albums, verhalen, aanbiedingen, imports en delen teruggezet |

Aanvullend getest: Schatkamer-fragment koppelen aan een verhaal, familie uitnodigen, document openen in de kluis, presentator-modus, herinneringsspeler, vraag aan de familie, WOW-voortgang.

## Per scherm
| Scherm | Gecontroleerde acties | Resultaat | Eventueel probleem |
|---|---|---|---|
| Voor jou | Hero, 4 acties, tijdmachine, herinneringsspeler, Vandaag, oma Nel, albums, archiefstatus, vraag van de week, wensen, welkomstpaneel | ✅ | — |
| Foto's & video's | Tabs, jaar/persoon/plaats/bron, sorteren, selectiemodus en bulkacties, lege staten, lichtbak | ✅ | Opgelost: horizontale scroll op mobiel, tegels vulden het vlak niet |
| Foto-detail | Favoriet, album, delen, download (voorbeeldbestand), verhaal of inspreken, familie-modal, meer uit jaar, bewaren voor Mila | ✅ | — |
| Tijdlijn / Tijdmachine | Jaarbalk, mijlpalen, fotogroepen, 7 hoofdstukken, pijltjes, Esc, epiloog | ✅ | — |
| Albums / detail | Nieuw album met omslag, hoofdstukken, delen, kijkweergave, foto's toevoegen en weghalen, later doorgeven | ✅ | Opgelost: een losse foto op de laatste rij werd te groot |
| Verhalen / detail | Filter op verteller, audiokaarten met transcript, magazineweergave, Schatkamer-verwijzing, bewaren voor Mila | ✅ | — |
| Familiekring | Stamboom, gedeelde albums, uitnodigen, wie ziet wat, documenttoestemming (demo), kijkweergave, vragen aan de familie | ✅ | — |
| Documentenkluis | Openen (demo), zoeken, categorieën, drawer, bekijken, info aanpassen, toegang regelen | ✅ | — |
| Bronnen | Koppelen en importeren (wizard in 4 stappen), loskoppelen, digitaliseren | ✅ | — |
| Later doorgeven | Contactpersonen, albums en documenten later, bewaarwensen, voorbeeld | ✅ | — |
| Nationaal archief | Proces, voorbeeldkaart, wizard, curatoroverzicht, intrekken | ✅ | — |
| De Schatkamer | Zoeken, detail, bewaren, koppelen aan een verhaal | ✅ | — |
| Instellingen / Hulp / Zoeken | Toggles (grotere tekst, minder beweging), privacy, opslag, abonnement (concept), reset, FAQ, gegroepeerde zoekresultaten | ✅ | — |

## Gevonden en opgeloste problemen (alle rondes)
1. **Herkenbare publieke personen in de archiefbeelden** (een beroemd bruidspaar, een koninklijke familie, twee politici): vervangen door anonieme beelden. Alle licenties zijn opnieuw geverifieerd.
2. Albumkaarten, galerijtegels en hero vulden hun vlak niet (een CSS-positieconflict).
3. Avatars verkeerd uitgesneden.
4. Horizontale scroll op mobiel in de galerij.
5. Lege `src`-attributen (console-waarschuwing).
6. Lichtbak sprong bij snelle pijltjesdrukken naar de verkeerde foto (verouderde state in de toetsenbordhandler).
7. Welkomstpaneel lag op mobiel over het menu.
8. Bij een tussentijdse wijziging herlaadde de dev-server midden in een test; de tests draaien nu tegen een productiebuild.

## Wat niet (volledig) getest kon worden
- **Lighthouse / Core Web Vitals** zijn niet gemeten (geen Lighthouse in deze omgeving). Indicatie: de JS-bundel is ongeveer 180 KB gzip, de hero wordt voorgeladen en de overige beelden laden lui.
- **Schermlezers** (NVDA, VoiceOver) zijn niet getest. Wel gecontroleerd: labels, `aria-*`, focus-trap in dialogen, zichtbare focusring en een skip-link.
- **Contrast** is niet automatisch gemeten. De kleuren volgen het opgegeven palet; tekst staat donker op licht (ink op paper/wit) of wit op ink/brand.
- **Safari en Firefox** zijn niet getest, alleen Chromium.
