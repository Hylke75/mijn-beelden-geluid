# Onderzoek en verbeteringen — ronde 2

## Wat zeggen andere demo's en vergelijkbare producten?

| Bron | Les | Toegepast in de demo |
|---|---|---|
| Interactieve demo-tools ([Tourial](https://www.tourial.com/blog/interactive-demo-best-practices), [Guideflow](https://guideflow.com/blog/interactive-walkthroughs), [Navattic](https://navattic.com/blog/increase-conversions-for-interactive-demos)) | Houd een rondleiding kort (5–15 stappen), noem de duur vooraf en laat de bezoeker na het eerste deel zelf kiezen met een checklist. | Rondleiding van 8 stappen met duur vooraf ("8 stappen · ongeveer 8 minuten"). "Ontdek de mogelijkheden" werkt nu als checklist: "x van 5 ontdekt", met een vinkje per hoogtepunt. |
| [Produktly](https://produktly.com/guides/how-to-create-interactive-product-demos), [NAOMA](https://www.naoma.ai/blog/first-60-seconds-demo), [Presales Collective](https://www.presalescollective.com/content/the-first-90-seconds-of-your-demo-are-already-deciding-the-outcome) | Het aha-moment moet vroeg komen, liefst binnen 30–90 seconden. Raak eerst het gevoel, daarna pas de logica. | Nieuwe rij **Herinneringen voor jou** direct onder de hero: één tik speelt een herinnering schermvullend af ("30 jaar Zeeland", "Oma Nel"…). Emotie binnen tien seconden, zonder uitleg. |
| [Google Photos Memories](https://9to5google.com/2023/09/28/google-photos-memories-redesign/), Apple Foto's "Voor jou" | Mensen herinneren zich hun leven als een reeks betekenisvolle momenten. Automatisch samengestelde, schermvullende verhalen voelen emotioneel en niet technisch. | Herinneringsspeler met voortgangsbalkjes, ondertitels per foto, tikken/pijltjes/spatie, pauzeren, en een slotscherm met *Bekijk album*, *Deel met familie* en *Bewaar als album*. |
| [Remento](https://home.remento.co/journal/17-best-tools-to-capture-and-preserve-family-stories-in-2025), [StoryWorth](https://thenextweb.com/news/storyworth-voice-tools-family-memory), [FamilySearch Memories](https://thegenealogyreporter.com/familysearch-memories-app-to-record-your-voice-and-voices-of-loved-ones/) | De oudere generatie draagt de verhalen. De drempel moet laag zijn: een vraag per keer, antwoorden door in te spreken, geen app of account nodig. | Nieuw: **Vraag het aan de familie**. Stuur oma Ineke een vraag; na een paar seconden komt haar ingesproken antwoord binnen als verhaal, met een melding. In de Familiekring staat een overzicht van open en beantwoorde vragen. |
| [Navattic](https://navattic.com/blog/increase-conversions-for-interactive-demos) | Zet na elk groot "wow"-moment een duidelijke vervolgstap. | Elk WOW-moment en de herinneringsspeler eindigen met concrete vervolgacties, nooit in een doodlopende overlay. |
| [Tourial](https://www.tourial.com/blog/interactive-demo-best-practices) | Zeg vooraf wat de bezoeker kan verwachten. | Rustig **welkomstpaneel** bij het eerste bezoek, dat de rest van het scherm niet blokkeert: "Je kijkt mee in het familiearchief van Sanne", met de keus *Rondleiding (8 min)*, *5 hoogtepunten* of *Zelf rondkijken*. |

Kanttekening: de genoemde getallen (stappen, seconden) komen vooral uit blogs van leveranciers van demo-tools. Zie ze als vuistregels, niet als bewezen benchmarks.

## Systeemcontrole en reparaties in deze ronde
- **Echte publieke personen verwijderd.** Bij een controle van alle bronvermeldingen bleken drie archiefbeelden bekende personen te tonen: een beroemd bruidspaar, een koninklijke familie en twee politici. Ze zijn vervangen door anonieme beelden. Elke afbeelding heeft nu een geverifieerde licentie en bron (byte-voor-byte gecontroleerd tegen het origineel).
- Albumkaarten en de galerij vulden hun vlak niet (een CSS-positieconflict). Opgelost.
- Op mobiel kon de pagina horizontaal scrollen. Opgelost, met een globale bescherming tegen herhaling.
- De avatars waren verkeerd uitgesneden (alleen het bovenhoofd zichtbaar). Opnieuw uitgesneden.
- Er stonden lege `src`-attributen in `<img>` (een console-waarschuwing). Verholpen.
- De grote foto bovenaan het startscherm wordt voorgeladen, voor een snellere eerste indruk.
- De tests draaien nu tegen een productiebuild. De dode-knoppencheck draait parallel, met herhaalpogingen.

## Mogelijke volgende stappen (niet gebouwd)
- Achtergrondmuziek bij de herinneringsspeler (vraagt om gelicentieerde muziek).
- Een rondleiding voor een specifieke persona: een bestuurder ("waarom Beeld & Geluid") en een consument ("wat heb ik eraan").
- Een korte feedbackvraag aan het eind van de rondleiding ("Zou je dit gebruiken?"), handig bij gebruikersonderzoek.
- Code-splitting per route (de bundel is nu ongeveer 180 KB gzip, ruim binnen de norm voor een demo).
