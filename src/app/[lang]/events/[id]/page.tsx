import { getEventPerspectives, getAllEvents, getEventNotes, getEventPhotos, getEventVoices, getEventOngoing, getEventMeta } from '@/lib/markdown';
import { generateEventArticleSchema, generateEventFaqSchema, generateBreadcrumbSchema, safeJsonLdStringify, SITE_URL } from '@/lib/schema';
import { buildEventSeoMeta } from '@/lib/seoKeywords';
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
  const eventMeta = getEventMeta(id);
  const eventTitle = (eventMeta?.title?.[lang as 'ja' | 'zh' | 'ko'] ?? eventMeta?.title?.en) ?? null;

  const { pageTitle, fullTitle, description, keywords } = buildEventSeoMeta({
    eventId: id,
    lang,
    eventTitle,
    perspectives,
  });

  const ogImage = `/og/events/${id}-${lang}.png`;

  return {
    title: pageTitle,
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
      title: fullTitle,
      description,
      url: `${SITE_URL}/${lang}/events/${id}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
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
  const eventMeta = getEventMeta(id);
  const eventTitle = (eventMeta?.title?.[lang as 'ja' | 'zh' | 'ko'] ?? eventMeta?.title?.en) ?? null;

  const { baseTitle, pageTitle, description, keywords } = buildEventSeoMeta({
    eventId: id,
    lang,
    eventTitle,
    perspectives,
  });

  const ogImage = `/og/events/${id}-${lang}.png`;
  const category = perspectives[0]?.category;
  const year = perspectives[0]?.year;
  const location = perspectives[0]?.location;

  const articleSchema = generateEventArticleSchema({
    eventId: id,
    lang,
    title: pageTitle,
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
    title: baseTitle,
    notes,
    perspectives,
    description,
    ogImage,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    eventId: id,
    lang,
    title: baseTitle,
    category,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(breadcrumbSchema) }}
      />
      <EventPageClient
        eventId={id}
        initialPerspectives={perspectives}
        initialNotes={notes}
        initialPhotos={photos}
        initialVoices={voices}
        initialOngoing={ongoing}
        lang={lang}
        eventTitle={eventTitle}
      />
    </>
  );
}
