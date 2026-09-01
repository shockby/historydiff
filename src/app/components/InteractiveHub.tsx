'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, HelpCircle, Compass } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import { EventPerspective } from '@/lib/markdown';

// Dynamic import to keep page load lightweight
const HistoryQuiz = dynamic(() => import('./HistoryQuiz'), { ssr: false });
const PerceptionDiagnostic = dynamic(() => import('./PerceptionDiagnostic'), { ssr: false });

interface InteractiveHubProps {
  events: { id: string; perspectives: EventPerspective[] }[];
  lang: string;
}

export default function InteractiveHub({ events, lang }: InteractiveHubProps) {
  const [activeTab, setActiveTab] = useState<'quiz' | 'diagnostic'>('quiz');
  const activeLang = (lang as Language) || 'en';
  const t = translations[activeLang] || translations.en;

  const eventsPool = events
    .filter((e) => e.perspectives && e.perspectives.length >= 2)
    .map((e) => ({
      id: e.id,
      title: e.perspectives[0]?.title || e.id,
      perspectives: e.perspectives,
    }));

  return (
    <section style={{ marginTop: '3.5rem', marginBottom: '3rem' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#818cf8',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}>
              <Sparkles size={13} />
              {t.interactiveHubBadge}
            </span>
          </div>
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            borderLeft: '4px solid #818cf8',
            paddingLeft: '0.8rem',
            lineHeight: 1.25,
            color: 'var(--foreground)',
          }}>
            {t.interactiveHubTitle}
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            marginTop: '0.4rem',
            maxWidth: '750px',
          }}>
            {t.interactiveHubSubtitle}
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          padding: '0.3rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'quiz' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: activeTab === 'quiz' ? '#f87171' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'quiz' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
          >
            <HelpCircle size={15} />
            <span>{t.interactiveTabQuiz}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnostic')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'diagnostic' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'diagnostic' ? '#818cf8' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'diagnostic' ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
          >
            <Compass size={15} />
            <span>{t.interactiveTabDiagnostic}</span>
          </button>
        </div>
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'quiz' && (
          <HistoryQuiz lang={lang} isCardOnly={true} />
        )}
        {activeTab === 'diagnostic' && (
          <PerceptionDiagnostic
            lang={lang}
            eventsPool={eventsPool}
            isCardOnly={true}
          />
        )}
      </div>
    </section>
  );
}
