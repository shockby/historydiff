import { Metadata } from 'next';
import { getAllEvents, getEventPerspectives, getEventPhotos, getEventNotes } from '@/lib/markdown';
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
    ja: 'HistoryDiff | 歴史の「記述の差」を視覚的に解明する',
    zh: 'HistoryDiff | 直观阐明历史“记述之差”',
    ko: 'HistoryDiff | 역사의 "기술 차이"를 시각적으로 밝힌다',
  };
  const descriptions: Record<string, string> = {
    ja: '世界各国の歴史教科書に記載されている記述の違いをテキスト比較（Diff）で浮き彫りにするプラットフォーム。',
    zh: '通过文本对比（Diff）客观直观地展示各国历史教科书中的记述差异。',
    ko: '세계 각국의 역사 교과서 기술 차이를 텍스트 비교(Diff)로 시각화하는 플랫폼.',
  };

  const title = (titles[lang] ?? 'HistoryDiff');
  const description = (descriptions[lang] ?? 'HistoryDiff platform');
  const ogImage = `/og/og-top-${lang}.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://historydiff.pages.dev/${lang}`,
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
      return {
        id: event.id,
        perspectives: getEventPerspectives(event.id, lang),
        imageUrl,
        notes: notesData?.notes ?? [],
      };
    })
    .filter((e) => e.perspectives.length > 0);

  return <SearchEvents initialEvents={events} lang={lang} />;
}
