'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { translations, Language } from '@/lib/translations';
import { Archive, BookOpen, Info } from 'lucide-react';
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
        <div className="site-header-actions">
          <nav className="site-nav" aria-label="Main Navigation">
            <Link href={homeLink} className="site-nav-link" title={t.archive}>
              <Archive size={16} className="site-nav-icon" />
              <span className="site-nav-label">{t.archive}</span>
            </Link>
            <Link href={guideLink} className="site-nav-link" title={t.guide}>
              <BookOpen size={16} className="site-nav-icon" />
              <span className="site-nav-label">{t.guide}</span>
            </Link>
            <Link href={aboutLink} className="site-nav-link" title={t.about}>
              <Info size={16} className="site-nav-icon" />
              <span className="site-nav-label">{t.about}</span>
            </Link>
          </nav>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
