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
