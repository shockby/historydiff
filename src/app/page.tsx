import { getAllEvents, getEventPerspectives, getEventPhotos } from '@/lib/markdown';
import SearchEvents from './components/SearchEvents';
import LanguageRedirect from './components/LanguageRedirect';

export default function Home() {
  const eventIds = getAllEvents();

  // Fetch only English event data for the default root path
  const events = eventIds
    .map((event) => {
      const photos = getEventPhotos(event.id);
      const imageUrl = photos && photos.photos.length > 0 ? photos.photos[0].url : undefined;
      return {
        id: event.id,
        perspectives: getEventPerspectives(event.id, 'en'),
        imageUrl,
      };
    })
    .filter((e) => e.perspectives.length > 0);

  return (
    <>
      <LanguageRedirect />
      <SearchEvents initialEvents={events} lang="en" />
    </>
  );
}
