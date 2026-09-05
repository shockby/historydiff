'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LayoutGrid, Globe, Calendar, Search, Layers } from 'lucide-react';
import { EventPerspective, EventNote, EventOngoing } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { extractStartYear } from '@/lib/sorting';
import TimelineView from './TimelineView';
import Pagination from './Pagination';

// Clean markdown markup and format excerpt cleanly
function cleanExcerpt(text: string, maxLength: number = 110): string {
  const stripped = text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + '...';
}

// Dynamically import MapView, MiniDiffDemo, InteractiveHub, and WelcomeModal to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), { ssr: false });
const MiniDiffDemo = dynamic(() => import('./MiniDiffDemo'), { ssr: false });
const InteractiveHub = dynamic(() => import('./InteractiveHub'), { ssr: false });
const WelcomeModal = dynamic(() => import('./WelcomeModal'), { ssr: false });

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

  // ── Collect all unique valid countries across events ────────────────────
  const isTheory = (name: string) => /説|theory|论|学说|事故/i.test(name);

  const countryCounts: Record<string, number> = {};
  events.forEach((event) => {
    event.perspectives.forEach((p) => {
      if (p.country && !isTheory(p.country)) {
        countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
      }
    });
  });

  const sortedCountries = Object.keys(countryCounts).sort((a, b) => (countryCounts[b] ?? 0) - (countryCounts[a] ?? 0));
  const PINNED_THRESHOLD = 3;
  const pinnedCountries = sortedCountries.filter((c) => (countryCounts[c] ?? 0) >= PINNED_THRESHOLD).slice(0, 7);
  const otherCountries = sortedCountries.filter((c) => !pinnedCountries.includes(c));

  // Default: prefer '日本' (or 'Japan') based on lang rule, otherwise fall back to first pinned
  const preferredDefault = activeLang === 'ja'
    ? (sortedCountries.find(c => c === '日本') || 'all')
    : activeLang === 'ko'
    ? (sortedCountries.find(c => c === '한국') || sortedCountries.find(c => c === '일본') || 'all')
    : (sortedCountries.find(c => ['Japan', '日本', '중국', 'China'].includes(c)) || 'all');

  const [selectedCountry, setSelectedCountry] = useState<string>(preferredDefault);

  // ── For a given event, pick the perspective for the selected country ────
  const getPerspective = (event: { perspectives: EventPerspective[] }): EventPerspective & { isMatch: boolean } => {
    if (selectedCountry === 'all') {
      const jaPref = activeLang === 'ja' ? event.perspectives.find(p => p.country === '日本') : undefined;
      return { ...(jaPref ?? event.perspectives[0]!), isMatch: true };
    }
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

  // ── Pagination logic (Kaminari-style: 10 items per page) ────────────────
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountry, sortBy]);

  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedEvents = sortedEvents.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

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
      {/* Welcome & Onboarding Modal for first-time visitors */}
      <WelcomeModal lang={lang} />

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

      {/* ── Ongoing Issues & Live Context Showcase ── */}
      {events.some((e) => e.ongoing?.isOngoing) && (
        <section style={{ marginTop: '3rem', marginBottom: '2.5rem' }}>
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
                          <span style={{ fontWeight: 700, flexShrink: 0, color: '#f87171' }}>⚡</span>
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
      <section id="events-archive-section" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
            {t.comparisonArchive}
          </h2>
          {/* View mode toggles */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {([
              { mode: 'grid', Icon: LayoutGrid, label: t.viewGrid },
              { mode: 'map', Icon: Globe, label: t.viewMap },
              { mode: 'timeline', Icon: Calendar, label: t.viewTimeline },
            ] as const).map(({ mode, Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
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
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Perspective switcher pill bar ── */}
        {viewMode === 'grid' && sortedCountries.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1.1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
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
              gap: '0.35rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              flex: 1,
            }}>
              {/* "All" button */}
              <button
                type="button"
                onClick={() => setSelectedCountry('all')}
                style={{
                  padding: '0.3rem 0.85rem',
                  borderRadius: '20px',
                  border: selectedCountry === 'all'
                    ? '1px solid rgba(224,46,46,0.7)'
                    : '1px solid rgba(255,255,255,0.1)',
                  background: selectedCountry === 'all'
                    ? 'rgba(224,46,46,0.18)'
                    : 'rgba(255,255,255,0.04)',
                  color: selectedCountry === 'all' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: selectedCountry === 'all' ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease',
                  outline: 'none',
                }}
              >
                {t.allPerspectives}
              </button>

              {/* Pinned major country pills */}
              {pinnedCountries.map((country) => {
                const isActive = country === selectedCountry;
                const coverCount = countryCounts[country] || 0;
                return (
                  <button
                    key={country}
                    type="button"
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
                  >
                    <span>{country}</span>
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

              {/* "Other Perspectives" dropdown selector */}
              {otherCountries.length > 0 && (
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <select
                    value={otherCountries.includes(selectedCountry) ? selectedCountry : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedCountry(e.target.value);
                      }
                    }}
                    style={{
                      padding: '0.3rem 2rem 0.3rem 0.85rem',
                      borderRadius: '20px',
                      border: otherCountries.includes(selectedCountry)
                        ? '1px solid rgba(224,46,46,0.7)'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: otherCountries.includes(selectedCountry)
                        ? 'rgba(224,46,46,0.18)'
                        : 'rgba(255,255,255,0.04)',
                      color: otherCountries.includes(selectedCountry) ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: otherCountries.includes(selectedCountry) ? 700 : 500,
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.6rem center',
                      backgroundSize: '0.9em',
                    }}
                  >
                    <option value="" style={{ background: '#121216', color: '#a1a1aa' }}>
                      {otherCountries.includes(selectedCountry)
                        ? `${selectedCountry} (${countryCounts[selectedCountry] ?? 0}/${events.length})`
                        : `${t.otherPerspectives} (+${otherCountries.length})`}
                    </option>
                    {otherCountries.map((country) => (
                      <option key={country} value={country} style={{ background: '#121216', color: '#fff' }}>
                        {country} ({countryCounts[country] ?? 0}/{events.length})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search + sort — only shown in grid and timeline modes */}
        {viewMode !== 'map' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.8rem' }}
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
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1.1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.8rem' }}
              />
            </div>
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => {
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
                        transition: 'all 0.2s ease',
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
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {/* Ongoing badge if active */}
                          {event.ongoing?.isOngoing && (
                            <span
                              className="badge"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.6rem',
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
                              background: 'rgba(224,46,46,0.14)',
                              color: '#f87171',
                              border: '1px solid rgba(224,46,46,0.3)',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.65rem',
                            } : {
                              background: 'rgba(255,255,255,0.04)',
                              color: 'var(--text-secondary)',
                              fontStyle: 'italic',
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.65rem',
                            }}
                          >
                            {isMatch ? persp.country : fallbackLabel}
                          </span>
                          <span className="badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {persp.category}
                          </span>
                          <span className="badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} style={{ opacity: 0.7 }} />
                            {persp.year}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.6rem' }}>
                          {persp.title}
                        </h4>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          lineHeight: 1.55,
                          marginBottom: '1.1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {cleanExcerpt(persp.content, 110)}
                        </p>
                        <div style={{
                          marginTop: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          paddingTop: '0.75rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          gap: '0.5rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                            <Layers size={13} style={{ opacity: 0.7 }} />
                            <span>{t.compareTarget}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {event.perspectives.map((p) => (
                              <span
                                key={p.country}
                                style={{
                                  padding: '2px 7px',
                                  borderRadius: '10px',
                                  fontSize: '0.72rem',
                                  background: p.country === selectedCountry
                                    ? 'rgba(224,46,46,0.18)'
                                    : 'rgba(255,255,255,0.04)',
                                  color: p.country === selectedCountry
                                    ? '#f87171'
                                    : 'var(--text-secondary)',
                                  border: p.country === selectedCountry
                                    ? '1px solid rgba(224,46,46,0.35)'
                                    : '1px solid rgba(255,255,255,0.06)',
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

            {/* Pagination controls */}
            {sortedEvents.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={sortedEvents.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  const el = document.getElementById('events-archive-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                lang={activeLang}
              />
            )}
          </>
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
