import { getAllEvents, getEventPerspectives } from '@/lib/markdown';
import SearchEvents from './components/SearchEvents';

export default function Home() {
  const eventIds = getAllEvents();
  
  // Fetch full data for each event to enable search
  const eventsWithData = eventIds.map((event) => ({
    id: event.id,
    perspectives: getEventPerspectives(event.id),
  }));

  return (
    <div className="container">
      <section style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          歴史の「記述の差」を、<br />
          視覚的に解明する。
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
          同じ歴史的事象でも、国や地域が異なれば、教科書に記載される内容は大きく異なります。
          HistoryDiffは、その「認識の差」をテキストの比較（Diff）によって浮き彫りにするためのプラットフォームです。
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>
            比較アーカイブ
          </h2>
        </div>
        
        <SearchEvents initialEvents={eventsWithData} />
      </section>
    </div>
  );
}
