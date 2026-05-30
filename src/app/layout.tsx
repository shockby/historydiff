import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Suspense } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'HistoryDiff',
  description: '世界各国の歴史教科書に記載されている歴史的事象の違いを明確にするプラットフォーム',
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

