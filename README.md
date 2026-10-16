# ゆきかきリンク — Yukikaki Link

**Neighborhood snow-shoveling help, matched between neighbors. No accounts. Works offline.**
近所の「雪かきを頼みたい人」と「手伝いたい人」をつなぐ、アカウント不要・オフライン対応のPWA。

Built for **[Neighborhood Hacks 2026](https://neighborhood-hacks-2026.devpost.com/)** — Track 04: Safety & Emergency Response (tracks are inspiration-only).
開発期間: 2026-10-16 〜 2026-10-23 (ハッキング期間内に全コード新規作成)

**▶ Live app: https://maebahesioru.github.io/yukikaki-link/** （GitHub Pages / PWA・オフライン対応）

---

## The problem (Why)

札幌の冬、高齢者世帯にとって雪かきは毎日の負担であり、転倒・雪下ろし事故のリスクでもある。
福祉除雪は申請制で対象が限られ、担い手不足・従事者の高齢化が進む。一方で、部活前の高校生など
「手伝いたいのに接点がない」層が大量にいる。

私たちの町内で実際に見たこと: 12月の朝、隣のおばあさんが腰を曲げて玄関前の雪をひとりで除けていた。
「頼める人がいない」——その一言がこのプロジェクトの出発点。(証言・統計は発表資料/デモ動画で提示)

## What it does

- **依頼は3タップ**: ①場所(町内会ブロックを地図タップ) ②種類(玄関前/通路/駐車場) ③期限(今すぐ/今日中/明日の朝)
- **助ける側**: 近い順のボードから「手伝います」→ 完了 → お互いに「ありがとう」
- **ありがとう経済**: 金銭のやり取りなし。感謝スタンプが町内会ごとのカウンターに積み上がる
- **みかんマスコット**: 助け合いの累計で毛糸帽が成長
- **安全第一**: 屋根雪は選択不可(安全上の理由を明示)。札幌市地域活動保険へのリンク
- **アクセシビリティ**: 高齢者モード(大文字・ふりがな)、アカウント不要、オフライン動作、やさしい日本語

## Built with

- Vanilla **HTML / CSS / JavaScript** — 依存ゼロ(フレームワークなし)
- **Canvas** — 町内会ブロック地図・マスコット描画
- **Service Worker** — オフライン対応
- **Web Audio** — 手続き生成のチャイム音
- **localStorage** — データ永続化(サーバーなし・プライバシー重視)

## AI / OSS disclosure (per hackathon rules)

- **AI coding assistance** を使用して開発しています(AIアシスタントによるコード生成支援)。すべてのコードは
  ハッキング期間中(2026-10-16〜)に本リポジトリ向けに新規作成されました。
- 過去プロジェクトからのコード流用はありません(デザインパターンの参考のみ)。
- OSSライブラリ: なし(依存ゼロ)。テストのみ開発ツールとしてPlaywrightを使用。

## Status

✅ **MVP deployed** — 2026-10-16。GitHub Pages公開済み・E2E 35チェック green（ローカル+本番URL）。
進行状況の詳細は [STATUS.md](STATUS.md) を参照。

## Evidence & docs

- [docs/evidence-kit.md](docs/evidence-kit.md) — 「問題は本物か?」に答える公開統計（出典URL付き）
- [assets/invite-card.png](assets/invite-card.png) — 印刷できる招待カード（QRコード付き）
- アプリ内ホーム画面にも「おとなりさんを さそう」QRカードを表示

## Run locally

```bash
# 静的ファイルのみ — 任意のHTTPサーバーで配信
python3 -m http.server 8080
# → http://localhost:8080
```

## Tests

```bash
node tests/smoke.cjs        # ローカル（静的サーバー内蔵・Playwright使用）
BASE_URL=https://maebahesioru.github.io/yukikaki-link/ node tests/smoke.cjs   # 本番URLを検証
```

35チェック: 依頼(3タップ)→ボード→完了→ありがとう→町カウンター→大型文字→永続化→
Service Worker→**オフライン再読込**→QR表示→マニフェスト。詳細は [tests/README.md](tests/README.md)。

## License

MIT — see [LICENSE](LICENSE)
