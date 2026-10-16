// probe-elder: fast isolated check of the fixed elderOn sequence (no recording)
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const pw = require('/home/maebahesioru/.hermes/hermes-agent/node_modules/playwright');
const REPO = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
function startServer(root) {
  return new Promise((resolve, reject) => {
    const s = http.createServer((req, res) => {
      let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (_) { res.writeHead(400); return res.end(); }
      if (p.endsWith('/')) p += 'index.html';
      const f = path.normalize(path.join(root, p));
      if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
      fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
    });
    s.on('error', reject); s.listen(0, '127.0.0.1', () => resolve(s));
  });
}
(async () => {
  const server = await startServer(REPO);
  const url = `http://127.0.0.1:${server.address().port}/video/stage.html`;
  const b = await pw.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true);
  const app = page.frameLocator('#app');
  await app.locator('#view-home.active').waitFor({ state: 'attached', timeout: 45000 });
  await page.waitForTimeout(1200);

  // switch stage to split layout (phone visible) — mirrors director scene 5/6 setup
  await page.evaluate(o => window.stage.scene(o), { no: 5, kicker: 'probe', title: 'probe', body: '', layout: 'split' });
  await page.waitForTimeout(400);

  // simulate end of scene 5: community view, scrolled to mascot bars
  await app.locator('.bottomnav button[data-goto="community"]').click();
  await page.waitForTimeout(300);
  await app.locator('#com-bars').scrollIntoViewIfNeeded();
  console.log('state: community view reached (scene5 end)');

  const t0 = Date.now();
  // --- new elderOn sequence (mirrors director.cjs) ---
  await app.locator('.bottomnav button[data-goto="home"]').click();
  await page.waitForTimeout(250);
  console.log(`home nav clicked @ +${((Date.now() - t0) / 1000).toFixed(2)}s`);
  await app.locator('#btnLargeText').click();
  await page.waitForTimeout(350);
  console.log(`elder toggle clicked @ +${((Date.now() - t0) / 1000).toFixed(2)}s`);
  const t1 = Date.now();
  await app.locator('#home-title').scrollIntoViewIfNeeded();
  console.log(`scrollIntoViewIfNeeded(#home-title) resolved in ${Date.now() - t1}ms`);

  const large = await app.locator('html').evaluate(el => el.classList.contains('large'));
  console.log('elder mode ON:', large);
  const titleBox = await app.locator('#home-title').boundingBox();
  console.log('home-title boundingBox:', JSON.stringify(titleBox));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(__dirname, 'out', 'probe-elder.png') });
  console.log('screenshot: out/probe-elder.png');

  await b.close(); server.close();
  console.log('PROBE OK');
})().catch(e => { console.error('PROBE FAIL:', e.message); process.exit(1); });
