// probe2: full demo flow inside the iframe (production URL) — same clicks the director will use
'use strict';
const pw = require('/home/maebahesioru/.hermes/hermes-agent/node_modules/playwright');
(async () => {
  const b = await pw.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe id="app" src="https://maebahesioru.github.io/yukikaki-link/" style="width:390px;height:844px;border:0"></iframe></body>');
  const app = page.frameLocator('#app');
  await app.locator('#view-home.active').waitFor({ timeout: 30000 });
  console.log('home OK');

  // request: 3 taps
  await app.locator('button.bigbtn.primary[data-goto="request"]').click();
  const map = app.locator('#map');
  const bb = await map.boundingBox();
  await page.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height * 0.55);
  await page.waitForTimeout(250);
  await app.locator('[data-type="entrance"]').click();
  await page.waitForTimeout(250);
  await app.locator('[data-due="today"]').click();
  await page.waitForTimeout(250);
  await app.locator('[data-post]').click();
  await page.waitForTimeout(400);
  const myreq = await app.locator('#myreq-list').innerText();
  console.log('myreq shows 3丁目:', myreq.includes('3丁目'), '| open:', myreq.includes('まだ'));

  // board: accept second card
  await app.locator('.bottomnav button[data-goto="board"]').click();
  await page.waitForTimeout(300);
  const cards = app.locator('#board-list .reqcard');
  console.log('board cards:', await cards.count());
  console.log('first is own 3丁目:', (await cards.first().locator('.block-name').innerText()));
  await cards.nth(1).locator('[data-accept]').click();
  await page.waitForTimeout(300);
  console.log('accepted badge:', (await app.locator('#board-list').innerText()).includes('あなたが てつだいます'));
  await app.locator('#board-list [data-complete]').click();
  await page.waitForTimeout(300);
  console.log('complete view:', await app.locator('#view-complete.active').count() === 1);
  await app.locator('[data-thanks]').click();
  await page.waitForTimeout(300);
  console.log('thanks sent:', (await app.locator('#complete-body').innerText()).includes('ありがとうを おくりました'));
  await page.waitForTimeout(1800);
  console.log('reply received:', (await app.locator('#complete-body').innerText()).includes('とどきました'));

  // community
  await app.locator('.bottomnav button[data-goto="community"]').click();
  await page.waitForTimeout(400);
  console.log('community total:', await app.locator('#com-total').innerText(), '| done:', await app.locator('#com-done').innerText());
  console.log('mascot canvas:', await app.locator('#mascot').count());

  // large text + rules
  await app.locator('.bottomnav button[data-goto="home"]').click();
  await page.waitForTimeout(200);
  await app.locator('#btnLargeText').click();
  await page.waitForTimeout(300);
  console.log('large text on:', await page.evaluate(() => true)); // class lives in iframe doc; check via frame
  const frame = page.frames().find(f => f.url().includes('yukikaki'));
  console.log('html.large:', await frame.evaluate(() => document.documentElement.classList.contains('large')));
  await app.locator('.bottomnav button[data-goto="rules"]').click();
  await page.waitForTimeout(300);
  console.log('rules safety list:', (await app.locator('#view-rules').innerText()).includes('あんぜん 5か'));
  console.log('roof mention:', (await app.locator('#view-rules').innerText()).includes('屋根'));
  await b.close();
  console.log('FULL FLOW OK');
})().catch(e => { console.error('PROBE2 FAIL:', e.message); process.exit(1); });
