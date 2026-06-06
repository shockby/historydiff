import { getEventPerspectives, getAllEvents, getEventNotes, getEventPhotos } from '@/lib/markdown';
import EventPageClient from '@/app/events/[id]/EventPageClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const events = getAllEvents();
  const paths: { lang: string; id: string }[] = [];

  for (const lang of ['ja', 'zh', 'ko']) {
    for (const event of events) {
      paths.push({
        lang,
        id: event.id,
      });
    }
  }

  return paths;
}

interface PageProps {
  params: Promise<{ id: string; lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, lang } = await params;
  const perspectives = getEventPerspectives(id, lang);
  const title = perspectives[0]?.title || 'Event Details';
  
  return {
    title: `${title} - HistoryDiff`,
    description: `Compare different historical perspectives on ${title}.`,
  };
}

export default async function LocalizedEventPage({ params }: PageProps) {
  const { id, lang } = await params;

  const perspectives = getEventPerspectives(id, lang);
  const notes = getEventNotes(id, lang);
  const photos = getEventPhotos(id);

  return (
    <EventPageClient
      eventId={id}
      initialPerspectives={perspectives}
      initialNotes={notes}
      initialPhotos={photos}
      lang={lang}
    />
  );
}
