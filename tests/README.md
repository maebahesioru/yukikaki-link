# tests/ — E2Eスモークテスト

`smoke.cjs` はアプリの主要フロー（依頼→ボード→完了→ありがとう→町カウンター→
オフライン動作）をヘッドレスChromiumで通しで検証します。

## 実行

```bash
node tests/smoke.cjs
```

- 静的ファイルサーバーを内蔵（Node標準のみ・依存ゼロ）して自動で起動します。
- Playwright の解決順: `$PLAYWRIGHT_PATH` → ローカル `node_modules` → Hermes同梱
  （`~/.hermes/hermes-agent/node_modules/playwright`）。
- スクリーンショットは `tests/screenshots/` に保存されます（git管理外）。

## デプロイ先を検証する場合

```bash
BASE_URL=https://maebahesioru.github.io/yukikaki-link/ node tests/smoke.cjs
```

`BASE_URL` を指定すると内蔵サーバーを起動せず、そのURLに対して同じテストを実行します。
