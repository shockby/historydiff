import { getEventPerspectives, getAllEvents, getEventNotes, getEventPhotos, getEventVoices, getEventOngoing, getEventMeta } from '@/lib/markdown';
import { generateEventArticleSchema, generateEventFaqSchema, generateBreadcrumbSchema, safeJsonLdStringify, SITE_URL } from '@/lib/schema';
import { buildEventSeoMeta } from '@/lib/seoKeywords';
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
  const eventMeta = getEventMeta(id);
  const eventTitle = eventMeta?.title?.en ?? null;

  const { pageTitle, fullTitle, description, keywords } = buildEventSeoMeta({
    eventId: id,
    lang: 'en',
    eventTitle,
    perspectives,
  });

  const ogImage = `/og/events/${id}-en.png`;

  return {
    title: pageTitle,
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
      title: fullTitle,
      description,
      url: `${SITE_URL}/events/${id}`,
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

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const perspectives = getEventPerspectives(id, 'en');
  const notes = getEventNotes(id, 'en');
  const photos = getEventPhotos(id);
  const voices = getEventVoices(id);
  const ongoing = getEventOngoing(id);
  const eventMeta = getEventMeta(id);
  const eventTitle = eventMeta?.title?.en ?? null;

  const { baseTitle, pageTitle, description, keywords } = buildEventSeoMeta({
    eventId: id,
    lang: 'en',
    eventTitle,
    perspectives,
  });

  const ogImage = `/og/events/${id}-en.png`;
  const category = perspectives[0]?.category;
  const year = perspectives[0]?.year;
  const location = perspectives[0]?.location;

  const articleSchema = generateEventArticleSchema({
    eventId: id,
    lang: 'en',
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
    lang: 'en',
    title: baseTitle,
    notes,
    perspectives,
    description,
    ogImage,
  });

  const breadcrumbSchema = generateBreadcrumbSchema({
    eventId: id,
    lang: 'en',
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
        lang="en"
        eventTitle={eventTitle}
      />
    </>
  );
}


