import { getEventPerspectives, getAllEvents, getEventNotes, getEventPhotos, getEventVoices, getEventOngoing } from '@/lib/markdown';
import { generateEventArticleSchema, generateEventFaqSchema, generateBreadcrumbSchema, SITE_URL } from '@/lib/schema';
import { getSeoKeywords } from '@/lib/seoKeywords';
import EventPageClient from '@/app/events/[id]/EventPageClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const events = getAllEvents();
  const paths: { lang: string; id: string }[] = [];

  for (const lang of ['ja', 'zh', 'ko']) {
    for (const event of events) {
      paths.push({
        lang,
        id: event.id,
      });
    }
  }

  return paths;
}

interface PageProps {
  params: Promise<{ id: string; lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, lang } = await params;
  const perspectives = getEventPerspectives(id, lang);
  const title = (perspectives[0]?.title ?? 'Event Details');
  const description = lang === 'ja'
    ? `「${title}」に関する各国の歴史教科書の記述の違いをテキスト比較（Diff）で検証。`
    : lang === 'zh'
    ? `对比各国历史教科书关于“${title}”的不同记述与观点差异。`
    : lang === 'ko'
    ? `"${title}"에 관한 각국 역사 교과서의 기술 차이를 텍스트 비교(Diff)로 검증.`
    : `Compare different historical perspectives on ${title}.`;
  
  const ogImage = `/og/events/${id}-${lang}.png`;
  const keywords = getSeoKeywords(id, lang);

  return {
    title: `${title} | HistoryDiff`,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/${lang}/events/${id}`,
      languages: {
        en: `${SITE_URL}/events/${id}`,
        ja: `${SITE_URL}/ja/events/${id}`,
        zh: `${SITE_URL}/zh/events/${id}`,
        ko: `${SITE_URL}/ko/events/${id}`,
        'x-default': `${SITE_URL}/events/${id}`,
      },
    },
    openGraph: {
      title: `${title} | HistoryDiff`,
      description,
      url: `${SITE_URL}/${lang}/events/${id}`,
      type: 'article',
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
      title: `${title} | HistoryDiff`,
      description,
      images: [ogImage],
    },
  };
}

export default async function LocalizedEventPage({ params }: PageProps) {
  const { id, lang } = await params;

  const perspectives = getEventPerspectives(id, lang);
  const notes = getEventNotes(id, lang);
  const photos = getEventPhotos(id);
  const voices = getEventVoices(id);
  const ongoing = getEventOngoing(id);

  const title = (perspectives[0]?.title ?? 'Event Details');
  const description = lang === 'ja'
    ? `「${title}」に関する各国の歴史教科書の記述の違いをテキスト比較（Diff）で検証。`
    : lang === 'zh'
    ? `对比各国历史教科书关于“${title}”的不同记述与观点差异。`
    : lang === 'ko'
    ? `"${title}"에 관한 각국 역사 교과서의 기술 차이를 텍스트 비교(Diff)로 검증.`
    : `Compare different historical perspectives on ${title}.`;
  const ogImage = `/og/events/${id}-${lang}.png`;
  const keywords = getSeoKeywords(id, lang);
  const category = perspectives[0]?.category;
  const year = perspectives[0]?.year;
  const location = perspectives[0]?.location;

  const articleSchema = generateEventArticleSchema({
    eventId: id,
    lang,
    title,
    description,
    ogImage,
    category,
    year,
    location,
    keywords,
    notes,
    dateModified: ongoing?.lastUpdated,
  });

  const faqSchema = generateEventFaqSchema({
    eventId: id,
    lang,
    title,
    notes,
    perspectives,
    description,
    ogImage,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    eventId: id,
    lang,
    title,
    category,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <EventPageClient
        eventId={id}
        initialPerspectives={perspectives}
        initialNotes={notes}
        initialPhotos={photos}
        initialVoices={voices}
        initialOngoing={ongoing}
        lang={lang}
      />
    </>
  );
}


