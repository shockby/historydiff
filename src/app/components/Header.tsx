'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { translations, Language } from '@/lib/translations';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || '';
  
  // Detect language from pathname (e.g. /ja, /zh, /ko) or searchParams
  let currentLang: Language = 'en';
  if (pathname.startsWith('/ja')) currentLang = 'ja';
  else if (pathname.startsWith('/zh')) currentLang = 'zh';
  else if (pathname.startsWith('/ko')) currentLang = 'ko';
  else {
    currentLang = (searchParams.get('lang') || 'en') as Language;
  }

  const t = translations[currentLang] || translations.en;

  const homeLink = currentLang === 'en' ? '/' : `/${currentLang}`;
  const guideLink = currentLang === 'en' ? '/guide' : `/${currentLang}/guide`;
  const aboutLink = `${homeLink}#about`;

  return (
    <header className="glass site-header">
      <div className="site-header-inner">
        <h1 className="site-logo">
          <Link href={homeLink} style={{ textDecoration: 'none', color: 'inherit' }}>
            <span style={{ color: 'var(--accent)' }}>History</span>Diff
          </Link>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <nav className="site-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href={homeLink} style={{ color: 'inherit', textDecoration: 'none' }}>
              {t.archive}
            </Link>
            <Link href={guideLink} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {t.guide}
            </Link>
            <Link href={aboutLink} style={{ color: 'inherit', textDecoration: 'none' }}>
              {t.about}
            </Link>
          </nav>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
