'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { translations, Language } from '@/lib/translations';
import { Compass, BookOpen, Layers, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WelcomeModalProps {
  lang: string;
}

const STORAGE_KEY = 'historydiff_onboarding_dismissed';

export default function WelcomeModal({ lang }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const activeLang = (lang as Language) || 'en';
  const t = translations[activeLang] || translations.en;

  const guideLink = activeLang === 'en' ? '/guide' : `/${activeLang}/guide`;

  // Check if first-time user
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Small timeout for smooth entrance after page load
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  // Listen for custom open event (e.g. from header or footer trigger)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-onboarding-modal', handleOpen);
    return () => window.removeEventListener('open-onboarding-modal', handleOpen);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Ignore localStorage error
      }
    }
  }, [dontShowAgain]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div
        ref={modalRef}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)',
          backgroundColor: 'var(--card-bg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.15)',
          padding: '2.5rem 2rem 2rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              marginBottom: '0.85rem',
            }}
          >
            {t.welcomeModalBadge}
          </div>
          <h2
            id="welcome-modal-title"
            className="title-gradient"
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              lineHeight: 1.3,
              margin: '0 0 0.75rem',
            }}
          >
            {t.welcomeModalTitle}
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 auto',
              maxWidth: '580px',
            }}
          >
            {t.welcomeModalDesc}
          </p>
        </div>

        {/* 3 Quick Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              padding: '1.2rem 1rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {t.welcomeStep1Title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {t.welcomeStep1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: '1.2rem 1rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {t.welcomeStep2Title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {t.welcomeStep2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: '1.2rem 1rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={20} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {t.welcomeStep3Title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {t.welcomeStep3Desc}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--glass-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={handleClose}
              className="glow-effect"
              style={{
                flex: '1 1 240px',
                maxWidth: '300px',
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <CheckCircle2 size={18} />
              {t.welcomeModalStartBtn}
            </button>

            <Link
              href={guideLink}
              onClick={handleClose}
              style={{
                flex: '1 1 200px',
                maxWidth: '260px',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              {t.welcomeModalGuideBtn}
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Do not show again option */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none',
              marginTop: '0.25rem',
            }}
            onClick={() => setDontShowAgain(!dontShowAgain)}
          >
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
            <label
              htmlFor="dontShowAgain"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {t.welcomeModalDontShowAgain}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
