import { getAllEvents, getEventPerspectives } from '@/lib/markdown';
import SearchEvents from './components/SearchEvents';

export default function Home() {
  const eventIds = getAllEvents();

  // Fetch only English event data for the default root path
  const events = eventIds
    .map((event) => ({
      id: event.id,
      perspectives: getEventPerspectives(event.id, 'en'),
    }))
    .filter((e) => e.perspectives.length > 0);

  return <SearchEvents initialEvents={events} lang="en" />;
}
