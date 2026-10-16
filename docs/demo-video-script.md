# デモ動画 ナレーション台本 — ゆきかきリンク / Yukikaki Link

**Neighborhood Hacks 2026 — 提出物④ デモ動画（2〜6分・必須・"Show your project working"）**

- 形式: 1920×1080 / H.264 MP4 / 英語ナレーション + 英語字幕（審査員は英語圏のエンジニア）
- 収録: 本番URL（https://maebahesioru.github.io/yukikaki-link/）を実アプリのまま操作
- 日本語版ナレーションは本ドキュメント §2（本人の声で再収録する場合用）
- 自動生成パイプライン: `video/stage.html` + `video/director.cjs`（Playwright録画 → ffmpeg合成）

---

## 1. 英語ナレーション（動画で使用）＋字幕

> 字幕は各ビートがそのまま1字幕行になる。数値は evidence-kit.md の出典準拠。

### Scene 1 — THE PROBLEM（フルスライド）
| # | 字幕 / ナレーション |
|---|---|
| 1 | Sapporo, Japan — my city. In winter, snow is not just a chore. For many people here, it's a daily risk. |
| 2 | 566,710 residents are 65 or older — 29.4%. Nearly 122,000 seniors live alone. |
| 3 | The city's welfare snow-removal service has strict eligibility — and too few helpers to go around. |
| 4 | Every winter, about 1,900 people are hospitalized after falls on snowy streets. Nearly half are 70 or older. |
| 5 | Last winter in Hokkaido, 10 people died clearing snow — every one of them while shoveling. |
| 6 | On our street: an elderly neighbor, alone in the snow. When we asked why — "I have no one to ask." |

画面: 統計カード4枚（65歳以上/単身世帯/転倒搬送/除雪中死亡）＋出典表記（札幌市・北海道）。

### Scene 2 — THE SOLUTION（分割レイアウト・実機スライドイン）
| # | 字幕 / ナレーション |
|---|---|
| 1 | Yukikaki Link connects the neighbor who needs snow shoveled with the neighbor who can help. |
| 2 | No accounts. No app store. Works offline. Three taps to ask. And no money — neighbors trade "thank you"s. |
| 3 | This is the real app, live. Here's how it works. |

### Scene 3 — ASK IN 3 TAPS（分割レイアウト・実操作）
| # | 字幕 / ナレーション |
|---|---|
| 1 | I'm the one who needs help. Tap "ask for snow shoveling". |
| 2 | Tap one: where — I tap my block on the town map. |
| 3 | Tap two: what — the entrance in front of the door. |
| 4 | Tap three: when — right now. That's the whole request. |
| 5 | My list shows it: "no one yet". And helpers see it on the board — nearest block first. |

操作: たのむ→地図タップ→玄関前→今すぐ→かくにん→とうろく→わたしのたのみごと→ボード。

### Scene 4 — HELP & THANKS（実操作）
| # | 字幕 / ナレーション |
|---|---|
| 1 | Now I'm the helper. The board lists requests from my town, nearest first. |
| 2 | This one's from the next block over. I tap "I'll help". |
| 3 | When the job is done, I mark it complete. |
| 4 | Then we thank each other — not with money. |
| 5 | "Thank you" sent — and their reply comes back: "it arrived". |

### Scene 5 — THE THANKS ECONOMY（実操作）
| # | 字幕 / ナレーション |
|---|---|
| 1 | Every thank-you adds up. This is our town's counter — and every block has its own bar. |
| 2 | And this is Mikan, our mascot in a knitted hat. |
| 3 | Mikan grows as the neighborhood helps each other — a small nudge that brings people back. |

### Scene 6 — BUILT FOR EVERY NEIGHBOR（実操作）
| # | 字幕 / ナレーション |
|---|---|
| 1 | Many of our neighbors are older — so there's an elder mode: one tap, bigger text, and furigana readings on every kanji. |
| 2 | Safety first: you cannot request roof snow removal — it's too dangerous, and the app explains why. |
| 3 | No accounts means no data on a server — everything stays on this device. |
| 4 | And because it's a PWA, it opens even when the network is down — exactly when a snowstorm hits. |

操作: あ＋（高齢者モードON・ふりがな表示）→ルールとあんぜん（あんぜん5か条・屋根雪禁止）→あ＋OFF。

### Scene 7 — THE EVIDENCE & CLOSE（フルスライド）
| # | 字幕 / ナレーション |
|---|---|
| 1 | We can prove the problem is real — with Sapporo's own statistics. |
| 2 | 566,000 seniors. 121,000 living alone. 5,692 households reached by welfare snow removal — while 1,869 people were hospitalized from falls. |
| 3 | 28.4 billion yen of snow spending — on roads, not on doorsteps. Every number is cited in our public evidence kit. |
| 4 | Yukikaki Link is live and open source. No accounts. No money. Just neighbors. |
| 5 | Thank you — or as we say in Sapporo: "otagaisama." |

画面: 証拠キットの統計グリッド（出典付き）→ クローズカード（Live URL・GitHub・QR招待）。

---

## 2. 日本語版ナレーション（再収録用・任意）

1. **問題**: 札幌の冬、雪かきは毎日のリスクです。65歳以上は56万6,710人（29.4%）、高齢単身世帯は12万1,789世帯。福祉除雪は要件が厳しく、担い手も足りません。雪道の転倒で毎年約1,900人が救急搬送され、70歳以上が45.7%。昨冬の道内では10人が除雪中に亡くなりました。うちの通りでも、隣のおばあさんが一人で雪を除けていました。「頼める人がいない」——それがこのアプリの出発点です。
2. **解決策**: ゆきかきリンクは、雪かきを頼みたい人と手伝いたい人をつなぐWebアプリ。アカウント不要・オフライン対応・3タップで依頼。お金はやり取りせず「ありがとう」を送り合います。
3. **依頼**: ①場所（町内会ブロックを地図でタップ）②種類（玄関前）③期限（今すぐ）。これで依頼完了。ボードには近い順に並びます。
4. **手伝い**: 隣のブロックの依頼に「手伝います」→完了→「ありがとう」を送ると、相手からも「とどきました」。
5. **ありがとう経済**: 町のカウンターが14に。ブロックごとのバー、そして毛糸帽のマスコット「みかん」が助け合いの分だけ成長します。
6. **すべての隣人のために**: 高齢者モード（大きい文字＋ふりがな）、屋根雪は安全のため依頼不可、あんぜん5か条、アカウントなし＝端末内保存、PWAでオフラインでも開けます。
7. **証拠と締め**: 数字はすべて公開統計に出典付き（証拠キット）。本番公開中・オープンソース。お金はいらない、隣人だけで。ありがとう——おたがいさま。

---

## 3. 画面に出す統計と出典（evidence-kit.md より）

| 表示 | 数値 | 出典 |
|---|---|---|
| 65歳以上 | 566,710人（29.35%） R8.1.1 | 北海道 住基 [S7] |
| 高齢単身世帯 | 121,789世帯 R2 | 札幌市統計書 [S8] |
| 福祉除雪 利用 | 5,692世帯 R6 | 札幌市 [S4][S5] |
| 雪道転倒 救急搬送 | 1,869人・70歳以上45.7% R6 | 札幌市消防局 [S10] |
| 雪による死傷（道内） | 175人・死亡10人 2025-26冬 | 北海道発表 [S11] |
| 雪対策費 | R7予算 284.8億円 | 札幌市 [S12] |

## 4. 制作メモ

- ナレーション: TTS（ElevenLabs / Adam）で自動生成。ビート境界で字幕切替、シーン尺 = TTS実測長＋前後パディング。
- 動画生成: `node video/director.cjs` → `node video/finalize.cjs` → 完成版 `videos/yukikaki-link-demo.mp4`（3分48秒・1920×1080・H.264/AAC・実アプリを本番URLで操作、字幕焼き込み済み）。
- 再録時の注意: 高齢者モードのデモは「ホーム画面へ移動 → あ＋」の順で行う（他ビュー表示中は #home-title が不可視のため scrollIntoView が30秒タイムアウトし、以降のシーンがズレる）。
- アプリ内の文言は「やさしい日本語」のため、字幕で英訳を補足する（アプリUIは改変しない）。
