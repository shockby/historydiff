'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EventPerspective } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { extractStartYear } from '@/lib/sorting';

interface SearchEventsProps {
  initialEvents: { id: string; perspectives: EventPerspective[] }[];
  lang: string;
}

function SearchEventsInner({ initialEvents, lang }: SearchEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'chrono-asc' | 'chrono-desc'>('default');
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;

  const events = initialEvents || [];

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

  return (
    <>
      {/* Hero section */}
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          {t.heroTitleLine1}<br />
          {t.heroTitleLine2}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
          {t.heroDesc}
        </p>
      </section>

      {/* Archive section */}
      <section style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
            {t.comparisonArchive}
          </h2>
        </div>

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
          <div style={{ width: '240px' }}>
            <select
              className="search-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
              const first = event.perspectives[0];
              return (
                <Link href={eventLink(event.id)} key={event.id}>
                  <div title={first.title} className="card glass">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span className="badge">{first.category}</span>
                      <span className="badge">{first.year}</span>
                      <span className="badge">{first.location}</span>
                    </div>
                    <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>{first.title}</h4>
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
                      {first.content.slice(0, 150)}...
                    </p>
                    <div style={{
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
                          <span key={p.country} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                            {p.country}
                          </span>
                        ))}
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
