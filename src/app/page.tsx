import { getAllEvents, getEventPerspectives, getEventPhotos, getEventOngoing } from '@/lib/markdown';
import { generateWebSiteSchema, generateItemListSchema, SITE_URL } from '@/lib/schema';
import SearchEvents from './components/SearchEvents';
import LanguageRedirect from './components/LanguageRedirect';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: SITE_URL,
      ja: `${SITE_URL}/ja`,
      zh: `${SITE_URL}/zh`,
      ko: `${SITE_URL}/ko`,
      'x-default': SITE_URL,
    },
  },
};

export default function Home() {
  const eventIds = getAllEvents();

  // Fetch only English event data for the default root path
  const events = eventIds
    .map((event) => {
      const photos = getEventPhotos(event.id);
      const imageUrl = photos && photos.photos.length > 0 ? photos.photos[0].url : undefined;
      const ongoing = getEventOngoing(event.id);
      return {
        id: event.id,
        perspectives: getEventPerspectives(event.id, 'en'),
        imageUrl,
        ongoing,
      };
    })
    .filter((e) => e.perspectives.length > 0);

  const websiteSchema = generateWebSiteSchema('en');

  const eventListForSchema = events
    .map((e) => ({
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
      <LanguageRedirect />
      <SearchEvents initialEvents={events} lang="en" />
    </>
  );
}

