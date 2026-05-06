import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import Link from 'next/link';

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
        <header className="glass site-header">
          <div className="site-header-inner">
            <h1 className="site-logo">
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span style={{ color: 'var(--accent)' }}>History</span>Diff
              </Link>
            </h1>
            <nav className="site-nav">
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>アーカイブ</Link>
              <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>プロジェクトについて</Link>
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
