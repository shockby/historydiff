'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EventPerspective, EventNote } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { extractStartYear } from '@/lib/sorting';

interface TimelineViewProps {
  events: { id: string; perspectives: EventPerspective[]; imageUrl?: string; notes?: EventNote[] }[];
  lang: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  '侵略・虐殺': '#ef4444',
  '領土問題・主権': '#f97316',
  '戦時人権問題・歴史認識問題': '#eab308',
  '政治・社会運動': '#8b5cf6',
  '安全保障': '#3b82f6',
  '環境・科学': '#22c55e',
  '戦争・紛争': '#ef4444',
  'Invasion/Massacre': '#ef4444',
  'Territory/Sovereignty': '#f97316',
  'Wartime Human Rights': '#eab308',
  'Political/Social Movement': '#8b5cf6',
  'Security': '#3b82f6',
  'War': '#ef4444',
  'Environment/Science': '#22c55e',
};

function getCategoryColor(category: string): string {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return color;
    }
  }
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

// verdict文字列からアイコン・色を判定
function getVerdictStyle(verdict: string): { icon: string; color: string; bg: string } {
  const v = verdict.toLowerCase();
  if (v.includes('公式記録') || v.includes('official') || v.includes('confirmed') || v.includes('事実')) {
    return { icon: '✓', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
  }
  if (v.includes('議論') || v.includes('dispute') || v.includes('disagreement') || v.includes('差異') || v.includes('調査')) {
    return { icon: '⚖', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  }
  if (v.includes('否定') || v.includes('deny') || v.includes('disputed')) {
    return { icon: '✗', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
  }
  return { icon: '📋', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' };
}

interface AnnotationPanelProps {
  notes: EventNote[];
  lang: string;
  color: string;
}

function AnnotationPanel({ notes, lang, color }: AnnotationPanelProps) {
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const t = translations[lang as Language] || translations.en;

  const labelAnnotations = lang === 'ja' ? '注釈' : lang === 'zh' ? '注释' : lang === 'ko' ? '주석' : 'Notes';

  return (
    <div style={{
      marginTop: '0.6rem',
      borderTop: `1px dashed ${color}44`,
      paddingTop: '0.6rem',
    }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '0.65rem', color: color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          📌 {labelAnnotations}
        </span>
        <span style={{
          fontSize: '0.6rem',
          padding: '1px 6px',
          borderRadius: '10px',
          background: `${color}22`,
          color: color,
          fontWeight: 600,
        }}>
          {notes.length}
        </span>
      </div>

      {/* ノートリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {notes.map((note) => {
          const isOpen = openNoteId === note.id;
          const vs = getVerdictStyle(note.verdict);

          return (
            <div key={note.id}>
              {/* クリック可能な行 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenNoteId(isOpen ? null : note.id);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  border: `1px solid ${isOpen ? color + '55' : 'rgba(255,255,255,0.06)'}`,
                  background: isOpen ? `${color}0d` : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}44`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }
                }}
              >
                {/* verdict icon */}
                <span style={{
                  flexShrink: 0,
                  fontSize: '0.7rem',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: vs.bg,
                  color: vs.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  marginTop: '1px',
                }}>
                  {vs.icon}
                </span>

                {/* claim text */}
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  flex: 1,
                }}>
                  {note.claim}
                </span>

                {/* chevron */}
                <span style={{
                  flexShrink: 0,
                  fontSize: '0.6rem',
                  color: 'var(--text-secondary)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease',
                  marginTop: '2px',
                }}>
                  ▼
                </span>
              </button>

              {/* 展開パネル */}
              {isOpen && (
                <div
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  style={{
                    margin: '0.25rem 0 0.25rem 1.6rem',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}33`,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  {/* verdict badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: vs.bg,
                    marginBottom: '0.5rem',
                  }}>
                    <span style={{ fontSize: '0.65rem', color: vs.color, fontWeight: 700 }}>
                      {t.verdictLabel}: {note.verdict}
                    </span>
                  </div>

                  {/* context */}
                  <p style={{
                    fontSize: '0.73rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: '0 0 0.6rem 0',
                  }}>
                    {note.context}
                  </p>

                  {/* sources */}
                  {note.sources.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {note.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '0.65rem',
                            color: color,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span>🔗</span>
                          <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                            {src.title}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                            — {src.publisher}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimelineView({ events, lang }: TimelineViewProps) {
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;

  const eventLink = (id: string) =>
    activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`;

  // Sort chronologically
  const sorted = [...events].sort((a, b) => {
    const aYear = extractStartYear(a.perspectives[0]?.year ?? '');
    const bYear = extractStartYear(b.perspectives[0]?.year ?? '');
    return aYear - bYear;
  });

  // Group by decade
  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, event) => {
    const year = extractStartYear(event.perspectives[0]?.year ?? '');
    const decade = isNaN(year) ? '?' : `${Math.floor(year / 10) * 10}s`;
    if (!acc[decade]) acc[decade] = [];
    acc[decade].push(event);
    return acc;
  }, {});

  const decades = Object.keys(grouped).sort((a, b) => {
    if (a === '?') return 1;
    if (b === '?') return -1;
    return parseInt(a) - parseInt(b);
  });

  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        width: '2px',
        background: 'linear-gradient(to bottom, var(--accent), transparent)',
        borderRadius: '2px',
      }} />

      {decades.map((decade) => (
        <div key={decade} style={{ marginBottom: '3rem' }}>
          {/* Decade label */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              position: 'absolute',
              left: '-6px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--bg-primary)',
              boxShadow: '0 0 12px var(--accent)',
            }} />
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--accent)',
              paddingLeft: '1rem',
              letterSpacing: '0.05em',
            }}>
              {decade}
            </span>
          </div>

          {/* Events in this decade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1rem' }}>
            {grouped[decade].map((event) => {
              const first = event.perspectives[0];
              if (!first) return null;
              const color = getCategoryColor(first.category);
              const hasNotes = event.notes && event.notes.length > 0;

              return (
                <div key={event.id}>
                  <Link
                    href={eventLink(event.id)}
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <div
                      className="glass"
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        padding: '1.2rem 1.5rem',
                        borderRadius: hasNotes ? '12px 12px 0 0' : '12px',
                        border: '1px solid var(--card-border)',
                        borderLeft: `3px solid ${color}`,
                        borderBottom: hasNotes ? 'none' : undefined,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(6px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${color}33`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                      }}
                    >
                      {/* Thumbnail */}
                      {event.imageUrl && (
                        <div style={{
                          flexShrink: 0,
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}>
                          <img
                            src={event.imageUrl}
                            alt={first.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: `${color}22`,
                            color: color,
                            fontWeight: 600,
                          }}>
                            {first.category}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.07)',
                            color: 'var(--text-secondary)',
                          }}>
                            {first.year}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.07)',
                            color: 'var(--text-secondary)',
                          }}>
                            📍 {first.location}
                          </span>
                          {hasNotes && (
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(251,191,36,0.12)',
                              color: '#fbbf24',
                              fontWeight: 600,
                            }}>
                              📌 {event.notes!.length} {activeLang === 'ja' ? '注釈' : activeLang === 'zh' ? '注释' : activeLang === 'ko' ? '주석' : 'notes'}
                            </span>
                          )}
                        </div>
                        <h3 style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          marginBottom: '0.3rem',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {first.title}
                        </h3>
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          margin: 0,
                        }}>
                          {first.content.slice(0, 120)}...
                        </p>
                      </div>

                      {/* Countries */}
                      <div style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}>
                        {event.perspectives.map((p) => (
                          <span key={p.country} style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                          }}>
                            {p.country}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>

                  {/* Annotation panel — rendered outside the Link to avoid nested interactive elements */}
                  {hasNotes && (
                    <div
                      className="glass"
                      style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '0 0 12px 12px',
                        border: '1px solid var(--card-border)',
                        borderLeft: `3px solid ${color}`,
                        borderTop: `1px dashed ${color}33`,
                        background: 'rgba(0,0,0,0.15)',
                      }}
                    >
                      <AnnotationPanel notes={event.notes!} lang={lang} color={color} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
