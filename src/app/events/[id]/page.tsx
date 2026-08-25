import { getEventPerspectives, getAllEvents, getEventNotes, getEventPhotos, getEventVoices } from '@/lib/markdown';
import { generateEventArticleSchema, generateEventFaqSchema, generateBreadcrumbSchema, SITE_URL } from '@/lib/schema';
import { getSeoKeywords } from '@/lib/seoKeywords';
import EventPageClient from './EventPageClient';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const events = getAllEvents();
  return events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  // Use English as canonical metadata
  const perspectives = getEventPerspectives(id, 'en');
  const title = (perspectives[0]?.title ?? getEventPerspectives(id, 'ja')[0]?.title) ?? 'Event Details';
  const description = `Compare history textbook descriptions and perspectives on "${title}" across nations. Multi-perspective diff analysis.`;
  const ogImage = `/og/events/${id}-en.png`;
  const keywords = getSeoKeywords(id, 'en');

  return {
    title: `${title} | HistoryDiff`,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/events/${id}`,
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
      url: `${SITE_URL}/events/${id}`,
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

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const perspectives = getEventPerspectives(id, 'en');
  const notes = getEventNotes(id, 'en');
  const photos = getEventPhotos(id);
  const voices = getEventVoices(id);

  const title = (perspectives[0]?.title ?? getEventPerspectives(id, 'ja')[0]?.title) ?? 'Event Details';
  const description = `Compare history textbook descriptions and perspectives on "${title}" across nations. Multi-perspective diff analysis.`;
  const ogImage = `/og/events/${id}-en.png`;
  const keywords = getSeoKeywords(id, 'en');
  const category = perspectives[0]?.category;
  const year = perspectives[0]?.year;
  const location = perspectives[0]?.location;

  const articleSchema = generateEventArticleSchema({
    eventId: id,
    lang: 'en',
    title,
    description,
    ogImage,
    category,
    year,
    location,
    keywords,
  });

  const faqSchema = generateEventFaqSchema({
    eventId: id,
    lang: 'en',
    title,
    notes,
    perspectives,
    description,
    ogImage,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    eventId: id,
    lang: 'en',
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
        lang="en"
      />
    </>
  );
}


