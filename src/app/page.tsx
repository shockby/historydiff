import { getAllEvents, getEventPerspectives, getEventPhotos, getEventOngoing } from '@/lib/markdown';
import SearchEvents from './components/SearchEvents';
import LanguageRedirect from './components/LanguageRedirect';

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

  return (
    <>
      <LanguageRedirect />
      <SearchEvents initialEvents={events} lang="en" />
    </>
  );
}
