# STATUS — ゆきかきリンク (Yukikaki Link)

**Neighborhood Hacks 2026** / Hacking period: 2026-10-16 〜 10-23（提出締切: Oct 23 11:59 PM CST）
最終更新: 2026-10-16 (JST)

## Now

- **MVP完成・公開済み**: https://maebahesioru.github.io/yukikaki-link/ （GitHub Pages・HTTP 200確認済み）
- **E2E 35チェック green**: ローカル・本番URL両方で実測（Playwright headless）
- **QR招待**: 生成済み（本番URLへデコード確認）+ 印刷用招待カード + アプリ内QR表示
- **証拠キット v1**: docs/evidence-kit.md（札幌/北海道の公開統計・出典URL付き）
- **プロンプト発表待ち**: 公式 https://neighborhoodhacks.org/challenge/ は "TO BE ANNOUNCED"

## Done

- [x] PWA: 3タップ依頼フロー / 依頼ボード / 受諾→完了 / ありがとう経済 / みかんカウンター / ルール・安全ページ
- [x] オフライン対応（Service Worker / ykl-v2キャッシュ）
- [x] GitHub Pages デプロイ + 本番E2E（35 checks, 0 fail）
- [x] QR招待（qr-invite.png|svg・招待カード・ホーム画面表示・SWキャッシュ対象）
- [x] E2E正式化: tests/smoke.cjs（自己完結・BASE_URLで本番検証可・screenshots）
- [x] 証拠キット: 高齢化/福祉除雪/雪害/転倒/除雪費/町内会（全数値に出典）
- [x] 監視: Devpost + 公式サイト8ページを3分間隔ポーリング（発表検知ログあり）

## Next

- [ ] **プロンプト発表の確認**（公式キックオフ Oct 16 CDT / https://neighborhoodhacks.org/challenge/）
      → 発表されたら適合判定（トラック・要件・ルーブリック変更の有無）
- [ ] 聞き取りメモの記入（evidence-kit §3 — チーム実施分）
- [ ] デモ動画（2-6分）収録・編集（本番URLで動作を見せる）
- [ ] 提出文作成（Devpost: problem/observation/data + AI開示）
- [ ] Devpost提出（Oct 23 11:59 PM CST まで）

## Compliance

- 全コードはハッキング期間（Oct 16〜）内に本リポジトリ向けに**新規作成**（過去プロジェクトからの流用なし）
- **AI coding assistance 使用**（README記載・提出時に開示）
- アプリは依存ゼロ（テストのみ開発ツールとしてPlaywrightを使用）
- 屋根雪は安全上の理由で選択不可（実装済み・テスト済み）

## Key numbers（提出文用・出典は evidence-kit.md）

| 事実 | 数値 | 時点 |
|---|---|---|
| 札幌市65歳以上 | 566,710人（29.35%） | R8.1.1 |
| 高齢単身世帯 | 121,789世帯 | R2国勢調査 |
| 福祉除雪 利用/協力員 | 5,692世帯 / 3,719人 | R6年度 |
| 雪害（道内） | 175人死傷・10人死亡（全員除雪作業中） | 2025-26冬 |
| 雪道転倒 救急搬送 | 1,869人（70歳以上45.7%） | R6年度 |
| 雪対策費 | R7予算 284.8億円 | R7 |
| 町内会加入率 | 68.43%（H1: 83.0%から低下） | R8.1.1 |
