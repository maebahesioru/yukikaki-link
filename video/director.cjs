// Yukikaki Link — demo video director
// Records the real app (production URL, in an iframe on a 1920x1080 stage) with Playwright,
// drives the 7-scene timeline in sync with the pre-generated narration, and writes timing.json
// so video/finalize.cjs can build the audio track and mux the final MP4.
//
// Run:  node video/director.cjs
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const VIDEO = __dirname;
const OUT = path.join(VIDEO, 'out');
const APP_URL = process.env.APP_URL || 'https://maebahesioru.github.io/yukikaki-link/';
const TOTAL_SCENES = 7;

function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    'playwright',
    '/home/maebahesioru/.hermes/hermes-agent/node_modules/playwright',
  ].filter(Boolean);
  for (const c of candidates) {
    try { return require(c); } catch (_) { /* next */ }
  }
  console.error('playwright not found'); process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};
function startServer(root) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
      catch (_) { res.writeHead(400); return res.end('bad'); }
      if (p.endsWith('/')) p += 'index.html';
      const file = path.normalize(path.join(root, p));
      if (!file.startsWith(root)) { res.writeHead(403); return res.end('no'); }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); return res.end('nf'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ---------- narration timing (measured from edge-tts output) ----------
function ttsDuration(file) {
  return parseFloat(execFileSync('ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]
  ).toString().trim());
}

// ---------- scene definitions ----------
const S1_STATS =
  '<div class="grid2">' +
    '<div class="card"><div class="num">566,710</div><div class="lbl">residents aged 65+ — 29.4% of Sapporo</div><div class="src">Hokkaido, Jan 2026</div></div>' +
    '<div class="card"><div class="num">121,789</div><div class="lbl">seniors living alone</div><div class="src">Census 2020, Sapporo</div></div>' +
    '<div class="card"><div class="num">~1,900 / yr</div><div class="lbl">hospitalized after falls on snowy streets — 45.7% aged 70+</div><div class="src">Sapporo Fire Bureau, FY2024</div></div>' +
    '<div class="card mikan"><div class="num">10</div><div class="lbl">deaths while clearing snow in Hokkaido last winter — all while shoveling</div><div class="src">Hokkaido, 2025–26 season</div></div>' +
  '</div>';

const S7_EVIDENCE =
  '<div class="grid3">' +
    '<div class="card"><div class="num">566,710</div><div class="lbl">residents 65+ (29.4%)</div><div class="src">Hokkaido, 2026</div></div>' +
    '<div class="card"><div class="num">121,789</div><div class="lbl">seniors living alone</div><div class="src">Census 2020</div></div>' +
    '<div class="card"><div class="num">5,692</div><div class="lbl">households reached by welfare snow removal</div><div class="src">Sapporo, FY2024</div></div>' +
    '<div class="card"><div class="num">1,869</div><div class="lbl">snow-path fall transports — 45.7% aged 70+</div><div class="src">Sapporo Fire, FY2024</div></div>' +
    '<div class="card mikan"><div class="num">175</div><div class="lbl">hurt or killed by snow in Hokkaido — 10 deaths</div><div class="src">Hokkaido, 2025–26</div></div>' +
    '<div class="card mikan"><div class="num">¥28.4B</div><div class="lbl">Sapporo snow budget — on roads, not doorsteps</div><div class="src">Sapporo, FY2025</div></div>' +
  '</div>' +
  '<div class="foot" style="margin-top:18px">Every figure is cited in our public evidence kit — docs/evidence-kit.md</div>';

const SCENES = [
  { n: 1, layout: 'full', lead: 1.2, tail: 1.0,
    kicker: '01 · The problem',
    title: 'Snow shoveling shouldn\u2019t be a solo job.',
    body: S1_STATS,
    steps: [
      { w: 14, sub: 'Sapporo, Japan — my city. In winter, snow is not just a chore. For many people here, it\u2019s a daily risk.' },
      { w: 12, sub: '566,710 residents are 65 or older — 29.4%. Nearly 122,000 seniors live alone.' },
      { w: 11, sub: 'The city\u2019s welfare snow-removal service has strict eligibility — and too few helpers to go around.' },
      { w: 13, sub: 'Every winter, about 1,900 people are hospitalized after falls on snowy streets. Nearly half are 70 or older.' },
      { w: 10, sub: 'Last winter in Hokkaido, 10 people died clearing snow — every one of them while shoveling.' },
      { w: 12, sub: 'On our street: an elderly neighbor, alone in the snow. When we asked why — \u201cI have no one to ask.\u201d' },
    ] },
  { n: 2, layout: 'split', lead: 0.8, tail: 1.0,
    kicker: '02 · The solution',
    title: 'Yukikaki Link',
    body: '<ul class="feature">' +
      '<li><span class="ic">❄️</span>3 taps to ask — no forms</li>' +
      '<li><span class="ic">🚫</span>No accounts, no personal data</li>' +
      '<li><span class="ic">📶</span>Works offline — it\u2019s a PWA</li>' +
      '<li><span class="ic">🍊</span>A \u201cthank you\u201d economy — no money</li></ul>',
    steps: [
      { w: 13, sub: 'Yukikaki Link connects the neighbor who needs snow shoveled with the neighbor who can help.' },
      { w: 15, sub: 'No accounts. No app store. Works offline. Three taps to ask. And no money — neighbors trade \u201cthank you\u201ds.' },
      { w: 11, sub: 'This is the real app, live. Here\u2019s how it works.' },
    ] },
  { n: 3, layout: 'split', lead: 0.8, tail: 1.0,
    kicker: '03 · Ask in 3 taps',
    title: 'The request',
    body: '<ul class="steps">' +
      '<li><span class="no">1</span>Where — tap your block on the town map</li>' +
      '<li><span class="no">2</span>What — entrance / path / parking</li>' +
      '<li><span class="no">3</span>When — now / today / tomorrow</li></ul>' +
      '<div class="foot" style="margin-top:16px">Roof snow is not selectable — too dangerous (safety rule)</div>',
    steps: [
      { w: 9, sub: 'I\u2019m the one who needs help. Tap: \u201cask for snow shoveling\u201d.', act: 'openRequest' },
      { w: 10, sub: 'Tap one: where — I tap my block on the town map.', act: 'tapMap' },
      { w: 9, sub: 'Tap two: what — the entrance in front of the door.', act: 'pickEntrance' },
      { w: 7, sub: 'Tap three: when — right now.', act: 'pickNow' },
      { w: 8, sub: 'That\u2019s the whole request — posted.', act: 'post' },
      { w: 13, sub: 'My list shows it: \u201cno one yet\u201d. And helpers see it on the board — nearest block first.', act: 'gotoBoard' },
    ] },
  { n: 4, layout: 'split', lead: 0.8, tail: 1.0,
    kicker: '04 · Help & thanks',
    title: 'One driveway, two neighbors',
    body: '<div class="flow"><span class="pill">I\u2019ll help</span><span class="ar">→</span>' +
      '<span class="pill">Done</span><span class="ar">→</span><span class="pill">ありがとう</span></div>' +
      '<div class="foot" style="margin-top:16px">No money changes hands — \u201cthank you\u201d is the only currency</div>',
    steps: [
      { w: 10, sub: 'Now I\u2019m the helper. The board lists requests from my town, nearest first.' },
      { w: 9, sub: 'This one\u2019s from the next block over. I tap: \u201cI\u2019ll help\u201d.', act: 'accept' },
      { w: 9, sub: 'When the job is done, I mark it complete.', act: 'complete' },
      { w: 7, sub: 'Then we thank each other — not with money.', act: 'thanks' },
      { w: 11, sub: '\u201cThank you\u201d sent — and their reply comes back: \u201cit arrived.\u201d' },
    ] },
  { n: 5, layout: 'split', lead: 0.8, tail: 1.0,
    kicker: '05 · The thanks economy',
    title: 'Kindness you can see',
    body: '<ul class="feature">' +
      '<li><span class="ic">🍊</span>14 thanks this season — and counting</li>' +
      '<li><span class="ic">📊</span>Per-block bars — the whole town can see the help</li>' +
      '<li><span class="ic">🧶</span>Mikan grows with every thank-you</li></ul>',
    steps: [
      { w: 12, sub: 'Every thank-you adds up. This is our town\u2019s counter — and every block has its own bar.', act: 'gotoCommunity' },
      { w: 8, sub: 'And this is Mikan, our mascot in a knitted hat.', act: 'scrollMascot' },
      { w: 11, sub: 'Mikan grows as the neighborhood helps each other — a small nudge that brings people back.', act: 'scrollBars' },
    ] },
  { n: 6, layout: 'split', lead: 0.8, tail: 1.0,
    kicker: '06 · Built for every neighbor',
    title: 'Older users first',
    body: '<ul class="feature">' +
      '<li><span class="ic">👓</span>Elder mode: bigger text + furigana readings</li>' +
      '<li><span class="ic">🛡</span>Roof snow: not allowed — too dangerous</li>' +
      '<li><span class="ic">🔒</span>No accounts — data stays on the device</li>' +
      '<li><span class="ic">📶</span>Offline-ready for snowstorms</li></ul>',
    steps: [
      { w: 15, sub: 'Many of our neighbors are older — so there\u2019s an elder mode: one tap, bigger text, and furigana readings on every kanji.', act: 'elderOn' },
      { w: 11, sub: 'Safety first: you cannot request roof snow removal — it\u2019s too dangerous, and the app explains why.', act: 'gotoRules' },
      { w: 10, sub: 'No accounts means no data on a server — everything stays on this device.', act: 'scrollPrivacy' },
      { w: 12, sub: 'And because it\u2019s a PWA, it opens even when the network is down — exactly when a snowstorm hits.', act: 'scrollRulesTop' },
    ] },
  { n: 7, layout: 'full', lead: 0.8, tail: 1.5,
    kicker: '07 · The evidence',
    title: 'This problem is real — here\u2019s the proof',
    body: S7_EVIDENCE,
    steps: [
      { w: 9, sub: 'We can prove the problem is real — with Sapporo\u2019s own statistics.' },
      { w: 22, sub: '566,000 seniors. 121,000 living alone. 5,692 households reached by welfare snow removal — while 1,869 people were hospitalized from falls.' },
      { w: 16, sub: '28.4 billion yen of snow spending — on roads, not on doorsteps. Every number is cited in our public evidence kit.' },
      { w: 11, sub: 'Yukikaki Link is live and open source. No accounts. No money. Just neighbors.', act: 'close' },
      { w: 8, sub: 'Thank you — or as we say in Sapporo: \u201cotagaisama.\u201d' },
    ] },
];

// ---------- main ----------
(async () => {
  const pw = loadPlaywright();
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(path.join(OUT, 'raw'), { recursive: true, force: true });

  // measured narration durations
  for (const sc of SCENES) {
    sc.tts = ttsDuration(path.join(VIDEO, 'narration', `scene${sc.n}.mp3`));
    sc.dur = +(sc.lead + sc.tts + sc.tail).toFixed(3);
  }
  const totalDur = +SCENES.reduce((s, x) => s + x.dur, 0).toFixed(3);
  console.log('scene durations:', SCENES.map(s => `S${s.n}=${s.dur}s`).join(' '), `| total=${totalDur}s`);

  const server = await startServer(REPO);
  const stageUrl = `http://127.0.0.1:${server.address().port}/video/stage.html`;

  const browser = await pw.chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: path.join(OUT, 'raw'), size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  console.log('stage:', stageUrl, '| app:', APP_URL);
  await page.goto(stageUrl, { waitUntil: 'load' });

  // wait for the stage first frame + the production app loaded inside the phone
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  const app = page.frameLocator('#app');
  // NOTE: the phone column is display:none during the full-layout pre-roll, so the app's
  // home section is 'attached' but not 'visible' — wait for attached, then verify boot.
  await app.locator('#view-home.active').waitFor({ state: 'attached', timeout: 45000 });
  await page.waitForTimeout(1200); // let fonts/rendering settle

  const waitUntil = async (t) => { const d = t - Date.now(); if (d > 0) await page.waitForTimeout(d); };
  const stageEval = (fn, arg) => page.evaluate(fn, arg);

  const cursorTo = async (locator) => {
    const bb = await locator.boundingBox();
    await stageEval(a => window.stage.cursor(a.x, a.y), { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 });
    await page.waitForTimeout(430);
  };
  const clickLoc = async (locator) => {
    await cursorTo(locator);
    await stageEval(() => window.stage.pulse());
    await locator.click();
  };
  const clickXY = async (x, y) => {
    await stageEval(a => window.stage.cursor(a.x, a.y), { x, y });
    await page.waitForTimeout(430);
    await stageEval(() => window.stage.pulse());
    await page.mouse.click(x, y);
  };

  const ACTIONS = {
    openRequest: () => clickLoc(app.locator('button.bigbtn.primary[data-goto="request"]')),
    tapMap: async () => {
      const bb = await app.locator('#map').boundingBox();
      await clickXY(bb.x + bb.width * 0.5, bb.y + bb.height * 0.55);
    },
    pickEntrance: () => clickLoc(app.locator('[data-type="entrance"]')),
    pickNow: () => clickLoc(app.locator('[data-due="today"]')),
    post: () => clickLoc(app.locator('[data-post]')),
    gotoBoard: () => clickLoc(app.locator('.bottomnav button[data-goto="board"]')),
    accept: () => clickLoc(app.locator('#board-list .reqcard').nth(1).locator('[data-accept]')),
    complete: () => clickLoc(app.locator('#board-list [data-complete]')),
    thanks: () => clickLoc(app.locator('[data-thanks]')),
    gotoCommunity: async () => {
      await clickLoc(app.locator('.bottomnav button[data-goto="community"]'));
      await page.waitForTimeout(250);
      await app.locator('#com-title').scrollIntoViewIfNeeded();
    },
    scrollMascot: () => app.locator('#mascot').scrollIntoViewIfNeeded(),
    scrollBars: () => app.locator('#com-bars').scrollIntoViewIfNeeded(),
    elderOn: async () => {
      // scene 5 ends on the community view; #home-title is inside the hidden home view
      // there, so navigating home first both avoids a visibility timeout and shows the
      // text growing in place on the furigana headline.
      await clickLoc(app.locator('.bottomnav button[data-goto="home"]'));
      await page.waitForTimeout(250);
      await clickLoc(app.locator('#btnLargeText'));
      await page.waitForTimeout(350);
      await app.locator('#home-title').scrollIntoViewIfNeeded();
    },
    gotoRules: async () => {
      await clickLoc(app.locator('.bottomnav button[data-goto="rules"]'));
      await page.waitForTimeout(300);
      await app.locator('#view-rules .card').first().scrollIntoViewIfNeeded();
    },
    scrollPrivacy: () => app.locator('#view-rules .card').nth(2).scrollIntoViewIfNeeded(),
    scrollRulesTop: () => app.locator('#rules-title').scrollIntoViewIfNeeded(),
    close: async () => {
      await stageEval(() => window.stage.close());
      await stageEval(() => window.stage.cursorHide());
    },
  };

  // timeline start marker (for trimming the pre-roll)
  const pnow = await page.evaluate(() => performance.now());
  const ff = await page.evaluate(() => window.__ff);
  const offset = +(((pnow - ff) / 1000)).toFixed(3);
  console.log(`timeline start: performance.now=${pnow.toFixed(0)}ms, firstFrame=${ff.toFixed(0)}ms, pre-roll offset=${offset}s`);

  for (const sc of SCENES) {
    const t0 = Date.now();
    console.log(`--- scene ${sc.n} (${sc.dur}s)`);
    await stageEval(o => window.stage.scene(o), { no: sc.n, total: TOTAL_SCENES, kicker: sc.kicker, title: sc.title, body: sc.body, layout: sc.layout });
    await stageEval(a => window.stage.progress(a.pct, a.dur), { pct: (sc.n / TOTAL_SCENES) * 100, dur: sc.dur * 1000 });
    // full-layout scenes hide the phone column; a cursor dot left over from the previous
    // scene would float over empty space — hide it until the next scripted action.
    if (sc.layout === 'full') await stageEval(() => window.stage.cursorHide());

    const totalW = sc.steps.reduce((s, x) => s + x.w, 0);
    let cumW = 0;
    for (const st of sc.steps) {
      const startAt = t0 + (sc.lead + (cumW / totalW) * sc.tts) * 1000;
      await waitUntil(startAt - 250);
      await stageEval(t => window.stage.subtitle(t), st.sub);
      if (st.act) {
        await waitUntil(startAt + 300);
        try { await ACTIONS[st.act](); }
        catch (e) { console.log(`  action ${st.act} failed: ${e.message.split('\n')[0]}`); }
      }
      cumW += st.w;
      const nextAt = t0 + (sc.lead + (cumW / totalW) * sc.tts) * 1000;
      await waitUntil(Math.min(nextAt, t0 + (sc.dur - 0.15) * 1000));
    }
    await waitUntil(t0 + (sc.lead + sc.tts) * 1000);
    await stageEval(() => window.stage.subtitle(''));
    await waitUntil(t0 + sc.dur * 1000);
  }

  await page.waitForTimeout(1500); // post-roll
  await context.close();
  await browser.close();
  server.close();

  const vpath = await video.path();
  const rawOut = path.join(OUT, 'raw.webm');
  fs.copyFileSync(vpath, rawOut);

  fs.writeFileSync(path.join(VIDEO, 'timing.json'), JSON.stringify({
    offset, total: totalDur, appUrl: APP_URL,
    scenes: SCENES.map(s => ({ n: s.n, lead: s.lead, tail: s.tail, tts: s.tts, dur: s.dur })),
  }, null, 2));

  console.log('\nraw video:', rawOut);
  console.log('timing.json written');
  console.log('page/console errors:', errors.length ? errors.slice(0, 10) : 'none');
})().catch(e => { console.error('DIRECTOR FAIL:', e); process.exit(1); });
