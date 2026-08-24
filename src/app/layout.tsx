import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://historydiff.pages.dev'),
  title: {
    default: 'HistoryDiff | Visualizing Textbook Differences in History',
    template: '%s | HistoryDiff',
  },
  description: '世界各国の歴史教科書に記載されている歴史的事象の記述の違いを直接比較（Diff）によって可視化するプラットフォーム。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://historydiff.pages.dev',
    siteName: 'HistoryDiff',
    title: 'HistoryDiff | 歴史の「記述の差」を視覚的に解明する',
    description: '世界各国の歴史教科書に記載されている記述の違いをテキスト比較（Diff）で浮き彫りにするプラットフォーム。',
    images: [
      {
        url: '/og/og-top-ja.png',
        width: 1200,
        height: 630,
        alt: 'HistoryDiff - Visualizing Historical Differences in Textbooks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HistoryDiff | 歴史の「記述の差」を視覚的に解明する',
    description: '世界各国の歴史教科書に記載されている記述の違いをテキスト比較（Diff）で浮き彫りにするプラットフォーム。',
    images: ['/og/og-top-ja.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={
          <header className="glass site-header">
            <div className="site-header-inner">
              <h1 className="site-logo">
                <span style={{ color: 'var(--accent)' }}>History</span>Diff
              </h1>
            </div>
          </header>
        }>
          <Header />
        </Suspense>
        <main>{children}</main>
        <Suspense fallback={
          <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>© 2026 HistoryDiff Project</p>
          </footer>
        }>
          <Footer />
        </Suspense>
      </body>
      <GoogleAnalytics gaId="G-QEXPZ1LKKV" />
    </html>
  );
}

