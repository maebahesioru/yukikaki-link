// stage-check: screenshot the stage layouts without recording (fast visual QA)
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
  const OUT = path.join(__dirname, 'out');

  // scene 1 (full + stats)
  await page.evaluate(o => window.stage.scene(o), {
    no: 1, kicker: '01 · The problem', title: 'Snow shoveling shouldn\u2019t be a solo job.',
    body: '<div class="grid2"><div class="card"><div class="num">566,710</div><div class="lbl">residents aged 65+ — 29.4% of Sapporo</div><div class="src">Hokkaido, Jan 2026</div></div><div class="card"><div class="num">121,789</div><div class="lbl">seniors living alone</div><div class="src">Census 2020, Sapporo</div></div><div class="card"><div class="num">~1,900 / yr</div><div class="lbl">hospitalized after falls on snowy streets — 45.7% aged 70+</div><div class="src">Sapporo Fire Bureau, FY2024</div></div><div class="card mikan"><div class="num">10</div><div class="lbl">deaths while clearing snow in Hokkaido last winter — all while shoveling</div><div class="src">Hokkaido, 2025–26 season</div></div></div>',
    layout: 'full',
  });
  await page.evaluate(() => window.stage.subtitle('Every winter, about 1,900 people are hospitalized after falls on snowy streets. Nearly half are 70 or older.'));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'check-s1.png') });

  // scene 3 (split + cursor)
  await page.evaluate(o => window.stage.scene(o), {
    no: 3, kicker: '03 · Ask in 3 taps', title: 'The request',
    body: '<ul class="steps"><li><span class="no">1</span>Where — tap your block on the town map</li><li><span class="no">2</span>What — entrance / path / parking</li><li><span class="no">3</span>When — now / today / tomorrow</li></ul><div class="foot" style="margin-top:16px">Roof snow is not selectable — too dangerous (safety rule)</div>',
    layout: 'split',
  });
  await page.evaluate(() => window.stage.subtitle('Tap one: where — I tap my block on the town map.'));
  await page.evaluate(() => window.stage.cursor(1500, 700));
  await page.waitForTimeout(1300);
  await page.screenshot({ path: path.join(OUT, 'check-s3.png') });

  // scene 5 (community, phone scrolled to mascot)
  await app.locator('.bottomnav button[data-goto="community"]').click();
  await page.waitForTimeout(300);
  await app.locator('#mascot').scrollIntoViewIfNeeded();
  await page.evaluate(o => window.stage.scene(o), {
    no: 5, kicker: '05 · The thanks economy', title: 'Kindness you can see',
    body: '<ul class="feature"><li><span class="ic">🍊</span>14 thanks this season — and counting</li><li><span class="ic">📊</span>Per-block bars — the whole town can see the help</li><li><span class="ic">🧶</span>Mikan grows with every thank-you</li></ul>',
    layout: 'split',
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'check-s5.png') });

  // scene 7 close
  await page.evaluate(o => window.stage.scene(o), {
    no: 7, kicker: '07 · The evidence', title: 'This problem is real — here\u2019s the proof',
    body: '<div class="grid3"><div class="card"><div class="num">566,710</div><div class="lbl">residents 65+ (29.4%)</div><div class="src">Hokkaido, 2026</div></div><div class="card"><div class="num">121,789</div><div class="lbl">seniors living alone</div><div class="src">Census 2020</div></div><div class="card"><div class="num">5,692</div><div class="lbl">households reached by welfare snow removal</div><div class="src">Sapporo, FY2024</div></div><div class="card"><div class="num">1,869</div><div class="lbl">snow-path fall transports — 45.7% aged 70+</div><div class="src">Sapporo Fire, FY2024</div></div><div class="card mikan"><div class="num">175</div><div class="lbl">hurt or killed by snow in Hokkaido — 10 deaths</div><div class="src">Hokkaido, 2025–26</div></div><div class="card mikan"><div class="num">¥28.4B</div><div class="lbl">Sapporo snow budget — on roads, not doorsteps</div><div class="src">Sapporo, FY2025</div></div></div><div class="foot" style="margin-top:18px">Every figure is cited in our public evidence kit — docs/evidence-kit.md</div>',
    layout: 'full',
  });
  await page.evaluate(() => window.stage.subtitle('28.4 billion yen of snow spending — on roads, not on doorsteps.'));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'check-s7.png') });
  await page.evaluate(() => window.stage.close());
  await page.evaluate(() => window.stage.subtitle('Thank you — or as we say in Sapporo: “otagaisama.”'));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'check-s7close.png') });

  await b.close(); server.close();
  console.log('checks written to', OUT);
})().catch(e => { console.error('CHECK FAIL:', e.message); process.exit(1); });
