import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'HistoryDiff | 歴史の視点を比較する',
  description: '世界各国の歴史教科書に記載されている歴史的事象の違いを明確にするプラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <header style={{ borderBottom: '1px solid var(--glass-border)', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100 }} className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--accent)' }}>History</span>Diff
            </h1>
            <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <a href="/">アーカイブ</a>
              <a href="#">プロジェクトについて</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>© 2026 HistoryDiff Project - 教育と対話のためのプラットフォーム</p>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-QEXPZ1LKKV" />
    </html>
  );
}
