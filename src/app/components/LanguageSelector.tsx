'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '简体中文' },
  { code: 'ko', label: '한국어' }
];

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current language from the pathname prefix
  let currentLang = 'en';
  if (pathname.startsWith('/ja/') || pathname === '/ja') {
    currentLang = 'ja';
  } else if (pathname.startsWith('/zh/') || pathname === '/zh') {
    currentLang = 'zh';
  } else if (pathname.startsWith('/ko/') || pathname === '/ko') {
    currentLang = 'ko';
  }

  const currentLabel = LANGUAGES.find(l => l.code === currentLang)?.label || 'English';

  // Save current language prefix to localStorage on mount or change
  useEffect(() => {
    if (typeof window !== 'undefined' && currentLang) {
      localStorage.setItem('preferred-lang', currentLang);
    }
  }, [currentLang]);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    // Clean current path from localized prefix
    let cleanPath = pathname;
    if (pathname.startsWith('/ja/')) {
      cleanPath = pathname.substring(3);
    } else if (pathname === '/ja') {
      cleanPath = '/';
    } else if (pathname.startsWith('/zh/')) {
      cleanPath = pathname.substring(3);
    } else if (pathname === '/zh') {
      cleanPath = '/';
    } else if (pathname.startsWith('/ko/')) {
      cleanPath = pathname.substring(3);
    } else if (pathname === '/ko') {
      cleanPath = '/';
    }

    // Ensure cleanPath starts with a single slash
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // Build new path
    let newPath = cleanPath;
    if (langCode === 'ja') {
      newPath = '/ja' + (cleanPath === '/' ? '' : cleanPath);
    } else if (langCode === 'zh') {
      newPath = '/zh' + (cleanPath === '/' ? '' : cleanPath);
    } else if (langCode === 'ko') {
      newPath = '/ko' + (cleanPath === '/' ? '' : cleanPath);
    }

    // Preserve any existing search query if present
    const params = searchParams.toString();
    const finalUrl = params ? `${newPath}?${params}` : newPath;

    router.push(finalUrl);
    setIsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 110 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.85rem',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--foreground)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
          }
        }}
      >
        <Globe size={15} style={{ color: 'var(--text-secondary)' }} />
        <span>{currentLabel}</span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--text-secondary)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: '140px',
            background: 'var(--background)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '0.4rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: 'fadeInUp 0.15s ease-out forwards',
          }}
        >
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: currentLang === lang.code ? 'rgba(224, 46, 46, 0.15)' : 'transparent',
                color: currentLang === lang.code ? 'white' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: currentLang === lang.code ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (currentLang !== lang.code) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--foreground)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentLang !== lang.code) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
