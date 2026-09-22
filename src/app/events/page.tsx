import { Metadata } from 'next';
import { getAllEvents, getEventPerspectives, getEventPhotos, getEventOngoing, getEventNotes } from '@/lib/markdown';
import { generateWebSiteSchema, generateItemListSchema, SITE_URL } from '@/lib/schema';
import EventsArchive from '@/app/components/EventsArchive';

export const metadata: Metadata = {
  title: 'Comparison Archives | HistoryDiff',
  description: 'Explore and compare differing historical narratives and textbook descriptions from nations worldwide.',
  alternates: {
    canonical: `${SITE_URL}/events`,
    languages: {
      en: `${SITE_URL}/events`,
      ja: `${SITE_URL}/ja/events`,
      zh: `${SITE_URL}/zh/events`,
      ko: `${SITE_URL}/ko/events`,
      'x-default': `${SITE_URL}/events`,
    },
  },
  openGraph: {
    title: 'Comparison Archives | HistoryDiff',
    description: 'Explore and compare differing historical narratives from textbooks worldwide.',
    url: `${SITE_URL}/events`,
    type: 'website',
  },
};

export default function EventsPage() {
  const eventIds = getAllEvents();

  const events = eventIds
    .map((event) => {
      const photos = getEventPhotos(event.id);
      const imageUrl = photos && photos.photos.length > 0 ? photos.photos[0].url : undefined;
      const notesData = getEventNotes(event.id, 'en');
      const ongoing = getEventOngoing(event.id);
      return {
        id: event.id,
        perspectives: getEventPerspectives(event.id, 'en'),
        imageUrl,
        notes: notesData?.notes ?? [],
        ongoing,
      };
    })
    .filter((e) => e.perspectives.length > 0);

  const websiteSchema = generateWebSiteSchema('en');

  const eventListForSchema = events.map((e) => ({
    id: e.id,
    title: e.perspectives[0]?.title ?? e.id,
  }));
  const itemListSchema = generateItemListSchema({ lang: 'en', events: eventListForSchema });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <EventsArchive initialEvents={events} lang="en" />
    </>
  );
}
