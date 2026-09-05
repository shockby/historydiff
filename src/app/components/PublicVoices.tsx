'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, AlertTriangle, MessageCircle, TrendingUp, Hash } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import { EventVoices, EventVoice, LocalizedText } from '@/lib/markdown';

interface PublicVoicesProps {
  voices: EventVoices;
  lang: Language;
  hideHeader?: boolean;
}

function getLocalizedText(text: LocalizedText, lang: Language): string {
  return text[lang] || text.en || text.ja || '';
}

const SENTIMENT_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  nationalist: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)', icon: '🔥' },
  critical:    { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', icon: '⚡' },
  neutral:     { color: '#8b949e', bg: 'rgba(139, 148, 158, 0.12)', border: 'rgba(139, 148, 158, 0.3)', icon: '⚖️' },
  academic:    { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', icon: '📚' },
  reconciliatory: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', icon: '🕊️' },
};

const PREVALENCE_CONFIG: Record<string, { width: string; dots: number }> = {
  high:   { width: '100%', dots: 3 },
  medium: { width: '60%',  dots: 2 },
  low:    { width: '30%',  dots: 1 },
};

function getSentimentLabel(sentiment: string, t: ReturnType<typeof getTranslations>): string {
  switch (sentiment) {
    case 'nationalist': return t.sentimentNationalist;
    case 'critical': return t.sentimentCritical;
    case 'neutral': return t.sentimentNeutral;
    case 'academic': return t.sentimentAcademic;
    case 'reconciliatory': return t.sentimentReconciliatory;
    default: return sentiment;
  }
}

function getPrevalenceLabel(prevalence: string, t: ReturnType<typeof getTranslations>): string {
  switch (prevalence) {
    case 'high': return t.prevalenceHigh;
    case 'medium': return t.prevalenceMedium;
    case 'low': return t.prevalenceLow;
    default: return prevalence;
  }
}

function getTranslations(lang: Language) {
  return translations[lang] || translations.en;
}

/* ── Sentiment Analysis Bar ── */

interface SentimentBarProps {
  voices: EventVoice[];
  lang: Language;
}

function SentimentBar({ voices, lang }: SentimentBarProps) {
  const t = getTranslations(lang);

  // Group by country
  const countriesMap = useMemo(() => {
    const map = new Map<string, EventVoice[]>();
    for (const voice of voices) {
      const country = getLocalizedText(voice.country, lang);
      if (!map.has(country)) map.set(country, []);
      map.get(country)!.push(voice);
    }
    return map;
  }, [voices, lang]);

  const sentimentTypes = ['nationalist', 'critical', 'neutral', 'academic', 'reconciliatory'];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <TrendingUp size={14} style={{ color: '#818cf8' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {t.sentimentOverview}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from(countriesMap.entries()).map(([country, countryVoices]) => {
          // Calculate weighted sentiment distribution
          const weightMap: Record<string, number> = {};
          const prevalenceWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };

          let total = 0;
          for (const v of countryVoices) {
            const w = prevalenceWeight[v.prevalence] || 1;
            weightMap[v.sentiment] = (weightMap[v.sentiment] || 0) + w;
            total += w;
          }

          return (
            <div key={country}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>{country}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {countryVoices.length} {countryVoices.length === 1 ? 'voice' : 'voices'}
                </span>
              </div>
              <div style={{
                display: 'flex',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.05)',
              }}>
                {sentimentTypes.map((st) => {
                  const pct = total > 0 ? ((weightMap[st] || 0) / total) * 100 : 0;
                  if (pct === 0) return null;
                  const cfg = SENTIMENT_CONFIG[st];
                  return (
                    <div
                      key={st}
                      title={`${getSentimentLabel(st, t)}: ${Math.round(pct)}%`}
                      style={{
                        width: `${pct}%`,
                        background: cfg.color,
                        transition: 'width 0.5s ease',
                        minWidth: pct > 0 ? '4px' : '0',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
        {sentimentTypes.map((st) => {
          const cfg = SENTIMENT_CONFIG[st];
          return (
            <div key={st} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '2px',
                background: cfg.color,
              }} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                {getSentimentLabel(st, t)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Voice Card ── */

function VoiceCard({ voice, lang }: { voice: EventVoice; lang: Language }) {
  const [expanded, setExpanded] = useState(false);
  const t = getTranslations(lang);
  const cfg = SENTIMENT_CONFIG[voice.sentiment] || SENTIMENT_CONFIG.neutral;
  const prevCfg = PREVALENCE_CONFIG[voice.prevalence] || PREVALENCE_CONFIG.low;
  const country = getLocalizedText(voice.country, lang);
  const summary = getLocalizedText(voice.summary, lang);
  const context = getLocalizedText(voice.context, lang);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Sentiment icon */}
        <div style={{
          minWidth: '32px', height: '32px', borderRadius: '8px',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0, marginTop: '2px',
        }}>
          {cfg.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Country + sentiment + prevalence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)',
            }}>
              {country}
            </span>
            <span style={{
              display: 'inline-block', padding: '1px 6px', borderRadius: '4px',
              fontSize: '0.65rem', fontWeight: 600,
              color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
            }}>
              {getSentimentLabel(voice.sentiment, t)}
            </span>
            <span style={{
              display: 'inline-block', padding: '1px 6px', borderRadius: '4px',
              fontSize: '0.65rem', fontWeight: 600,
              color: '#fbbf24', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)',
            }}>
              {t.publicVoicesSubjectiveTag}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.65rem', color: 'var(--text-secondary)',
            }}>
              {/* Prevalence dots */}
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: i < prevCfg.dots ? cfg.color : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s ease',
                }} />
              ))}
              <span style={{ marginLeft: '0.15rem' }}>{getPrevalenceLabel(voice.prevalence, t)}</span>
            </span>
          </div>

          {/* Summary text */}
          <p style={{
            fontSize: '0.85rem', color: 'var(--text-secondary)',
            lineHeight: 1.6, margin: 0,
          }}>
            {summary}
          </p>
        </div>

        <div style={{
          color: 'var(--text-secondary)', flexShrink: 0, marginTop: '4px',
          transition: 'transform 0.2s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <ChevronDown size={16} />
        </div>
      </button>

      {/* Expandable context */}
      <div style={{
        maxHeight: expanded ? '400px' : '0',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s ease, opacity 0.3s ease',
      }}>
        <div style={{
          padding: '0 1.25rem 1.25rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {/* Context */}
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{
              fontSize: '0.8rem', color: 'var(--text-secondary)',
              lineHeight: 1.7, fontStyle: 'italic',
            }}>
              {context}
            </p>
          </div>

          {/* Keywords / Hashtags */}
          {voice.keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
              {voice.keywords.map((kw, idx) => (
                <span key={idx} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                  padding: '2px 8px', borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.7rem', color: '#818cf8',
                }}>
                  <Hash size={10} />
                  {kw.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}

          {/* Timeframe */}
          <div style={{ marginTop: '0.6rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
            {voice.timeframe}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function PublicVoices({ voices, lang, hideHeader = false }: PublicVoicesProps) {
  const t = getTranslations(lang);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const disclaimer = getLocalizedText(voices.disclaimer, lang);

  // Get unique countries
  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const v of voices.voices) {
      set.add(getLocalizedText(v.country, lang));
    }
    return Array.from(set);
  }, [voices.voices, lang]);

  // Filter voices
  const filteredVoices = useMemo(() => {
    if (!selectedCountry) return voices.voices;
    return voices.voices.filter(v => getLocalizedText(v.country, lang) === selectedCountry);
  }, [voices.voices, selectedCountry, lang]);

  return (
    <section style={hideHeader ? { paddingTop: '1.25rem' } : { marginTop: '3rem' }}>
      {/* Section header */}
      {!hideHeader && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2))',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageCircle size={16} style={{ color: '#f97316' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)',
            }}>
              {t.publicVoicesTitle}
            </h3>
            <p style={{
              fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px',
            }}>
              {t.publicVoicesSubtitle}
            </p>
          </div>
          <div style={{
            marginLeft: 'auto',
            padding: '4px 10px', borderRadius: '12px',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            fontSize: '0.75rem', fontWeight: 600, color: '#f97316',
          }}>
            {t.voicesCount(voices.voices.length)}
          </div>
        </div>
      )}

      {/* Prominent Disclaimer banner */}
      <div style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(249, 115, 22, 0.08))',
        border: '1px solid rgba(234, 179, 8, 0.4)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <AlertTriangle size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fbbf24',
            letterSpacing: '0.01em',
          }}>
            {t.publicVoicesWarningTitle}
          </span>
        </div>
        <p style={{
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.85)',
          lineHeight: 1.6,
          margin: 0,
          paddingLeft: '1.75rem',
        }}>
          {disclaimer || t.publicVoicesWarningDetail}
        </p>
      </div>

      {/* Sentiment Analysis Bar */}
      <SentimentBar voices={voices.voices} lang={lang} />

      {/* Country filters */}
      <div style={{
        display: 'flex', gap: '0.4rem', marginBottom: '1rem',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        paddingBottom: '0.25rem',
      }}>
        <button
          onClick={() => setSelectedCountry(null)}
          style={{
            padding: '0.35rem 0.75rem', borderRadius: '20px',
            border: !selectedCountry ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255,255,255,0.1)',
            background: !selectedCountry ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.03)',
            color: !selectedCountry ? '#fff' : 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s ease',
          }}
        >
          {lang === 'ja' ? 'すべて' : lang === 'zh' ? '全部' : lang === 'ko' ? '전체' : 'All'}
        </button>
        {countries.map((country) => (
          <button
            key={country}
            onClick={() => setSelectedCountry(country)}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: '20px',
              border: selectedCountry === country ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255,255,255,0.1)',
              background: selectedCountry === country ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.03)',
              color: selectedCountry === country ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s ease',
            }}
          >
            {country}
          </button>
        ))}
      </div>

      {/* Voice cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredVoices.map((voice) => (
          <VoiceCard key={voice.id} voice={voice} lang={lang} />
        ))}
      </div>
    </section>
  );
}
