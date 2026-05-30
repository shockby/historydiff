## 概要 / Summary

HistoryDiff アプリケーションにおける多言語化（デフォルト：英語、および日本語・中国語）の対応と、Next.js の静的エクスポート（Static Export）対応を行いました。
初期実装のクエリパラメータによる言語切り替えから、ご要望に合わせてサブディレクトリパス（日本語：`/ja`、中国語：`/zh`、英語：プレフィックスなし `/`）によるURLルーティング設計に移行しました。

We have implemented comprehensive multi-language support (English, Japanese, and Chinese) for the HistoryDiff application and ensured complete compatibility with Next.js static-export mode (`output: 'export'`).
Following the initial query parameter implementation, we transitioned the architecture to native localized subdirectory paths (Japanese: `/ja`, Chinese: `/zh`, English: `/` without prefix) to satisfy URL routing specifications.

---

### 主な変更内容 / Key Changes

1. **サブディレクトリ型ルーティングの導入 (Subdirectory Routing Transition)**
   - 日本語（`/ja`）および中国語（`/zh`）用のディレクトリラッパー `src/app/[lang]/page.tsx` および `src/app/[lang]/events/[id]/page.tsx` を新規作成しました。
   - `generateStaticParams()` により、ビルド時にすべての言語バリエーションに応じた静的サブディレクトリパス（例: `/ja/events/covid-origin`）を自動的に pre-render するように構成しました。
   - Recreated localized route wraps under `src/app/[lang]/page.tsx` and `src/app/[lang]/events/[id]/page.tsx` resolving dynamic path parameters.
   - Configured `generateStaticParams()` to pre-render every language-based permutation of routes into pristine static files during the build process.

2. **デフォルトパスの軽量化と最適化 (Root Core Optimization)**
   - 共通のルートパス（`/` および `/events/[id]`）は、ビルド時に英語（`en`）のデータのみをロードするように簡素化し、ページの初期読み込み時の転送量を削減し高速化しました。
   - Reverted root templates (`src/app/page.tsx` and `src/app/events/[id]/page.tsx`) to fetch exclusively English (`en`) data payloads, ensuring ultra-lightweight entry points.

3. **パス切り替え対応の言語セレクター (Path-based Interactive Selector)**
   - クエリパラメータ `?lang=...` ではなく、ブラウザの `pathname`（パスの先頭に `/ja` または `/zh` があるか）からアクティブ言語を検出するロジックに変更しました。
   - 言語変更の際には、プレフィックスを置換、追加、あるいは削除する遷移処理を `LanguageSelector.tsx` に実装しました。
   - Re-engineered `LanguageSelector.tsx` to detect active language directly from browser `pathname` prefixes and perform URL path rewrites instead of query operations.

4. **翻訳自動化ツールの導入とファイル生成 (Automated Translation Tooling)**
   - 翻訳スクリプト `translate.py` を作成・実行し、全92個の視点マークダウンおよび28個のコミュニティノート（`notes.json`）を英語（`en`）と中国語（`zh`）に自動翻訳し、ファイルを生成しました（日本語 `ja` は元のデフォルトデータ）。
   - Created and executed `translate.py` to translate all 92 markdown perspective files and 28 `notes.json` community notes into English (`en`) and Chinese (`zh`), with Japanese (`ja`) as the source default.

5. **各UIコンポーネントのローカライズ (Component Localization)**
   - `CommunityNotes.tsx`（判定ステータスや評価項目など）および `EventPageClient.tsx` 内の各種UIテキスト（国別フィルタ、テーブル、凡例など）を、Propsとして渡されるアクティブ言語に合わせて適切にローカライズしました。
   - Fully localized `CommunityNotes.tsx` (including dynamic verdicts and criteria) and `EventPageClient.tsx`.

---

### 検証およびビルド結果 / Verification & Build Results

最適化された本番ビルド（`npm run build`）を実行し、ホーム3言語分および全28イベントの3言語分の詳細ページを含む、**合計90ページ**がビルドエラーや警告なしで完全に静的ファイルとして pre-render されることを確認しました。

Successfully verified with an optimized production build (`npm run build`). Pre-rendered **90 static pages** (3 localized homes + 28 events × 3 languages) cleanly into static directories without build errors.
