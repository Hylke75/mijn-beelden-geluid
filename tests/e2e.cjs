/* Bezoekerstest voor de demo. Gebruik: node tests/e2e.cjs [baseUrl]
   Voert de 14 scenario's uit DEMO_TEST_REPORT.md uit en schrijft tests/results.json. */
const { chromium } = require('playwright')
const fs = require('fs')
const BASE = process.argv[2] || 'http://127.0.0.1:5173'
const ONLY = (process.env.ONLY || 'main,vp,dead').split(',')
const ROUTES = ['/voor-jou', '/fotos', '/foto/m-1988-kitchen', '/tijdlijn', '/tijdmachine', '/albums', '/albums/al-zeeland', '/verhalen', '/verhalen/s-nel-appeltaart', '/familie', '/kluis', '/bronnen', '/nalatenschap', '/nalatenschap/voorbeeld?wens=wish-daan', '/nationaal-archief', '/nationaal-archief/aanbieden', '/schatkamer', '/instellingen', '/zoeken?q=Mila', '/hulp']
const results = []
const log = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const expect = (c, msg) => { if (!c) throw new Error(msg) }

async function newPage(b, vp = { width: 1440, height: 900 }) {
  const ctx = await b.newContext({ viewport: vp })
  const p = await ctx.newPage()
  p.errors = []
  p.on('pageerror', (e) => p.errors.push('pageerror: ' + e.message))
  p.on('console', (m) => m.type() === 'error' && p.errors.push('console: ' + m.text()))
  p.on('response', (r) => r.status() >= 400 && p.errors.push(`${r.status()} ${r.url()}`))
  return p
}
const go = (p, path) => p.goto(BASE + path, { waitUntil: 'networkidle' })
let P0; const p_reset_view = async () => { if (!P0) return; await P0.goto(BASE + '/voor-jou', { waitUntil: 'networkidle' }); await P0.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('mbg-demo-v2')); if (s && s.viewAs !== 'sanne') { s.viewAs = 'sanne'; localStorage.setItem('mbg-demo-v2', JSON.stringify(s)) } } catch {} }) }
const reset = async (p) => { await go(p, '/voor-jou'); await p.evaluate(() => { localStorage.clear(); sessionStorage.clear() }); await go(p, '/voor-jou') }
async function run(name, fn) { try { await p_reset_view() ; const d = await fn(); log(name, true, d || '') } catch (e) { log(name, false, e.message.split('\n')[0]) } }

;(async () => {
  const b = await chromium.launch()
  const p = await newPage(b); P0 = p
  await reset(p)

  if (ONLY.includes('main')) {
  await run('1. Alle routes direct via URL, menu en back/forward', async () => {
    for (const r of ROUTES) { await go(p, r); expect(await p.locator('h1, [role=dialog]').first().isVisible(), `geen inhoud op ${r}`) }
    await go(p, '/voor-jou')
    const labels = ["Foto's & video's", 'Tijdlijn', 'Albums', 'Verhalen', 'Documentenkluis', 'Bronnen & importeren', 'Familiekring', 'Later doorgeven', 'Nationaal archief', 'De Schatkamer', 'Instellingen', 'Hulp', 'Voor jou']
    for (const l of labels) { await p.locator('aside nav a, aside a').filter({ hasText: l }).first().click(); await p.waitForTimeout(350); expect(await p.locator('aside a[aria-current=page]').innerText() === l, `menu ${l} niet actief`) }
    await p.goBack(); await p.waitForTimeout(150); expect(p.url().includes('/hulp'), 'back werkt niet')
    await p.goForward(); await p.waitForTimeout(150); expect(p.url().includes('/voor-jou'), 'forward werkt niet')
    return `${ROUTES.length} routes, ${labels.length} menu-items`
  })

  await run('3. Album “Familieweekend” met twee foto\'s, blijft na refresh', async () => {
    await go(p, '/albums'); await p.getByRole('button', { name: 'Nieuw album' }).first().click()
    await p.getByLabel('Naam van het album').fill('Familieweekend')
    const tiles = p.locator('[role=dialog] button[aria-pressed]')
    await tiles.nth(0).click(); await tiles.nth(3).click()
    await p.getByRole('button', { name: 'Album maken' }).click(); await p.waitForTimeout(300)
    expect(/\/albums\/album-/.test(p.url()), 'niet naar nieuw album genavigeerd')
    expect(await p.getByRole('heading', { name: 'Familieweekend' }).isVisible(), 'titel ontbreekt')
    await go(p, '/albums'); expect(await p.getByText('Familieweekend').first().isVisible(), 'niet in albumlijst')
    await p.reload({ waitUntil: 'networkidle' }); expect(await p.getByText('Familieweekend').first().isVisible(), 'weg na refresh')
    await p.getByText('Familieweekend').first().click(); await p.waitForTimeout(200)
    expect(await p.getByText('2 herinneringen').first().isVisible(), 'album bevat geen 2 items')
  })

  await run('3b. Foto via lichtbak aan album toevoegen staat echt in album', async () => {
    await go(p, '/fotos?m=m-2021-deer'); await p.getByRole('button', { name: 'Aan album' }).click()
    await p.locator('[role=dialog]').getByRole('button', { name: /Familieweekend/ }).click(); await p.waitForTimeout(200)
    await p.keyboard.press('Escape'); await go(p, '/albums'); await p.getByText('Familieweekend').first().click(); await p.waitForTimeout(200)
    expect(await p.getByText('3 herinneringen').first().isVisible(), 'foto niet in album')
  })

  await run('4. Favoriet aan → in Favorieten → uit → weg', async () => {
    await go(p, '/fotos?m=m-2021-heide'); await p.getByRole('button', { name: 'Favoriet', exact: true }).click(); await p.keyboard.press('Escape')
    await go(p, '/fotos?filter=favorieten'); expect(await p.getByRole('button', { name: /De paarse heide/ }).count() > 0, 'niet in favorieten')
    await go(p, '/fotos?filter=favorieten&m=m-2021-heide'); await p.getByRole('button', { name: 'Verwijder uit favorieten' }).click(); await p.keyboard.press('Escape')
    await go(p, '/fotos?filter=favorieten'); expect(await p.getByRole('button', { name: /De paarse heide/ }).count() === 0, 'nog in favorieten')
  })

  await run('5. Verhaal bij foto van oma Nel → in Verhalen en bij de foto', async () => {
    await go(p, '/foto/m-1988-pie'); await p.getByRole('button', { name: 'Vertel het verhaal' }).click()
    await p.getByLabel('Titel').fill('Rozijnen voor Pieter'); await p.getByLabel('Jouw verhaal').fill('Oma Nel deed er altijd een handje extra rozijnen in, speciaal voor mijn vader.')
    await p.getByRole('button', { name: 'Verhaal bewaren' }).click(); await p.waitForTimeout(300)
    expect(/\/verhalen\/story-/.test(p.url()), 'niet naar verhaal')
    await go(p, '/verhalen'); expect(await p.getByText('Rozijnen voor Pieter').first().isVisible(), 'niet in Verhalen')
    await p.getByText('Rozijnen voor Pieter').first().click(); await p.waitForTimeout(200); expect(await p.getByRole('heading', { name: 'Rozijnen voor Pieter' }).isVisible(), 'detail mist')
    await p.goBack(); await p.waitForTimeout(200); expect(p.url().endsWith('/verhalen'), 'terug werkt niet')
    await go(p, '/foto/m-1988-pie'); expect(await p.getByRole('heading', { name: 'Rozijnen voor Pieter' }).isVisible(), 'niet bij de foto')
  })

  await run('6. Deel “Zomers in Zeeland” met Ineke en Marieke → Bekijk als Ineke → geen kluis', async () => {
    await go(p, '/albums/al-zeeland'); await p.getByRole('button', { name: 'Deel met familie' }).click()
    const d = p.locator('[role=dialog]')
    await d.getByRole('button', { name: 'Kies Ineke' }).click()
    await d.getByRole('button', { name: 'Kies Marieke' }).click()
    await d.getByRole('button', { name: 'Delen' }).click(); await p.waitForTimeout(200)
    expect(await d.getByText('Kan bekijken').count() >= 2, 'toegang niet getoond')
    await d.getByRole('button', { name: /Bekijk als Ineke/ }).click(); await p.waitForTimeout(300)
    expect(await p.getByText('Demonstratieve kijkweergave').isVisible(), 'geen kijkweergave-banner')
    expect(await p.getByText('Zomers in Zeeland').first().isVisible(), 'gedeeld album niet zichtbaar')
    expect(await p.getByText('Mila & Daan').count() === 0, 'niet-gedeeld album zichtbaar')
    await go(p, '/kluis'); expect(await p.getByText('De documentenkluis is privé').isVisible(), 'kluis zichtbaar voor Ineke')
    await go(p, '/zoeken?q=testament'); expect(await p.getByText(/Niets gevonden/).isVisible(), 'document vindbaar voor Ineke')
    await p.getByRole('button', { name: 'Terug naar Sanne' }).click(); await p.waitForTimeout(200)
    expect(await p.getByText('Demonstratieve kijkweergave').count() === 0, 'niet terug naar Sanne')
  })

  await run('7. Import-wizard → nieuwe items in Foto\'s', async () => {
    await go(p, '/fotos'); const before = Number((await p.getByText(/\d+ resultaten/).innerText()).split(' ')[0])
    await go(p, '/bronnen'); await p.locator('div.card', { hasText: 'WhatsApp-export' }).getByRole('button', { name: 'Importeren' }).click()
    await p.getByRole('button', { name: 'Verder' }).click(); await p.getByRole('button', { name: /Start import/ }).click()
    await p.getByText('Klaar (demo)').first().waitFor({ timeout: 4000 })
    await p.getByRole('button', { name: /Bekijk in Foto/ }).click(); await p.waitForTimeout(300)
    const after = Number((await p.getByText(/\d+ resultaten/).innerText()).split(' ')[0])
    expect(after === before + 2, `verwacht ${before + 2}, kreeg ${after}`)
    return `${before} → ${after}`
  })

  await run('8. Bewaarwens voor Mila → voorbeeld → terug met bijgewerkte wens', async () => {
    await go(p, '/nalatenschap?wens=mila'); await p.waitForTimeout(300)
    await p.getByRole('button', { name: /Opslaan en voorbeeld voor Mila/ }).click(); await p.waitForTimeout(300)
    expect(p.url().includes('/nalatenschap/voorbeeld'), 'geen voorbeeld')
    expect(await p.getByText('Zo zou dit er later uit kunnen zien').isVisible(), 'label ontbreekt')
    expect(await p.getByText('Lieve Mila,', { exact: false }).first().isVisible(), 'brief ontbreekt')
    await p.getByRole('button', { name: 'Sluiten', exact: true }).first().click(); await p.waitForTimeout(300)
    expect(await p.getByText('Bijgewerkt').isVisible(), 'wens niet gemarkeerd')
    expect(await p.getByRole('heading', { name: 'Voor Mila' }).isVisible(), 'wens voor Mila niet in overzicht')
    await go(p, '/voor-jou'); expect(await p.getByText(/2 bewaarwensen/).isVisible(), 'dashboard niet bijgewerkt')
  })

  await run('9. Nationaal-archiefwizard met verplichte toestemming → status, origineel privé', async () => {
    await go(p, '/fotos?m=m-1975-haarlem'); const privBefore = await p.locator('aside dl div', { hasText: 'Privacy' }).innerText()
    await go(p, '/nationaal-archief/aanbieden?foto=m-1975-haarlem'); await p.getByRole('button', { name: 'Volgende' }).click()
    expect(await p.getByRole('button', { name: 'Volgende' }).isDisabled(), 'kan zonder toestemming verder')
    for (const cb of await p.locator('input[type=checkbox]').all()) await cb.check()
    await p.getByRole('button', { name: 'Volgende' }).click(); await p.getByRole('button', { name: 'Indienen in demo' }).click(); await p.waitForTimeout(300)
    expect(await p.getByText('De herinneringen van vandaag zijn het erfgoed van morgen.').isVisible(), 'slotzin ontbreekt')
    await go(p, '/nationaal-archief'); expect(await p.getByText('Ingediend (demo) · wacht op beoordeling').first().isVisible(), 'status niet in Mijn bijdragen')
    await go(p, '/fotos?m=m-1975-haarlem'); const privAfter = await p.locator('aside dl div', { hasText: 'Privacy' }).innerText()
    expect(privBefore === privAfter, `privacy van origineel gewijzigd: ${privBefore} → ${privAfter}`)
    expect(await p.evaluate(() => JSON.parse(localStorage.getItem('mbg-demo-v2')).media.find((m) => m.id === 'm-1975-haarlem').visibility === 'private'), 'origineel niet meer privé')
    expect(await p.getByText(/Het origineel blijft privé/).isVisible(), 'erfgoedstatus niet bij foto')
  })

  await run('9b. Schatkamer-fragment koppelen aan verhaal', async () => {
    await go(p, '/schatkamer?verhaal=s-nel-appeltaart'); await p.locator('article', { hasText: 'Bakken zoals oma het deed' }).getByRole('button', { name: 'Voeg het verhaal toe' }).click()
    await go(p, '/verhalen/s-nel-appeltaart'); expect(await p.getByText('Uit De Schatkamer').isVisible() && await p.getByText('Bakken zoals oma het deed').isVisible(), 'verwijzing niet bij verhaal')
  })

  await run('9c. Familie uitnodigen → in Uitnodigingen', async () => {
    await go(p, '/familie'); await p.getByRole('button', { name: 'Uitnodigen' }).first().click()
    await p.getByLabel('Naam').fill('Oom Kees'); await p.getByRole('button', { name: 'Uitnodiging klaarzetten' }).click(); await p.getByRole('button', { name: 'Klaar' }).click()
    expect(await p.getByText('Oom Kees').first().isVisible(), 'uitnodiging niet zichtbaar')
  })

  await run('9d. Document openen in kluis met demo-labels', async () => {
    await go(p, '/kluis'); await p.getByRole('button', { name: /Open de kluis/ }).click()
    await p.getByRole('button', { name: /Receptenschrift oma Nel/ }).click(); await p.waitForTimeout(200)
    expect(await p.locator('[role=dialog]').getByText('In deze demo worden geen echte documenten opgeslagen of beveiligd.').isVisible(), 'waarschuwing ontbreekt')
    await p.getByRole('button', { name: 'Bekijken' }).click(); expect(await p.getByText(/geen echt document/).isVisible(), 'preview ontbreekt')
    await p.keyboard.press('Escape'); await p.keyboard.press('Escape')
  })

  await run('10a. Vijf WOW-ervaringen bereikbaar via “Ontdek de mogelijkheden”', async () => {
    for (let i = 0; i < 5; i++) {
      await go(p, '/voor-jou'); await p.getByRole('button', { name: 'Ontdek de mogelijkheden' }).first().click()
      await p.locator('[role=dialog] li button').nth(i).click(); await p.waitForTimeout(500)
      expect(await p.locator('h1, h2').first().isVisible(), `WOW ${i + 1} leeg`)
    }
    await go(p, '/tijdmachine'); for (let i = 0; i < 7; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(80) }
    expect(await p.getByText('Dit verhaal geef je door.').isVisible(), 'tijdmachine eindigt niet')
    await p.getByRole('button', { name: 'Ga naar mijn albums' }).click(); expect(p.url().includes('/albums'), 'vervolgstap werkt niet')
  })

  await run('10b. Rondleiding 8 stappen tot “Terug naar mijn archief”', async () => {
    await go(p, '/voor-jou'); await p.getByRole('button', { name: /Geef me een rondleiding/ }).first().click(); await p.getByRole('button', { name: /Start rondleiding/ }).click()
    const routes = []
    for (let i = 0; i < 8; i++) { await p.waitForTimeout(450); routes.push(new URL(p.url()).pathname); await p.getByRole('button', { name: i === 7 ? 'Afronden' : 'Volgende' }).click() }
    expect(await p.getByText('Je hebt de mogelijkheden ontdekt.').isVisible(), 'geen eindscherm')
    await p.getByRole('button', { name: 'Terug naar mijn archief' }).click(); expect(p.url().includes('/voor-jou'), 'niet terug')
    return routes.join(' → ')
  })

  await run('10c. Presentator-modus ?presenter=1', async () => {
    await go(p, '/voor-jou?presenter=1'); const panel = p.getByLabel('Presentator-paneel'); expect(await panel.isVisible(), 'geen paneel')
    for (const n of ['Tijdmachine', 'Oma Nels verhaal', 'Familie delen', 'Later doorgeven', 'Nationaal archief', 'Start']) { await panel.getByRole('button', { name: n }).click(); await p.waitForTimeout(300); await p.keyboard.press('Escape').catch(() => {}) }
    await go(p, '/voor-jou?presenter=0')
  })

  await run('11. Toetsenbord: lichtbak pijltjes/Esc, modal Esc, focus zichtbaar', async () => {
    await go(p, '/fotos'); await p.locator('main button[aria-label^="Open foto"]').first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(200)
    const u1 = p.url(); await p.keyboard.press('ArrowRight'); await p.waitForURL((u) => u.href !== u1, { timeout: 3000 }).catch(() => {})
    const u2 = p.url(); expect(u1 !== u2, 'pijltje rechts werkt niet')
    await p.keyboard.press('ArrowLeft'); await p.waitForURL((u) => u.href !== u2, { timeout: 3000 }).catch(() => {}); expect(p.url() === u1, 'pijltje links werkt niet')
    await p.keyboard.press('Escape'); await p.waitForTimeout(150); expect(await p.locator('[aria-label^="Lichtbak"]').count() === 0, 'Esc sluit lichtbak niet')
    await p.getByRole('button', { name: 'Toevoegen' }).first().click(); await p.getByRole('menuitem', { name: /Album maken/ }).click(); await p.waitForTimeout(150)
    expect(await p.locator('[role=dialog]').isVisible(), 'modal opent niet'); await p.keyboard.press('Escape'); await p.waitForTimeout(150); expect(await p.locator('[role=dialog]').count() === 0, 'Esc sluit modal niet')
    await go(p, '/voor-jou'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab')
    const outline = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
    expect(outline !== 'none', 'geen zichtbare focus')
  })

  await run('13. Geen JS-fouten of 404\'s tijdens alle scenario\'s', async () => { expect(p.errors.length === 0, p.errors.slice(0, 3).join(' | ')) })

  await run('14. Reset → oorspronkelijke staat', async () => {
    await go(p, '/instellingen'); await p.getByRole('button', { name: 'Demo opnieuw instellen' }).first().click(); await p.getByRole('dialog').getByRole('button', { name: 'Opnieuw starten', exact: true }).click(); await p.waitForTimeout(300)
    await go(p, '/albums'); expect(await p.getByText('Familieweekend').count() === 0, 'album nog aanwezig')
    await go(p, '/verhalen'); expect(await p.getByText('Rozijnen voor Pieter').count() === 0, 'verhaal nog aanwezig')
    await go(p, '/nationaal-archief'); expect(await p.getByText('Je hebt nog niets aangeboden').isVisible(), 'aanbieding nog aanwezig')
    await go(p, '/fotos'); expect(await p.getByText('74 resultaten').isVisible(), 'import nog aanwezig')
    await go(p, '/albums/al-zeeland'); expect(await p.getByText('Alleen jij ziet dit album.').isVisible(), 'delen niet teruggezet')
  })

  }
  // 2. Dode knoppen
  // Dode knoppen: zie tests/dead-buttons.cjs (sneller, parallel)
  if (ONLY.includes('dead-legacy'))
  await run('2. Geen dode knoppen of links (alle zichtbare knoppen per scherm geklikt)', async () => {
    const dead = []; let total = 0
    const q = await newPage(b)
    for (const r of ROUTES) {
      await go(q, r)
      const n = await q.locator('main button:visible, main a:visible, [role=dialog] button:visible').count()
      for (let i = 0; i < n; i++) {
        await go(q, r); await q.evaluate(() => { localStorage.clear(); sessionStorage.setItem('mbg-vault', '1') }); await go(q, r)
        const el = q.locator('main button:visible, main a:visible, [role=dialog] button:visible').nth(i)
        if (!(await el.count()) || await el.isDisabled().catch(() => true)) continue
        const label = ((await el.getAttribute('aria-label')) || (await el.innerText()).trim()).slice(0, 40)
        const before = await q.evaluate(() => [location.href, document.body.innerHTML.length, document.querySelectorAll('[role=dialog],[role=menu],[role=listbox]').length].join('|'))
        total++
        try { await el.click({ timeout: 1500 }) } catch { continue }
        await q.waitForTimeout(250)
        const after = await q.evaluate(() => [location.href, document.body.innerHTML.length, document.querySelectorAll('[role=dialog],[role=menu],[role=listbox]').length].join('|'))
        if (before === after) dead.push(`${r}: “${label}”`)
      }
    }
    if (q.errors.length) dead.push(...q.errors.slice(0, 3))
    expect(dead.length === 0, `${dead.length} zonder effect: ${dead.slice(0, 12).join('; ')}`)
    return `${total} knoppen/links geklikt`
  })

  // 12. viewports
  if (ONLY.includes('vp')) await run('12. 1440 / 768 / 390 px: geen horizontale scroll, beelden zichtbaar', async () => {
    const issues = []
    for (const vp of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
      const q = await newPage(b, vp)
      for (const r of ROUTES) {
        await go(q, r)
        const sw = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        if (sw > 1) issues.push(`${vp.width}px ${r}: ${sw}px te breed`)
        const broken = await q.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length)
        if (broken) issues.push(`${vp.width}px ${r}: ${broken} kapotte beelden`)
      }
      if (vp.width === 390) {
        await go(q, '/voor-jou'); await q.getByRole('button', { name: 'Meer' }).click(); await q.waitForTimeout(200)
        await q.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Nationaal archief' }).click(); await q.waitForTimeout(200)
        if (!q.url().includes('/nationaal-archief')) issues.push('mobiel Meer-menu werkt niet')
      }
      if (q.errors.length) issues.push(...q.errors.slice(0, 2))
    }
    expect(issues.length === 0, issues.slice(0, 8).join('; '))
  })

  fs.writeFileSync(__dirname + `/results-${ONLY.join('-')}.json`, JSON.stringify({ date: new Date().toISOString(), base: BASE, results }, null, 2))
  console.log(`\n${results.filter((r) => r.ok).length}/${results.length} geslaagd`)
  await b.close()
})()
