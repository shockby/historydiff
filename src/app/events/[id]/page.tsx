import { getEventPerspectives, getAllEvents, getEventNotes } from '@/lib/markdown';
import EventPageClient from './EventPageClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const events = getAllEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  // Use English as canonical metadata
  const perspectives = getEventPerspectives(id, 'en');
  const title = perspectives[0]?.title || getEventPerspectives(id, 'ja')[0]?.title || 'Event Details';

  return {
    title: `${title} | HistoryDiff`,
    description: `Compare textbook descriptions of "${title}" across countries.`,
  };
}

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // Load all languages at build time for static export compatibility
  const perspectivesAllLangs: Record<string, ReturnType<typeof getEventPerspectives>> = {};
  const notesAllLangs: Record<string, ReturnType<typeof getEventNotes>> = {};

  for (const lang of ['en', 'ja', 'zh']) {
    perspectivesAllLangs[lang] = getEventPerspectives(id, lang);
    notesAllLangs[lang] = getEventNotes(id, lang);
  }

  return (
    <EventPageClient
      perspectivesAllLangs={perspectivesAllLangs}
      notesAllLangs={notesAllLangs}
    />
  );
}
