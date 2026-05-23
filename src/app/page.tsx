import { getAllEvents, getEventPerspectives } from '@/lib/markdown';
import SearchEvents from './components/SearchEvents';

export default function Home() {
  const eventIds = getAllEvents();

  // Build per-language event data at build time (static export compatible)
  const eventsAllLangs: Record<string, { id: string; perspectives: ReturnType<typeof getEventPerspectives> }[]> = {};

  for (const lang of ['en', 'ja', 'zh']) {
    eventsAllLangs[lang] = eventIds
      .map((event) => ({
        id: event.id,
        perspectives: getEventPerspectives(event.id, lang),
      }))
      .filter((e) => e.perspectives.length > 0);
  }

  return <SearchEvents eventsAllLangs={eventsAllLangs} />;
}
