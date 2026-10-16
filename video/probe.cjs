// probe: does the production app work inside an iframe? (localStorage / SW / clicks)
'use strict';
const pw = require('/home/maebahesioru/.hermes/hermes-agent/node_modules/playwright');
(async () => {
  const b = await pw.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe id="app" src="https://maebahesioru.github.io/yukikaki-link/" style="width:390px;height:844px;border:0"></iframe></body>');
  const app = page.frameLocator('#app');
  await app.locator('#view-home.active').waitFor({ timeout: 30000 });
  console.log('OK: home loaded in iframe');
  await app.locator('button.bigbtn.primary[data-goto="request"]').click();
  await app.locator('#map').waitFor({ timeout: 5000 });
  console.log('OK: click through to request view');
  const frame = page.frames().find(f => f.url().includes('yukikaki'));
  const ls = await frame.evaluate(() => Object.keys(localStorage));
  console.log('localStorage keys:', ls);
  await page.waitForTimeout(1500);
  const sw = await frame.evaluate(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return !!r; } catch (e) { return 'ERR:' + e.message; } });
  console.log('SW registered:', sw);
  // boundingBox of an iframe element → main frame coords (for cursor overlay math)
  const bb = await app.locator('#map').boundingBox();
  console.log('map boundingBox in page coords:', JSON.stringify(bb));
  await b.close();
})().catch(e => { console.error('PROBE FAIL:', e.message); process.exit(1); });
