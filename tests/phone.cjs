/* Telefoontest: iPhone 13, Pixel 5 en 360 px. Controleert horizontale scroll, inzoomende invoervelden (<16px),
   JS-fouten, en veegbewegingen in lichtbak, tijdmachine en herinneringsspeler. Gebruik: node tests/phone.cjs [baseUrl] */
const { chromium, devices } = require('playwright')
const BASE = process.argv[2] || 'http://127.0.0.1:4173'
const ROUTES = ['/voor-jou', '/fotos', '/foto/m-1988-kitchen', '/tijdlijn', '/tijdmachine', '/albums', '/albums/al-zeeland', '/verhalen', '/verhalen/s-nel-appeltaart', '/familie', '/kluis', '/bronnen', '/nalatenschap', '/nalatenschap/voorbeeld?wens=wish-daan', '/nationaal-archief', '/nationaal-archief/aanbieden?foto=m-1975-haarlem', '/schatkamer', '/instellingen', '/zoeken?q=Mila', '/hulp', '/fotos?m=m-1994-beach']
const fails = []; let checks = 0
const ok = (c, msg) => { checks++; if (!c) { fails.push(msg); console.log('FAIL ' + msg) } }
;(async () => {
  const b = await chromium.launch()
  for (const [name, dev] of [['iPhone 13', devices['iPhone 13']], ['Pixel 5', devices['Pixel 5']], ['360 px', { ...devices['Galaxy S9+'], viewport: { width: 360, height: 740 } }]]) {
    const ctx = await b.newContext({ ...dev }); const p = await ctx.newPage(); const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    await p.goto(BASE + '/voor-jou', { waitUntil: 'networkidle' }); const w = p.getByText('Liever zelf rondkijken'); ok(await w.isVisible(), `${name}: welkomstpaneel bij eerste bezoek`); await w.tap()
    for (const r of ROUTES) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' })
      const res = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth - innerWidth,
        zoom: [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=range]), select, textarea')].filter((e) => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 16).length,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length }))
      ok(res.sw <= 1, `${name} ${r}: ${res.sw}px horizontale scroll`); ok(res.zoom === 0, `${name} ${r}: ${res.zoom} invoervelden < 16px`); ok(res.broken === 0, `${name} ${r}: ${res.broken} kapotte beelden`)
    }
    const swipe = async (dx, dy = 0) => { const [x, y] = await p.evaluate(() => [innerWidth / 2, innerHeight / 2]); const cdp = await ctx.newCDPSession(p)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
      for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * k) / 5, y: y + (dy * k) / 5 }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(400) }
    await p.goto(BASE + '/fotos', { waitUntil: 'networkidle' }); await p.locator('main button[aria-label^="Open foto"]').first().tap(); await p.waitForTimeout(400)
    const u0 = p.url(); await swipe(-200); const u1 = p.url(); await swipe(200); const u2 = p.url(); await swipe(0, 260)
    ok(u0 !== u1 && u2 === u0 && !p.url().includes('m='), `${name}: vegen in lichtbak`)
    await p.goto(BASE + '/tijdmachine', { waitUntil: 'networkidle' }); await swipe(-200); await swipe(-200); ok(await p.getByText(/Hoofdstuk 3 van 7/).count() > 0, `${name}: vegen in tijdmachine`)
    await p.goto(BASE + '/voor-jou', { waitUntil: 'networkidle' }); await p.getByRole('button', { name: /Speel herinnering af: Oma Nel/ }).tap(); await p.waitForTimeout(300); await swipe(0, 300)
    ok(await p.getByRole('dialog', { name: /Herinnering/ }).count() === 0, `${name}: herinneringsspeler sluit bij omlaag vegen`)
    await p.goto(BASE + '/voor-jou', { waitUntil: 'networkidle' }); await p.getByRole('button', { name: 'Meer' }).tap(); await p.waitForTimeout(200)
    await p.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Later doorgeven' }).tap(); await p.waitForTimeout(200); ok(p.url().includes('/nalatenschap'), `${name}: mobiel menu`)
    ok(errs.length === 0, `${name}: JS-fouten ${errs.join(' | ')}`); await ctx.close()
  }
  console.log(`\n${checks - fails.length}/${checks} telefooncontroles geslaagd`); await b.close(); process.exit(fails.length ? 1 : 0)
})()
