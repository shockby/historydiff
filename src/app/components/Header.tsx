'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { translations, Language } from '@/lib/translations';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const searchParams = useSearchParams();
  const lang = (searchParams.get('lang') || 'en') as Language;
  const t = translations[lang] || translations.en;

  // Add the ?lang parameter to home links to preserve language state
  const homeLink = lang === 'en' ? '/' : `/?lang=${lang}`;

  return (
    <header className="glass site-header">
      <div className="site-header-inner">
        <h1 className="site-logo">
          <Link href={homeLink} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span style={{ color: 'var(--accent)' }}>History</span>Diff
          </Link>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <nav className="site-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href={homeLink} style={{ color: 'inherit', textDecoration: 'none' }}>
              {t.archive}
            </Link>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>
              {t.about}
            </Link>
          </nav>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
