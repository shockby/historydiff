import type { MetadataRoute } from 'next';
import { getAllEvents } from '../lib/markdown.ts';

export const dynamic = 'force-static';

export const SITE_URL = 'https://historydiff.solisart.com';
export const LANGUAGES = ['en', 'ja', 'zh', 'ko'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const events = getAllEvents();
  const currentDate = new Date().toISOString();

  // Top pages sitemap entries
  const topPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          en: `${SITE_URL}`,
          ja: `${SITE_URL}/ja`,
          zh: `${SITE_URL}/zh`,
          ko: `${SITE_URL}/ko`,
          'x-default': `${SITE_URL}`,
        },
      },
    },
    ...LANGUAGES.filter((lang) => lang !== 'en').map((lang) => ({
      url: `${SITE_URL}/${lang}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}`,
          ja: `${SITE_URL}/ja`,
          zh: `${SITE_URL}/zh`,
          ko: `${SITE_URL}/ko`,
          'x-default': `${SITE_URL}`,
        },
      },
    })),
  ];

  // Events archive pages sitemap entries
  const archivePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/events`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/events`,
          ja: `${SITE_URL}/ja/events`,
          zh: `${SITE_URL}/zh/events`,
          ko: `${SITE_URL}/ko/events`,
          'x-default': `${SITE_URL}/events`,
        },
      },
    },
    ...LANGUAGES.filter((lang) => lang !== 'en').map((lang) => ({
      url: `${SITE_URL}/${lang}/events`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        languages: {
          en: `${SITE_URL}/events`,
          ja: `${SITE_URL}/ja/events`,
          zh: `${SITE_URL}/zh/events`,
          ko: `${SITE_URL}/ko/events`,
          'x-default': `${SITE_URL}/events`,
        },
      },
    })),
  ];

  // Guide pages sitemap entries
  const guidePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/guide`,
          ja: `${SITE_URL}/ja/guide`,
          zh: `${SITE_URL}/zh/guide`,
          ko: `${SITE_URL}/ko/guide`,
          'x-default': `${SITE_URL}/guide`,
        },
      },
    },
    ...LANGUAGES.filter((lang) => lang !== 'en').map((lang) => ({
      url: `${SITE_URL}/${lang}/guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/guide`,
          ja: `${SITE_URL}/ja/guide`,
          zh: `${SITE_URL}/zh/guide`,
          ko: `${SITE_URL}/ko/guide`,
          'x-default': `${SITE_URL}/guide`,
        },
      },
    })),
  ];

  // Event pages sitemap entries (all events in 4 languages)
  const eventPages: MetadataRoute.Sitemap = [];

  for (const event of events) {
    const alternates = {
      languages: {
        en: `${SITE_URL}/events/${event.id}`,
        ja: `${SITE_URL}/ja/events/${event.id}`,
        zh: `${SITE_URL}/zh/events/${event.id}`,
        ko: `${SITE_URL}/ko/events/${event.id}`,
        'x-default': `${SITE_URL}/events/${event.id}`,
      },
    };

    // English canonical URL
    eventPages.push({
      url: `${SITE_URL}/events/${event.id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates,
    });

    // Localized URLs
    for (const lang of ['ja', 'zh', 'ko'] as const) {
      eventPages.push({
        url: `${SITE_URL}/${lang}/events/${event.id}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates,
      });
    }
  }

  return [...topPages, ...archivePages, ...guidePages, ...eventPages];
}
