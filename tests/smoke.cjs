// Yukikaki Link — E2E smoke test (formalized)
// ゆきかきリンク E2Eスモークテスト
//
// Self-contained: starts its own static file server (pure Node, no deps) and
// drives the app with Playwright (headless Chromium).
//
// Run:
//   node tests/smoke.cjs
//   BASE_URL=https://maebahesioru.github.io/yukikaki-link/ node tests/smoke.cjs   # test a deployed URL
//
// Playwright resolution order: $PLAYWRIGHT_PATH → local node_modules → Hermes bundle.
// Screenshots land in tests/screenshots/ (gitignored).
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const SHOTS = path.join(__dirname, 'screenshots');

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    '/home/maebahesioru/.hermes/hermes-agent/node_modules/playwright',
  ].filter(Boolean);
  for (const c of candidates) {
    try { return require(c); } catch (_) { /* try next */ }
  }
  console.error('playwright not found. Set PLAYWRIGHT_PATH to a playwright install.');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function startServer(root) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
      catch (_) { res.writeHead(400); return res.end('bad request'); }
      if (p.endsWith('/')) p += 'index.html';
      const file = path.normalize(path.join(root, p));
      if (!file.startsWith(root)) { res.writeHead(403); return res.end('forbidden'); }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS:', name); }
  else { fail++; console.log('  FAIL:', name); }
}

(async () => {
  const pw = loadPlaywright();
  fs.mkdirSync(SHOTS, { recursive: true });

  let server = null;
  let BASE = process.env.BASE_URL;
  if (!BASE) {
    server = await startServer(REPO);
    BASE = `http://127.0.0.1:${server.address().port}`;
  }
  console.log(`Testing ${BASE}`);

  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  try {
    // 1. Home loads
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(400);
    ok((await page.title()).includes('ゆきかきリンク'), 'title contains ゆきかきリンク');
    ok(await page.locator('#view-home.active').count() === 1, 'home view active');
    ok((await page.locator('#home-title').innerText()).includes('おたがいさま'), 'home heading visible');

    // 1b. PWA manifest + invite QR present
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    ok(manifestHref === 'manifest.webmanifest', `manifest link present (got ${manifestHref})`);
    await page.locator('#qr-invite').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const qrLoaded = await page.evaluate(() => {
      const img = document.querySelector('#qr-invite');
      return !!img && img.complete && img.naturalWidth > 0;
    });
    ok(qrLoaded, 'invite QR image loads on home');

    // 2. Request flow (3 taps)
    await page.click('button.bigbtn.primary[data-goto="request"]');
    await page.waitForTimeout(250);
    ok(await page.locator('#view-request.active').count() === 1, 'request view active');
    const map = page.locator('#map');
    ok(await map.count() === 1, 'map canvas rendered');
    // tap 3rd block (3丁目) on canvas: x = width*(2.5/5)
    const bb = await map.boundingBox();
    await page.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.55);
    await page.waitForTimeout(250);
    ok((await page.locator('#req-body').innerText()).includes('玄関前'), 'step2 visible after block tap');
    await page.click('[data-type="entrance"]');
    await page.waitForTimeout(250);
    ok((await page.locator('#req-body').innerText()).includes('今すぐ'), 'step3 visible after type');
    await page.click('[data-due="today"]');
    await page.waitForTimeout(250);
    ok((await page.locator('#req-body').innerText()).includes('かくにん'), 'confirm panel visible');
    await page.click('[data-post]');
    await page.waitForTimeout(400);
    ok(await page.locator('#view-myreq.active').count() === 1, 'myreq view after post');
    ok((await page.locator('#myreq-list').innerText()).includes('3丁目'), 'my request shows 3丁目');
    ok((await page.locator('#myreq-list').innerText()).includes('まだ だれも いません'), 'my request status open');

    // 3. Board + accept + complete + thanks
    await page.click('.bottomnav button[data-goto="board"]');
    await page.waitForTimeout(300);
    ok(await page.locator('#view-board.active').count() === 1, 'board view active');
    const cards = page.locator('#board-list .reqcard');
    ok(await cards.count() === 4, 'board shows 3 seeds + my request (4 cards)');
    const firstName = await cards.first().locator('.block-name').innerText();
    ok(firstName === '3丁目', `nearest first is my own 3丁目 (got ${firstName})`);
    ok((await cards.first().innerText()).includes('じぶんの たのみごと'), 'own request labeled on board');
    const seedCard = page.locator('#board-list .reqcard').nth(1);
    const seedName = await seedCard.locator('.block-name').innerText();
    ok(seedName === '2丁目', `nearest seed is 2丁目 (got ${seedName})`);
    await seedCard.locator('[data-accept]').click();
    await page.waitForTimeout(300);
    ok((await page.locator('#board-list').innerText()).includes('あなたが てつだいます'), 'accepted badge shown');
    await page.locator('#board-list [data-complete]').click();
    await page.waitForTimeout(300);
    ok(await page.locator('#view-complete.active').count() === 1, 'complete view active');
    await page.click('[data-thanks]');
    await page.waitForTimeout(300);
    ok((await page.locator('#complete-body').innerText()).includes('ありがとうを おくりました'), 'thanks sent state');
    await page.waitForTimeout(1600);
    ok((await page.locator('#complete-body').innerText()).includes('とどきました'), 'demo reply thanks received');

    // 4. Community counter
    await page.click('.bottomnav button[data-goto="community"]');
    await page.waitForTimeout(400);
    const total = await page.locator('#com-total').innerText();
    ok(total === '14', `community total = 14 (got ${total})`);
    const done = await page.locator('#com-done').innerText();
    ok(done === '1', `completed by me = 1 (got ${done})`);
    ok(await page.locator('#mascot').count() === 1, 'mascot canvas present');
    ok(await page.locator('#com-bars .bar-row').count() === 5, '5 block bars');
    const barSum = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#com-bars .bar-row')).reduce((s, row) => s + parseInt(row.lastElementChild.textContent, 10), 0);
    });
    ok(barSum === 14, `bars sum = total 14 (got ${barSum})`);

    // 5. Large text toggle
    await page.click('#btnLargeText');
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => document.documentElement.classList.contains('large')), 'large text mode on');
    await page.click('#btnLargeText');
    ok(!(await page.evaluate(() => document.documentElement.classList.contains('large'))), 'large text mode off');

    // 6. Persistence after reload
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(500);
    await page.click('.bottomnav button[data-goto="community"]');
    await page.waitForTimeout(300);
    const total2 = await page.locator('#com-total').innerText();
    ok(total2 === '14', `persistence: total still 14 after reload (got ${total2})`);

    // 7. Service worker registered (http)
    const swReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    });
    ok(swReady, 'service worker registered');

    // 8. Rules page renders safety list
    await page.click('.bottomnav button[data-goto="rules"]');
    await page.waitForTimeout(250);
    ok((await page.locator('#view-rules').innerText()).includes('あんぜん 5か'), 'rules page shows safety list');
    ok((await page.locator('#view-rules').innerText()).includes('屋根'), 'rules mention roof-snow prohibition');

    // 9. Offline: SW serves the app shell with the network disabled
    // (the app restores the last view from location.hash on boot, so go home first)
    await page.click('.bottomnav button[data-goto="home"]');
    await page.waitForTimeout(250);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(300);
    const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
    ok(controlled, 'service worker controls the page');
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(700);
    ok(await page.locator('#view-home.active').count() === 1, 'offline reload still renders home (SW cache)');
    await context.setOffline(false);

    // screenshots for visual check
    await page.click('.bottomnav button[data-goto="home"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'home.png'), fullPage: true });
    await page.click('.bottomnav button[data-goto="community"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'community.png'), fullPage: true });
    await page.click('.bottomnav button[data-goto="home"]');
    await page.waitForTimeout(200);
    await page.click('button.bigbtn.primary[data-goto="request"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'request.png'), fullPage: true });

    console.log('\nCONSOLE/PAGE ERRORS:', errors.length ? errors : 'none');
    console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  } catch (e) {
    console.log('FATAL:', e.message);
    console.log('ERRORS SO FAR:', errors);
    fail++;
  } finally {
    await browser.close();
    if (server) server.close();
  }
  process.exit(fail ? 1 : 0);
})();
