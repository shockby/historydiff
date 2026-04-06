import { getEventPerspectives, getAllEvents, getEventNotes } from '@/lib/markdown';
import EventPageClient from './EventPageClient';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateStaticParams() {
  const events = getAllEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const perspectives = getEventPerspectives(id);
  const title = perspectives[0]?.title || 'Event Details';
  
  return {
    title: `${title} | HistoryDiff`,
    description: `各国による「${title}」の記述内容を比較します。`,
  };
}

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const perspectives = getEventPerspectives(id);
  const notesData = getEventNotes(id);

  if (perspectives.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2>事象が見つかりませんでした</h2>
        <Link href="/" style={{ color: 'var(--accent)', marginTop: '2rem', display: 'inline-block' }}>ホームへ戻る</Link>
      </div>
    );
  }

  return <EventPageClient initialPerspectives={perspectives} notes={notesData?.notes || []} />;
}

