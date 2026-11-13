# WOW-scorecard

Beoordeeld op basis van de browserinspectie (desktop 1440 px, tablet 768 px, mobiel 390 px) en de geautomatiseerde bezoekerstest (`tests/e2e.cjs`). ✅ = voldoet, ⚠️ = voldoet met kanttekening.

| WOW | Sterk visueel | Begrijpelijk zonder uitleg | Klikroute compleet | Data consistent | Privacy correct | Mobiel goed |
|---|---|---|---|---|---|---|
| **1. De tijdmachine** (`/tijdmachine`) | ✅ Schermvullende beelden per tijdperk (zwart-wit, sepia, verbleekte kleur, modern), jaartal in 150 px, crossfades | ✅ Eén zin per hoofdstuk, voortgangsbalk, knoppen en pijltjes | ✅ 7 hoofdstukken → epiloog “Dit verhaal geef je door” → *Bekijk mijn wensen / Ga naar mijn albums / Ga zelf verder* | ✅ Zelfde foto's en personen als in het archief; *Bekijk foto* opent het detail | ✅ n.v.t. | ✅ Compacte knoppen op 390 px |
| **2. Achter iedere foto zit een verhaal** (`/foto/m-1988-kitchen`) | ✅ Foto in een papieren passe-partout, magazinetekst met initiaal, citaat | ✅ | ✅ *Ontdek wie erbij horen* (familie-modal), *Bekijk meer uit 1988* (gefilterd), *Bewaar dit verhaal voor Mila* (zichtbaar in Later doorgeven) | ✅ Generatieketen Nel → Pieter → Sanne → Mila; gekoppelde foto's en albums kloppen | ✅ Toont met wie gedeeld | ✅ |
| **3. Samen herinneren** (`/albums/al-zeeland`) | ✅ Albumhero, drie hoofdstukken 1994 / 2024 / de avonden | ✅ Delen → kies Ineke en Marieke → direct overzicht van toegang | ✅ *Bekijk als Ineke* → gelabelde kijkweergave → *Terug naar Sanne* | ✅ Ineke ziet precies haar gedeelde albums | ✅ Kluis en zoeken op documenten afgeschermd in de kijkweergave; toegang tot de kluis alleen via een aparte demo-toestemming | ✅ |
| **4. Een nalatenschap die raakt** (`/nalatenschap?wens=mila`) | ✅ Voorbeeldweergave als brief op crèmekleurig papier, met verhalen en polaroids | ✅ “Zo zou dit er later uit kunnen zien” | ✅ Wens maken → voorbeeld → sluiten → overzicht met gemarkeerde, bijgewerkte wens; het startscherm telt mee | ✅ | ✅ Overal gelabeld als concept, geen garantie | ✅ |
| **5. Van familieherinnering naar erfgoed** (`/nationaal-archief/aanbieden?foto=m-1975-haarlem`) | ✅ Curatoroverzicht met status | ✅ Vier stappen, vier verplichte toestemmingen | ✅ Indienen → *Ingediend (demo) · wacht op beoordeling* → *Mijn bijdragen* → slotzin | ✅ Status ook zichtbaar bij de foto in de lichtbak | ✅ Origineel blijft ongewijzigd privé (getest) | ✅ |

## Aanvullende ervaringen (ronde 2)
| Ervaring | Waarom | Status |
|---|---|---|
| Herinneringsspeler (“Herinneringen voor jou”) | Aha-moment binnen tien seconden, vertrouwd patroon uit fotoapps | ✅ Getest (scenario 15) |
| Vraag het aan de familie | Verhalen van de oudere generatie zonder drempel | ✅ Getest (scenario 16) |
| Voortgang “x van 5 ontdekt” | Checklistpatroon uit interactieve demo's | ✅ Getest (scenario 17) |

## Kanttekeningen
- ⚠️ De beelden zijn illustratief: personen op foto's zijn niet steeds dezelfde fictieve familieleden. De avatars en hoofdbeelden van de familie komen uit de AI-beelden van de presentatie en zijn onderling consistent. De archieffoto's zijn vrij gelicentieerd en tonen verschillende mensen.
- ⚠️ Video en audio zijn voorbeeldspelers (still, tijdlijn en transcript), duidelijk gelabeld.
