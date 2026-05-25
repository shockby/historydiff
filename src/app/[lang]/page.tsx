import { getAllEvents, getEventPerspectives } from '@/lib/markdown';
import SearchEvents from '@/app/components/SearchEvents';

export async function generateStaticParams() {
  return [
    { lang: 'ja' },
    { lang: 'zh' },
  ];
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function LocalizedHome({ params }: PageProps) {
  const { lang } = await params;
  const eventIds = getAllEvents();

  // Fetch only the specific language event data for this static path
  const events = eventIds
    .map((event) => ({
      id: event.id,
      perspectives: getEventPerspectives(event.id, lang),
    }))
    .filter((e) => e.perspectives.length > 0);

  return <SearchEvents initialEvents={events} lang={lang} />;
}
