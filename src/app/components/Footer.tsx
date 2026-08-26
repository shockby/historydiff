'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Language, translations } from '@/lib/translations';

const footerTranslations = {
  en: '© 2026 HistoryDiff Project - A Platform for Education and Dialogue',
  ja: '© 2026 HistoryDiff Project - 教育と対話のためのプラットフォーム',
  zh: '© 2026 HistoryDiff Project - 教育与对话的平台',
  ko: '© 2026 HistoryDiff Project - 교육과 대화를 위한 플랫폼'
};

export default function Footer() {
  const searchParams = useSearchParams();
  const pathname = usePathname() || '';
  
  let lang: Language = 'en';
  if (pathname.startsWith('/ja')) lang = 'ja';
  else if (pathname.startsWith('/zh')) lang = 'zh';
  else if (pathname.startsWith('/ko')) lang = 'ko';
  else {
    lang = (searchParams.get('lang') || 'en') as Language;
  }

  const text = footerTranslations[lang] || footerTranslations.en;
  const t = translations[lang] || translations.en;
  const guideLink = lang === 'en' ? '/guide' : `/${lang}/guide`;
  const homeLink = lang === 'en' ? '/' : `/${lang}`;

  return (
    <footer style={{ padding: '3.5rem 2rem 4rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
        <Link href={homeLink} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          {t.archive}
        </Link>
        <span>•</span>
        <Link href={guideLink} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          {t.guide}
        </Link>
        <span>•</span>
        <Link href={`${homeLink}#about`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          {t.about}
        </Link>
      </div>
      <p style={{ margin: 0, fontSize: '0.88rem' }}>{text}</p>
    </footer>
  );
}
