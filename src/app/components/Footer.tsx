'use client';

import { useSearchParams } from 'next/navigation';
import { Language } from '@/lib/translations';

const footerTranslations = {
  en: '© 2026 HistoryDiff Project - A Platform for Education and Dialogue',
  ja: '© 2026 HistoryDiff Project - 教育と対話のためのプラットフォーム',
  zh: '© 2026 HistoryDiff Project - 教育与对话的平台'
};

export default function Footer() {
  const searchParams = useSearchParams();
  const lang = (searchParams.get('lang') || 'en') as Language;
  const text = footerTranslations[lang] || footerTranslations.en;

  return (
    <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <p>{text}</p>
    </footer>
  );
}
