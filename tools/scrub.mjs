import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('pageerror', (e) => errs.push(e.message))
await p.goto('http://localhost:3000', { waitUntil: 'load', timeout: 90000 })
await p.waitForTimeout(4200)

const read = async (label, y) => {
  await p.evaluate((v) => window.scrollTo(0, v), y)
  await p.waitForTimeout(950)
  const r = await p.evaluate(() => {
    const svg = document.querySelector('section svg[viewBox="0 0 190 210"]')
    const paths = svg ? svg.querySelectorAll('path') : []
    const nm = [...document.querySelectorAll('section p')].find((e) => e.textContent.includes('REDDY'))
    const span = nm?.firstElementChild
    const num = (el, prop) => (el ? +(+getComputedStyle(el)[prop]).toFixed(2) : null)
    return {
      svgOp: num(svg, 'opacity'),
      dash: paths[0] ? getComputedStyle(paths[0]).strokeDasharray : null,
      triOp: num(paths[1], 'opacity'),
      nameOp: num(span, 'opacity'),
      nameT: span ? getComputedStyle(span).transform.slice(0, 24) : null,
    }
  })
  console.log(label.padEnd(22), JSON.stringify(r))
}

await read('rest (0)', 0)
await read('15% — arrow starts', 135)
await read('35% — drawing', 315)
await read('42% — mark', 378)
await read('55% — name', 495)
await read('reverse to 0', 0)
console.log('errors:', errs.length ? errs : 'none')
await b.close()
