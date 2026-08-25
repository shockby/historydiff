'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { EventPerspective, EventNote, EventOngoing } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { extractStartYear } from '@/lib/sorting';
import TimelineView from './TimelineView';

// Dynamically import MapView, MiniDiffDemo, and InteractiveHub to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), { ssr: false });
const MiniDiffDemo = dynamic(() => import('./MiniDiffDemo'), { ssr: false });
const InteractiveHub = dynamic(() => import('./InteractiveHub'), { ssr: false });
import FeaturedEvents from './FeaturedEvents';

interface SearchEventsProps {
  initialEvents: {
    id: string;
    perspectives: EventPerspective[];
    imageUrl?: string;
    notes?: EventNote[];
    ongoing?: EventOngoing | null;
  }[];
  lang: string;
}

function SearchEventsInner({ initialEvents, lang }: SearchEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'chrono-asc' | 'chrono-desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'timeline'>('grid');
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;

  const events = initialEvents || [];

  // ── Collect all unique countries across events ──────────────────────────
  const allCountries: string[] = [];
  events.forEach((event) => {
    event.perspectives.forEach((p) => {
      if (p.country && !allCountries.includes(p.country)) {
        allCountries.push(p.country);
      }
    });
  });

  // Default: prefer '日本' (or 'Japan'), otherwise fall back to the first country
  const preferredDefault = allCountries.find(c => ['日本', 'Japan'].includes(c)) || (events[0]?.perspectives[0]?.country ?? '');
  const [selectedCountry, setSelectedCountry] = useState<string>(preferredDefault);

  // ── For a given event, pick the perspective for the selected country ────
  const getPerspective = (event: { perspectives: EventPerspective[] }): EventPerspective & { isMatch: boolean } => {
    const match = event.perspectives.find((p) => p.country === selectedCountry);
    if (match) return { ...match, isMatch: true };
    return { ...(event.perspectives[0]!), isMatch: false };
  };

  const filteredEvents = events.filter((event) => {
    const query = searchTerm.toLowerCase();
    const first = event.perspectives[0];
    if (!first) return false;
    return (
      first.title.toLowerCase().includes(query) ||
      first.category.toLowerCase().includes(query) ||
      event.perspectives.some((p) => p.country.toLowerCase().includes(query)) ||
      event.perspectives.some((p) => p.content.toLowerCase().includes(query))
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'default') {
      return 0;
    }
    const aFirst = a.perspectives[0];
    const bFirst = b.perspectives[0];
    if (!aFirst) return 1;
    if (!bFirst) return -1;
    const aYear = extractStartYear(aFirst.year);
    const bYear = extractStartYear(bFirst.year);
    if (sortBy === 'chrono-asc') {
      return aYear - bYear;
    } else {
      return bYear - aYear;
    }
  });

  const eventLink = (id: string) => activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`;

  // ── Perspective label ───────────────────────────────────────────────────
  const perspectiveBarLabel = activeLang === 'ja'
    ? '視点を選択'
    : activeLang === 'zh' ? '选择视角'
    : activeLang === 'ko' ? '관점 선택'
    : 'Select Perspective';

  const fallbackLabel = activeLang === 'ja'
    ? '（視点なし）'
    : activeLang === 'zh' ? '（无此视角）'
    : activeLang === 'ko' ? '（관점 없음）'
    : '(No perspective)';

  return (
    <>
      {/* Hero section */}
      <section style={{ padding: '3.5rem 0 2rem', textAlign: 'center' }}>
        <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {t.heroTitleLine1}<br />
          {t.heroTitleLine2}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
          {t.heroDesc}
        </p>
      </section>

      {/* Mini Diff Demo */}
      <MiniDiffDemo lang={lang} />

      {/* Featured Top 3 Contested Events */}
      <FeaturedEvents lang={lang} />

      {/* ── Ongoing Issues & Live Context Showcase ── */}
      {events.some((e) => e.ongoing?.isOngoing) && (
        <section style={{ marginTop: '4.5rem', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 10px #ef4444',
                  display: 'inline-block',
                }}
              />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                {t.ongoingSectionTitle}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              {t.ongoingSectionSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {events
              .filter((e) => e.ongoing?.isOngoing)
              .slice(0, 3)
              .map((event) => {
                const persp = event.perspectives[0];
                if (!persp) return null;
                const ongoing = event.ongoing!;
                const whyShort = (ongoing.whyItMatters[activeLang] ?? ongoing.whyItMatters.en) ?? ongoing.whyItMatters.ja ?? '';
                const watchShort = (ongoing.whatToWatchNext[activeLang] ?? ongoing.whatToWatchNext.en) ?? ongoing.whatToWatchNext.ja ?? '';
                const firstWatchPoint = watchShort.split('\n')[0] || '';

                return (
                  <Link href={eventLink(event.id)} key={event.id} style={{ textDecoration: 'none', display: 'flex' }}>
                    <div
                      className="card glass"
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05) 0%, rgba(18, 18, 24, 0.9) 100%)',
                        transition: 'all 0.22s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          ● {t.ongoingBadge}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {t.lastUpdated}: {ongoing.lastUpdated}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.8rem', color: '#fff', lineHeight: 1.35 }}>
                        {persp.title}
                      </h3>

                      {/* Why it matters preview */}
                      <p
                        style={{
                          fontSize: '0.86rem',
                          lineHeight: 1.65,
                          color: 'var(--text-secondary)',
                          marginBottom: '1.2rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {whyShort}
                      </p>

                      {/* Next Watch Point Preview */}
                      {firstWatchPoint && (
                        <div
                          style={{
                            marginTop: 'auto',
                            padding: '0.75rem 0.9rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            fontSize: '0.8rem',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                          }}
                        >
                          <span style={{ fontWeight: 700, flexShrink: 0 }}>🔮</span>
                          <span style={{ color: 'var(--foreground)', lineHeight: 1.4 }}>
                            {firstWatchPoint.replace(/^[0-9]+[.\-、]\s*/, '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      )}

      {/* Interactive Exploration Lab (Quiz & Perception Diagnostic) */}
      <InteractiveHub events={events} lang={lang} />

      {/* Archive section */}
      <section style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
            {t.comparisonArchive}
          </h2>
          {/* View mode toggles */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {([
              { mode: 'grid', icon: '▦', label: t.viewGrid },
              { mode: 'map', icon: '🌏', label: t.viewMap },
              { mode: 'timeline', icon: '📅', label: t.viewTimeline },
            ] as const).map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  border: viewMode === mode ? '1px solid var(--accent)' : '1px solid var(--card-border)',
                  background: viewMode === mode ? 'rgba(var(--accent-rgb, 139,92,246),0.15)' : 'rgba(255,255,255,0.03)',
                  color: viewMode === mode ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: viewMode === mode ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Perspective switcher pill bar ── */}
        {viewMode === 'grid' && allCountries.length > 1 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.9rem 1.2rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.03em',
            }}>
              {perspectiveBarLabel}:
            </span>
            <div style={{
              display: 'flex',
              gap: '0.4rem',
              flexWrap: 'wrap',
              flex: 1,
            }}>
              {allCountries.map((country) => {
                const isActive = country === selectedCountry;
                // How many events have this country's perspective?
                const coverCount = events.filter(e => e.perspectives.some(p => p.country === country)).length;
                return (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    title={`${coverCount} / ${events.length} events`}
                    style={{
                      padding: '0.3rem 0.85rem',
                      borderRadius: '20px',
                      border: isActive
                        ? '1px solid rgba(224,46,46,0.7)'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: isActive
                        ? 'rgba(224,46,46,0.18)'
                        : 'rgba(255,255,255,0.04)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.18s ease',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    {country}
                    <span style={{
                      fontSize: '0.68rem',
                      opacity: 0.55,
                      fontWeight: 400,
                    }}>
                      {coverCount}/{events.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + sort — only shown in grid and timeline modes */}
        {viewMode !== 'map' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {viewMode === 'grid' && (
              <div style={{ width: '240px' }}>
                <select
                  className="search-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'default' | 'chrono-asc' | 'chrono-desc')}
                  style={{
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.2em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="default" style={{ background: '#121216' }}>{t.sortDefault}</option>
                  <option value="chrono-asc" style={{ background: '#121216' }}>{t.sortChronologicalAsc}</option>
                  <option value="chrono-desc" style={{ background: '#121216' }}>{t.sortChronologicalDesc}</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Map mode: search bar for filtering */}
        {viewMode === 'map' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
              const { isMatch, ...persp } = getPerspective(event);
              return (
                <Link href={eventLink(event.id)} key={event.id} style={{ display: 'flex' }}>
                  <div
                    title={persp.title}
                    className="card glass"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      opacity: isMatch ? 1 : 0.6,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {event.imageUrl && (
                      <div className="card-image-container">
                        <img
                          src={event.imageUrl}
                          alt={persp.title}
                          loading="lazy"
                          className="card-image"
                        />
                      </div>
                    )}
                    <div className="card-content">
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Ongoing badge if active */}
                        {event.ongoing?.isOngoing && (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              border: '1px solid rgba(239, 68, 68, 0.45)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#ef4444',
                                display: 'inline-block',
                              }}
                            />
                            {t.ongoingBadge}
                          </span>
                        )}
                        {/* Perspective badge — highlight if matched */}
                        <span
                          className="badge"
                          style={isMatch ? {
                            background: 'rgba(224,46,46,0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(224,46,46,0.3)',
                          } : {
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                          }}
                        >
                          {isMatch ? persp.country : fallbackLabel}
                        </span>
                        <span className="badge">{persp.category}</span>
                        <span className="badge">{persp.year}</span>
                      </div>
                      <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>{persp.title}</h4>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {persp.content.slice(0, 150)}...
                      </p>
                      <div style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        borderTop: '1px solid var(--card-border)',
                        paddingTop: '1rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}>
                        <span>{t.compareTarget}</span>
                        <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                          {event.perspectives.map((p) => (
                            <span
                              key={p.country}
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: p.country === selectedCountry
                                  ? 'rgba(224,46,46,0.15)'
                                  : 'rgba(255,255,255,0.05)',
                                color: p.country === selectedCountry
                                  ? '#f87171'
                                  : 'inherit',
                                fontWeight: p.country === selectedCountry ? 600 : 400,
                              }}
                            >
                              {p.country}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              {t.noResults}
            </div>
          )}
        </div>
        )}

        {/* Map view */}
        {viewMode === 'map' && (
          <MapView events={filteredEvents} lang={lang} />
        )}

        {/* Timeline view */}
        {viewMode === 'timeline' && (
          <TimelineView events={filteredEvents} lang={lang} />
        )}
      </section>

      {/* About section */}
      <section id="about" className="glass" style={{ marginTop: '5rem', padding: '3rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 800, borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
          {t.aboutTitle}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', lineHeight: '1.8' }}>
          <div>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              {t.aboutText1}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {t.aboutText2}
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
              {t.aboutFeaturesTitle}
            </h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{t.aboutFeature1}</span>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{t.aboutFeature2}</span>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{t.aboutFeature3}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default function SearchEvents({ initialEvents, lang }: SearchEventsProps) {
  return (
    <div className="container">
      <Suspense fallback={
        <section style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            Visually unravelling the<br />
            &quot;differences in descriptions&quot; of history.
          </h1>
        </section>
      }>
        <SearchEventsInner initialEvents={initialEvents} lang={lang} />
      </Suspense>
    </div>
  );
}
