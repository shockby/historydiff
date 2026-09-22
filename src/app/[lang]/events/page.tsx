import { Metadata } from 'next';
import { getAllEvents, getEventPerspectives, getEventPhotos, getEventNotes, getEventOngoing, getSearchKeywords, getEventMeta } from '@/lib/markdown';
import { generateWebSiteSchema, generateItemListSchema, SITE_URL } from '@/lib/schema';
import EventsArchive from '@/app/components/EventsArchive';

export async function generateStaticParams() {
  return [
    { lang: 'ja' },
    { lang: 'zh' },
    { lang: 'ko' },
  ];
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const titles: Record<string, string> = {
    ja: '比較アーカイブ一覧 | HistoryDiff',
    zh: '比较档案一览 | HistoryDiff',
    ko: '비교 아카이브 목록 | HistoryDiff',
  };
  const descriptions: Record<string, string> = {
    ja: '世界各国の歴史教科書に記載されている記述の差異を多角的に探索・比較できるアーカイブ一覧。',
    zh: '多角度探索并对比世界各国历史教科书中的记述差异与多重视角档案。',
    ko: '세계 각국의 역사 교과서에 기록된 기술 차이를 다각도로 탐색하고 비교하는 전체 아카이브.',
  };

  const title = (titles[lang] ?? 'Comparison Archives | HistoryDiff');
  const description = (descriptions[lang] ?? 'HistoryDiff Comparison Archives');

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/events`,
      languages: {
        en: `${SITE_URL}/events`,
        ja: `${SITE_URL}/ja/events`,
        zh: `${SITE_URL}/zh/events`,
        ko: `${SITE_URL}/ko/events`,
        'x-default': `${SITE_URL}/events`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/events`,
      type: 'website',
    },
  };
}

export default async function LocalizedEventsPage({ params }: PageProps) {
  const { lang } = await params;
  const eventIds = getAllEvents();

  const events = eventIds
    .map((event) => {
      const photos = getEventPhotos(event.id);
      const imageUrl = photos && photos.photos.length > 0 ? photos.photos[0].url : undefined;
      const notesData = getEventNotes(event.id, lang);
      const ongoing = getEventOngoing(event.id);
      const eventMeta = getEventMeta(event.id);
      const eventTitle = (eventMeta?.title?.[lang as 'ja' | 'zh' | 'ko'] ?? eventMeta?.title?.en) || undefined;
      return {
        id: event.id,
        title: eventTitle,
        perspectives: getEventPerspectives(event.id, lang),
        imageUrl,
        notes: notesData?.notes ?? [],
        ongoing,
        searchKeywords: getSearchKeywords(event.id),
      };
    })
    .filter((e) => e.perspectives.length > 0);

  const websiteSchema = generateWebSiteSchema(lang);

  const eventListForSchema = events.map((e) => ({
    id: e.id,
    title: (e.title ?? e.perspectives[0]?.title) ?? e.id,
  }));
  const itemListSchema = generateItemListSchema({ lang, events: eventListForSchema });

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
      <EventsArchive initialEvents={events} lang={lang} />
    </>
  );
}
