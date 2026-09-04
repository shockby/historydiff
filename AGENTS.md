<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:npm-install-fallback -->
## npm パッケージインストール失敗時の対応

このプロジェクトでは `npm install` がハングする場合がある。
以下の順序でフォールバックする：

1. `npm install <pkg> --legacy-peer-deps` を試す（タイムアウト目安: 2分）
2. ハングが続く場合は、**外部ライブラリなし**で代替実装を検討する：
   - 地図系: Pure SVG + CDN（world-atlas@2）で描画
   - アニメーション系: CSS アニメーションで代替
   - チャート系: `<canvas>` または SVG で自前実装
3. CDN リソースは `fetch` でクライアントサイドに読み込む（SSR 回避）
<!-- END:npm-install-fallback -->

<!-- BEGIN:nextjs-dynamic-import -->
## クライアント専用コンポーネントの SSR 回避

ブラウザ API（`window`, `document`, `wheel` イベント、SVG アニメーション等）に依存するコンポーネントは
必ず `next/dynamic` で動的インポートし SSR を無効化する：

```tsx
import dynamic from 'next/dynamic';
const MapView = dynamic(() => import('./MapView'), { ssr: false });
```

対象となる主なケース：
- 地図コンポーネント（SVG アニメーション、wheel イベント）
- ブラウザの `localStorage` / `sessionStorage` を使うコンポーネント
- CDN から `fetch` してレンダリングするコンポーネント
<!-- END:nextjs-dynamic-import -->

<!-- BEGIN:perspective-ui-rules -->
## 多視点UI & コード品質ルール

1. **視点（Perspective）のデフォルト選択**:
   - 多視点を切替表示するUIコンポーネントでは、表示言語（`ja`, `en` 等）に合わせて該当する自国視点（日本語表示なら「日本」/「Japan」）を優先して初期選択状態（デフォルト）に指定すること。
2. **Nullish Coalescing演算子 (`??`) の構文規則**:
   - `||` 演算子と `??` 演算子を同一式で組み合わせる場合、SWC/Turbopackのパーサーエラーを防止するため、必ず括弧 `(a ?? b)` で囲んでグループ化すること。
<!-- END:perspective-ui-rules -->

<!-- BEGIN:doc-sync-rules -->
## ドキュメント更新 & 4言語 README 同期ルール

1. **4言語 README の一貫性と同期**:
   - プロジェクトの README（`README.ja.md`, `README.md`, `README.zh.md`, `README.ko.md`）を更新する際は、必ず4言語すべてを同時に更新すること。
   - セクション構成（主な機能、技術スタック、ディレクトリ構成、操作ガイド、データ構造、自動化スクリプト、セットアップ手順）を4言語間で統一し、記述の欠落や古い情報の残存を防ぐ。

2. **操作ガイド・Mermaid図の維持**:
   - ユーザー向けの操作手順（事象探索 → 記述比較 → 事実検証 → 診断・クイズ・現代ニュース）は、Mermaid図やステップ番号を用いて全言語で分かりやすく明記する。

3. **アプリ内利用ガイド（`/guide`）との整合性**:
   - UIの操作方法や主要機能に変更があった場合は、README だけでなくアプリ内ガイド（`src/app/[lang]/guide/page.tsx`、`src/lib/translations.ts`、`src/app/components/WelcomeModal.tsx`）の説明との整合性を確認すること。
<!-- END:doc-sync-rules -->
