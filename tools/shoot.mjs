import { chromium } from 'playwright'

const [, , outName = 'shot', wArg = '1440', hArg = '900', scrollArg = '0', waitArg = '4200', fullArg = ''] = process.argv
const width = Number(wArg)
const height = Number(hArg)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
await page.goto(process.env.SITE || 'http://localhost:3000', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
// Prime every whileInView reveal by walking the page top to bottom first,
// otherwise a full-page capture shows unentered sections at opacity 0.
const docH = await page.evaluate(() => document.body.scrollHeight)
for (let y = 0; y < docH; y += Math.round(height * 0.6)) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(320)
}
await page.evaluate((y) => window.scrollTo(0, y), Number(scrollArg))
await page.waitForTimeout(1500)
await page.waitForTimeout(Number(waitArg))
await page.screenshot({ path: `tools/out/${outName}.png`, fullPage: fullArg === 'full' })
await browser.close()
console.log('shot ->', `tools/out/${outName}.png`)
