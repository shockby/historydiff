import { getAllEvents, getEventPerspectives } from '@/lib/markdown';
import Link from 'next/link';

export default function Home() {
  const events = getAllEvents();

  return (
    <div className="container">
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          歴史の「記述の差」を、<br />
          視覚的に解明する。
        </h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
          同じ歴史的事象でも、国や地域が異なれば、教科書に記載される内容は大きく異なります。
          HistoriDiffは、その「認識の差」をテキストの差分（Diff）として浮き彫りにするためのプラットフォームです。
        </p>
      </section>

      <section style={{ marginTop: '4rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
          最新の比較アーカイブ
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {events.map((event) => {
            const perspectives = getEventPerspectives(event.id);
            const first = perspectives[0];
            
            return (
              <Link href={`/events/${event.id}`} key={event.id}>
                <div title={first.title} className="card glass">
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span className="badge">{first.category}</span>
                    <span className="badge">{first.year}</span>
                    <span className="badge">{first.location}</span>
                  </div>
                  <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>{first.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {first.content.slice(0, 150)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>比較対象:</span>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      {perspectives.map(p => (
                        <span key={p.country} style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                          {p.country}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
