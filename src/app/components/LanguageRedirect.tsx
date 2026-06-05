'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 1. Check if user has a manually saved language preference
    const savedLang = localStorage.getItem('preferred-lang');
    
    if (savedLang) {
      if (savedLang === 'ja') {
        router.replace('/ja');
      } else if (savedLang === 'zh') {
        router.replace('/zh');
      } else if (savedLang === 'ko') {
        router.replace('/ko');
      }
      return;
    }

    // 2. If no saved preference, detect browser language
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
    const langCode = browserLang.toLowerCase();

    if (langCode.startsWith('ja')) {
      localStorage.setItem('preferred-lang', 'ja');
      router.replace('/ja');
    } else if (langCode.startsWith('zh')) {
      localStorage.setItem('preferred-lang', 'zh');
      router.replace('/zh');
    } else if (langCode.startsWith('ko')) {
      localStorage.setItem('preferred-lang', 'ko');
      router.replace('/ko');
    } else {
      // For any other language, default to English and mark it as preferred
      localStorage.setItem('preferred-lang', 'en');
    }
  }, [router]);

  return null;
}
