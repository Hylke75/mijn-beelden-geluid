/* Klikt elke zichtbare knop/link per scherm (telkens vanuit een schone demo-state)
   en meldt elementen zonder zichtbaar effect. Gebruik: node tests/dead-buttons.cjs [baseUrl] */
const { chromium } = require('playwright')
const fs = require('fs')
const BASE = process.argv[2] || 'http://127.0.0.1:5173'
const ROUTES = ['/voor-jou', '/fotos', '/foto/m-1988-kitchen', '/foto/m-2021-deer', '/tijdlijn', '/tijdmachine', '/albums', '/albums/al-zeeland', '/albums/al-oma-nel', '/verhalen', '/verhalen/s-nel-appeltaart', '/familie', '/kluis', '/bronnen', '/nalatenschap', '/nalatenschap/voorbeeld?wens=wish-daan', '/nationaal-archief', '/nationaal-archief/aanbieden', '/schatkamer', '/instellingen', '/zoeken?q=Mila', '/hulp', '/fotos?m=m-1975-haarlem']
const SEL = 'main button:visible, main a:visible, [role=dialog] button:visible, [role=dialog] a:visible, header button:visible, header a:visible, aside a:visible, aside button:visible'
const goto = async (p, url) => { for (let i = 0; i < 3; i++) { try { return await p.goto(url, { waitUntil: 'networkidle' }) } catch { await p.waitForTimeout(500) } } }
const sig = () => [location.href, document.body.innerHTML.length, document.querySelectorAll('[role=dialog],[role=menu],[role=listbox],[role=status] > *').length, document.activeElement && document.activeElement.getAttribute('aria-expanded')].join('|')

;(async () => {
  const b = await chromium.launch()
  const dead = [], errors = []; let total = 0
  const queue = [...ROUTES]
  const worker = async () => {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(() => { try { localStorage.clear(); sessionStorage.setItem('mbg-vault', '1') } catch {} })
    const p = await ctx.newPage()
    p.on('pageerror', (e) => errors.push(e.message))
    while (queue.length) {
      const r = queue.shift()
      await goto(p, BASE + r)
      const n = await p.locator(SEL).count()
      for (let i = 0; i < n; i++) {
        if (i > 0) await goto(p, BASE + r)
        const el = p.locator(SEL).nth(i)
        if (!(await el.count())) continue
        if (await el.isDisabled().catch(() => true)) continue
        const label = ((await el.getAttribute('aria-label').catch(() => '')) || (await el.innerText().catch(() => '')).trim()).replace(/\s+/g, ' ').slice(0, 50)
        const href = await el.getAttribute('href').catch(() => null)
        const before = await p.evaluate(sig)
        total++
        try { await el.click({ timeout: 1500 }) } catch { continue }
        await p.waitForTimeout(220)
        const after = await p.evaluate(sig).catch(() => 'nav')
        // een link naar de huidige route (bv. actief menu-item) telt als werkend
        const selfLink = href && (BASE + href) === before.split('|')[0]
        if (before === after && !selfLink) dead.push(`${r}: “${label}”`)
      }
    }
    await ctx.close()
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  const out = { date: new Date().toISOString(), total, dead: [...new Set(dead)], errors: [...new Set(errors)] }
  fs.writeFileSync(__dirname + '/results-dead.json', JSON.stringify(out, null, 2))
  console.log(`${total} knoppen/links geklikt; ${out.dead.length} zonder effect; ${out.errors.length} JS-fouten`)
  out.dead.forEach((d) => console.log('  DEAD ' + d)); out.errors.forEach((d) => console.log('  ERR ' + d))
  await b.close()
})()
