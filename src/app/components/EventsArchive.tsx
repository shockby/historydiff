'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LayoutGrid, Globe, Calendar, Search, Layers, ChevronRight, Home as HomeIcon } from 'lucide-react';
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

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), { ssr: false });

export interface EventsArchiveProps {
  initialEvents: {
    id: string;
    perspectives: EventPerspective[];
    imageUrl?: string;
    notes?: EventNote[];
    ongoing?: EventOngoing | null;
    searchKeywords?: string[];
  }[];
  lang: string;
}

function EventsArchiveInner({ initialEvents, lang }: EventsArchiveProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'default' | 'chrono-asc' | 'chrono-desc'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'timeline'>('grid');
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [searchParams]);

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
    if (!query) return true;
    if (event.perspectives.length === 0) return false;
    // Check pre-computed cross-language keywords (title/category from all languages)
    if (event.searchKeywords?.some((kw) => kw.includes(query))) return true;
    return (
      event.perspectives.some((p) => p.title.toLowerCase().includes(query)) ||
      event.perspectives.some((p) => p.category.toLowerCase().includes(query)) ||
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

  // ── Pagination logic (12 items per page) ────────────────
  const ITEMS_PER_PAGE = 12;
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

  const homeLink = activeLang === 'en' ? '/' : `/${activeLang}`;
  const eventLink = (id: string) => activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`;

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
    <div className="section-full section-white" style={{ minHeight: '80vh', padding: '1rem 0 4rem' }}>
      <div className="container">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link href={homeLink} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
            <HomeIcon size={14} />
            <span>{t.breadcrumbHome}</span>
          </Link>
          <ChevronRight size={14} style={{ opacity: 0.5 }} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{t.breadcrumbArchive}</span>
        </nav>

        {/* Page Title Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.6rem' }}>
            {t.archivePageTitle}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '800px', lineHeight: 1.6 }}>
            {t.archivePageSubtitle}
          </p>
        </div>

        {/* Archive Toolbar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {sortedEvents.length} {t.comparisonArchive}
          </div>
          {/* View mode toggles */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
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
                  border: 'none',
                  background: viewMode === mode ? '#ffffff' : 'transparent',
                  color: viewMode === mode ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: viewMode === mode ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
        {viewMode !== 'map' && sortedCountries.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            background: '#f8fafc',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
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
                  padding: '0.35rem 0.9rem',
                  borderRadius: '20px',
                  border: selectedCountry === 'all'
                    ? '1px solid var(--accent)'
                    : '1px solid var(--card-border)',
                  background: selectedCountry === 'all'
                    ? 'rgba(220, 38, 38, 0.1)'
                    : '#ffffff',
                  color: selectedCountry === 'all' ? 'var(--accent)' : 'var(--text-secondary)',
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
                      padding: '0.35rem 0.9rem',
                      borderRadius: '20px',
                      border: isActive
                        ? '1px solid var(--accent)'
                        : '1px solid var(--card-border)',
                      background: isActive
                        ? 'rgba(220, 38, 38, 0.1)'
                        : '#ffffff',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
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
                      opacity: 0.65,
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
                      padding: '0.35rem 2rem 0.35rem 0.9rem',
                      borderRadius: '20px',
                      border: otherCountries.includes(selectedCountry)
                        ? '1px solid var(--accent)'
                        : '1px solid var(--card-border)',
                      background: otherCountries.includes(selectedCountry)
                        ? 'rgba(220, 38, 38, 0.1)'
                        : '#ffffff',
                      color: otherCountries.includes(selectedCountry) ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: otherCountries.includes(selectedCountry) ? 700 : 500,
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.6rem center',
                      backgroundSize: '0.9em',
                    }}
                  >
                    <option value="" style={{ background: '#ffffff', color: '#64748b' }}>
                      {otherCountries.includes(selectedCountry)
                        ? `${selectedCountry} (${countryCounts[selectedCountry] ?? 0}/${events.length})`
                        : `${t.otherPerspectives} (+${otherCountries.length})`}
                    </option>
                    {otherCountries.map((country) => (
                      <option key={country} value={country} style={{ background: '#ffffff', color: '#0f172a' }}>
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
                    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.2em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="default" style={{ background: '#ffffff', color: '#0f172a' }}>{t.sortDefault}</option>
                  <option value="chrono-asc" style={{ background: '#ffffff', color: '#0f172a' }}>{t.sortChronologicalAsc}</option>
                  <option value="chrono-desc" style={{ background: '#ffffff', color: '#0f172a' }}>{t.sortChronologicalDesc}</option>
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
                        className="card"
                        style={{
                          padding: 0,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          opacity: isMatch ? 1 : 0.65,
                          transition: 'all 0.2s ease',
                          background: '#ffffff',
                          border: '1px solid var(--card-border)',
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
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#dc2626',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
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
                                background: 'rgba(220, 38, 38, 0.08)',
                                color: 'var(--accent)',
                                border: '1px solid rgba(220, 38, 38, 0.3)',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.65rem',
                              } : {
                                background: '#f1f5f9',
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
                          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.6rem', color: 'var(--foreground)' }}>
                            {persp.title}
                          </h2>
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
                            borderTop: '1px solid var(--card-border)',
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
                                      ? 'rgba(220, 38, 38, 0.1)'
                                      : '#f1f5f9',
                                    color: p.country === selectedCountry
                                      ? 'var(--accent)'
                                      : 'var(--text-secondary)',
                                    border: p.country === selectedCountry
                                      ? '1px solid rgba(220, 38, 38, 0.3)'
                                      : '1px solid var(--card-border)',
                                    fontWeight: p.country === selectedCountry ? 700 : 400,
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
                  window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <TimelineView events={filteredEvents} lang={lang} selectedCountry={selectedCountry} />
        )}
      </div>
    </div>
  );
}

export default function EventsArchive({ initialEvents, lang }: EventsArchiveProps) {
  return (
    <Suspense fallback={
      <div className="section-full section-white" style={{ minHeight: '80vh', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Loading Archives...</h1>
        </div>
      </div>
    }>
      <EventsArchiveInner initialEvents={initialEvents} lang={lang} />
    </Suspense>
  );
}
