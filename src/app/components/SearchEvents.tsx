'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EventPerspective } from '@/lib/markdown';

interface SearchEventsProps {
  initialEvents: {
    id: string;
    perspectives: EventPerspective[];
  }[];
}

export default function SearchEvents({ initialEvents }: SearchEventsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = initialEvents.filter((event) => {
    const query = searchTerm.toLowerCase();
    const first = event.perspectives[0];
    
    // Search in title, category, and country names
    return (
      first.title.toLowerCase().includes(query) ||
      first.category.toLowerCase().includes(query) ||
      event.perspectives.some(p => p.country.toLowerCase().includes(query)) ||
      event.perspectives.some(p => p.content.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="search-container" style={{ marginBottom: '3rem' }}>
        <input
          type="text"
          className="search-input"
          placeholder="事象、国、キーワードで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const first = event.perspectives[0];
            
            return (
              <Link href={`/events/${event.id}`} key={event.id}>
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
                    WebkitBoxOrient: 'vertical'
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
                    color: 'var(--text-secondary)'
                  }}>
                    <span>比較対象:</span>
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                      {event.perspectives.map(p => (
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
            一致する結果が見つかりませんでした。
          </div>
        )}
      </div>
    </>
  );
}
