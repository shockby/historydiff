'use client';

import { useState } from 'react';
import { Scale, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { translations, Language } from '@/lib/translations';

interface NeutralityBannerProps {
  lang: Language;
}

export default function NeutralityBanner({ lang }: NeutralityBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const t = translations[lang] || translations.en;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scale size={13} style={{ color: '#818cf8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#818cf8',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {t.neutralityBadge}
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem' }}>|</span>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {t.neutralityTopNotice}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '3px 8px',
            color: 'var(--text-secondary)',
            fontSize: '0.72rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ShieldCheck size={12} style={{ color: '#38bdf8' }} />
          <span>{expanded ? t.showLess : t.about}</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>{t.aboutText1}</p>
          <p style={{ margin: 0 }}>{t.aboutText2}</p>
        </div>
      )}
    </div>
  );
}
