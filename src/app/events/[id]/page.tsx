import { getEventPerspectives, getAllEvents, getEventNotes, getEventPhotos, getEventVoices } from '@/lib/markdown';
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
  const title = (perspectives[0]?.title ?? getEventPerspectives(id, 'ja')[0]?.title) ?? 'Event Details';
  const description = `Compare history textbook descriptions and perspectives on "${title}" across nations.`;
  const ogImage = `/og/events/${id}-en.png`;

  return {
    title: `${title} | HistoryDiff`,
    description,
    openGraph: {
      title: `${title} | HistoryDiff`,
      description,
      url: `https://historydiff.pages.dev/events/${id}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | HistoryDiff`,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const perspectives = getEventPerspectives(id, 'en');
  const notes = getEventNotes(id, 'en');
  const photos = getEventPhotos(id);
  const voices = getEventVoices(id);

  return (
    <EventPageClient
      eventId={id}
      initialPerspectives={perspectives}
      initialNotes={notes}
      initialPhotos={photos}
      initialVoices={voices}
      lang="en"
    />
  );
}

