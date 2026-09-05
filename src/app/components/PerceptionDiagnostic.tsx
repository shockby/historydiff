'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Compass, CheckCircle2, GitCompare, Share2, RefreshCw, Award } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import { EventPerspective } from '@/lib/markdown';

export interface DiagnosticEventData {
  id: string;
  title: string;
  perspectives: EventPerspective[];
}

interface PerceptionDiagnosticProps {
  lang: string;
  eventId?: string;
  perspectives?: EventPerspective[];
  eventsPool?: DiagnosticEventData[];
  isCardOnly?: boolean;
  hideHeader?: boolean;
}

export default function PerceptionDiagnostic({
  lang,
  eventId,
  perspectives,
  eventsPool,
  isCardOnly = false,
  hideHeader = false,
}: PerceptionDiagnosticProps) {
  const activeLang = (lang as Language) || 'en';
  const t = translations[activeLang] || translations.en;

  // Curated events for diagnostic when pool is given
  const activePool = useMemo(() => {
    if (eventsPool && eventsPool.length > 0) {
      return eventsPool.filter((e) => e.perspectives && e.perspectives.length >= 2);
    }
    return [];
  }, [eventsPool]);

  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine current active event & perspectives
  const currentEvent = useMemo(() => {
    if (perspectives && perspectives.length >= 2) {
      return {
        id: eventId || 'current-event',
        title: perspectives[0]?.title || '',
        perspectives,
      };
    }
    if (activePool.length > 0) {
      return activePool[selectedEventIndex % activePool.length];
    }
    return null;
  }, [perspectives, eventId, activePool, selectedEventIndex]);

  const currentPerspectives = currentEvent?.perspectives || [];

  const handleSelect = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(idx);
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setHasSubmitted(false);
    setCopied(false);
  };

  const handleNextEvent = () => {
    if (activePool.length > 1) {
      handleReset();
      setSelectedEventIndex((prev) => (prev + 1) % activePool.length);
    }
  };

  if (!currentEvent || currentPerspectives.length < 2) {
    return null;
  }

  const selectedPerspective = selectedIndex !== null ? currentPerspectives[selectedIndex] : null;
  const eventHref = activeLang === 'en' ? `/events/${currentEvent.id}` : `/${activeLang}/events/${currentEvent.id}`;

  const handleShare = () => {
    if (!selectedPerspective) return;
    const shareText = t.diagnosticShareText(currentEvent.title, selectedPerspective.country);
    const url = typeof window !== 'undefined' ? window.location.href : 'https://historydiff.pages.dev';
    const textToShare = `${shareText} ${url}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <section
      className={hideHeader ? '' : 'card glass'}
      style={hideHeader ? {
        paddingTop: '1.25rem',
        position: 'relative',
      } : {
        padding: isCardOnly ? '1.5rem' : '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(145deg, rgba(16, 22, 34, 0.75) 0%, rgba(10, 14, 24, 0.9) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        marginTop: isCardOnly ? '0' : '2.5rem',
        marginBottom: isCardOnly ? '0' : '2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      {!hideHeader && (
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header bar */}
      {!hideHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.25))',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}>
              <Compass size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#818cf8',
                  textTransform: 'uppercase',
                }}>
                  {t.diagnosticBadge}
                </span>
                <span className="badge" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                  {currentEvent.title}
                </span>
              </div>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--foreground)',
                marginTop: '2px',
              }}>
                {t.diagnosticTitle}
              </h3>
            </div>
          </div>

          {activePool.length > 1 && (
            <button
              type="button"
              onClick={handleNextEvent}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <RefreshCw size={12} />
              <span>{t.diagnosticTryAnother}</span>
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: 1.6,
      }}>
        {t.diagnosticSubtitle}
      </p>

      {/* Diagnostic Prompt */}
      <div style={{
        fontSize: '0.92rem',
        fontWeight: 600,
        color: 'var(--foreground)',
        marginBottom: '1rem',
      }}>
        ❓ {t.diagnosticQuestion}
      </div>

      {/* Blind Options List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        marginBottom: '1.5rem',
      }}>
        {currentPerspectives.map((p, idx) => {
          const letter = optionLetters[idx] || `${idx + 1}`;
          const isSelected = selectedIndex === idx;
          const excerpt = p.content.trim().split('\n')[0].slice(0, 180) + '…';

          return (
            <div
              key={idx}
              onClick={() => !hasSubmitted && handleSelect(idx)}
              style={{
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: hasSubmitted
                  ? isSelected
                    ? '1px solid #3fb950'
                    : '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                background: hasSubmitted
                  ? isSelected
                    ? 'rgba(46, 160, 67, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)'
                  : 'rgba(255, 255, 255, 0.03)',
                cursor: hasSubmitted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!hasSubmitted) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasSubmitted) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: hasSubmitted && isSelected ? 'rgba(46, 160, 67, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: hasSubmitted && isSelected ? '#3fb950' : 'var(--foreground)',
                  }}>
                    {t.diagnosticOptionLabel(letter)}
                  </span>

                  {/* Reveal country name after submission */}
                  {hasSubmitted && (
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: isSelected ? '#3fb950' : 'var(--text-secondary)',
                    }}>
                      👉 {p.country} ({p.source})
                    </span>
                  )}
                </div>

                {hasSubmitted && isSelected && (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#3fb950',
                  }}>
                    <CheckCircle2 size={15} />
                    {t.quizYourAnswer}
                  </span>
                )}
              </div>

              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: hasSubmitted && !isSelected ? 'rgba(255, 255, 255, 0.6)' : 'var(--foreground)',
              }}>
                {excerpt}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Diagnostic Result Breakdown (Revealed upon selection) ── */}
      {hasSubmitted && selectedPerspective && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.8rem',
            color: '#818cf8',
          }}>
            <Award size={20} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--foreground)' }}>
              {t.diagnosticResultTitle}
            </h4>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            marginBottom: '1.25rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#c7d2fe',
              lineHeight: 1.6,
            }}>
              {t.diagnosticResultMatch(selectedPerspective.country)}
            </p>
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginTop: '0.35rem',
            }}>
              {t.source}: {selectedPerspective.source}
            </p>
          </div>

          {/* Divergence insight */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h5 style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--foreground)',
              marginBottom: '0.6rem',
            }}>
              {t.diagnosticDivergenceTitle}
            </h5>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.6rem',
            }}>
              {currentPerspectives
                .filter((_, idx) => idx !== selectedIndex)
                .map((other, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
                      {other.country}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {other.content.trim().split('\n')[0].slice(0, 90)}…
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions & Share */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <Link
              href={eventHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              <GitCompare size={15} />
              <span>{t.diagnosticDeepDive}</span>
            </Link>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <Share2 size={13} />
                <span>{copied ? 'Copied! ✓' : t.diagnosticShare}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '20px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {t.quizTryAgain}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
