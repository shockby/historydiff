import { Metadata } from 'next';
import { getAllEvents, getEventPerspectives, getEventPhotos, getEventNotes, getEventOngoing, getSearchKeywords, getEventMeta } from '@/lib/markdown';
import { generateWebSiteSchema, generateItemListSchema, safeJsonLdStringify, SITE_URL } from '@/lib/schema';
import SearchEvents from '@/app/components/SearchEvents';

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
    ja: 'HistoryDiff | 世界の歴史教科書の「記述の差」をテキスト比較（Diff）で可視化',
    zh: 'HistoryDiff | 直观对比世界各国历史教科书的“记述差异”',
    ko: 'HistoryDiff | 세계 각국 역사 교과서의 "기술 차이"를 시각적으로 비교·검증',
  };
  const descriptions: Record<string, string> = {
    ja: '同じ歴史的事件でも国によって教科書の記述はどう違うのか？日本・中国・韓国・欧米など世界各国の歴史教科書・公的資料の記述の違いをテキスト比較（Diff）とファクトチェックで検証するプラットフォーム。',
    zh: '同一历史事件在各国教科书中如何不同表述？通过文本对比（Diff）与客观史料考证，直观展示中日韩及欧美等世界各国历史教科书的记述差异。',
    ko: '같은 역사적 사건이라도 나라마다 교과서 서술은 어떻게 다를까? 한·중·일 및 세계 각국 역사 교과서의 기술 차이를 텍스트 비교(Diff)와 팩트체크로 시각화하는 플랫폼.',
  };

  const title = (titles[lang] ?? 'HistoryDiff');
  const description = (descriptions[lang] ?? 'HistoryDiff platform');
  const ogImage = `/og/og-top-${lang}.png`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        en: `${SITE_URL}`,
        ja: `${SITE_URL}/ja`,
        zh: `${SITE_URL}/zh`,
        ko: `${SITE_URL}/ko`,
        'x-default': `${SITE_URL}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}`,
      type: 'website',
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
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function LocalizedHome({ params }: PageProps) {
  const { lang } = await params;
  const eventIds = getAllEvents();

  // Fetch only the specific language event data for this static path
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

  // Build event list for ItemList schema (title from canonical title or first perspective)
  const eventListForSchema = events
    .map((e) => ({
      id: e.id,
      title: (e.title ?? e.perspectives[0]?.title) ?? e.id,
    }));
  const itemListSchema = generateItemListSchema({ lang, events: eventListForSchema });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(itemListSchema) }}
      />
      <SearchEvents initialEvents={events} lang={lang} />
    </>
  );
}
