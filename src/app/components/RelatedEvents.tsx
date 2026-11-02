'use client';

import Link from 'next/link';
import { Link2, ArrowRight } from 'lucide-react';
import { RelatedEvent } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';

interface RelatedEventsProps {
  events: RelatedEvent[];
  lang: Language;
}

export default function RelatedEvents({ events, lang }: RelatedEventsProps) {
  const t = translations[lang] || translations.en;
  const prefix = lang === 'en' ? '' : `/${lang}`;

  return (
    <section
      aria-labelledby="related-events-title"
      style={{ margin: '1.5rem 0', padding: '1rem 1.25rem', border: '1px solid var(--card-border)', borderRadius: '12px' }}
    >
      <h2
        id="related-events-title"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', margin: 0 }}
      >
        <Link2 size={18} aria-hidden="true" />
        {t.relatedEventsTitle}
      </h2>
      <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.relatedEventsSubtitle}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.6rem' }}>
        {events.map((ev) => (
          <li key={ev.id}>
            <Link
              href={`${prefix}/events/${ev.id}`}
              style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {ev.title}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            {ev.relation && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{ev.relation}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
