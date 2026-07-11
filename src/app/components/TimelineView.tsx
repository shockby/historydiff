'use client';

import Link from 'next/link';
import { EventPerspective } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { extractStartYear } from '@/lib/sorting';

interface TimelineViewProps {
  events: { id: string; perspectives: EventPerspective[]; imageUrl?: string }[];
  lang: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  '侵略・虐殺': '#ef4444',
  '領土問題・主権': '#f97316',
  '戦時人権問題・歴史認識問題': '#eab308',
  '政治・社会運動': '#8b5cf6',
  '安全保障': '#3b82f6',
  '環境・科学': '#22c55e',
  'Invasion/Massacre': '#ef4444',
  'Territory/Sovereignty': '#f97316',
  'Wartime Human Rights': '#eab308',
  'Political/Social Movement': '#8b5cf6',
  'Security': '#3b82f6',
  'Environment/Science': '#22c55e',
};

function getCategoryColor(category: string): string {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return color;
    }
  }
  // Hash-based fallback color
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
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

              return (
                <Link
                  key={event.id}
                  href={eventLink(event.id)}
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  <div
                    className="glass"
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      padding: '1.2rem 1.5rem',
                      borderRadius: '12px',
                      border: '1px solid var(--card-border)',
                      borderLeft: `3px solid ${color}`,
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
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
