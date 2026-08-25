import { EventPerspective, EventNotes } from '@/lib/markdown';

export const SITE_URL = 'https://historydiff.pages.dev';

export interface EventSchemaParams {
  eventId: string;
  lang: string;
  title: string;
  description: string;
  ogImage: string;
  category?: string;
  year?: string;
  location?: string;
  keywords?: string[];
  perspectives?: EventPerspective[];
  notes?: EventNotes | null;
}

/**
 * Generates schema.org Article structured data for event pages.
 */
export function generateEventArticleSchema({
  eventId,
  lang,
  title,
  description,
  ogImage,
  category,
  year,
  location,
  keywords = [],
}: EventSchemaParams) {
  const pageUrl = lang === 'en' ? `${SITE_URL}/events/${eventId}` : `${SITE_URL}/${lang}/events/${eventId}`;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

  const aboutEntities = [
    {
      '@type': 'Event',
      name: title,
      ...(year ? { startDate: year } : {}),
      ...(location ? { location: { '@type': 'Place', name: location } } : {}),
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: [fullImageUrl],
    url: pageUrl,
    inLanguage: lang,
    datePublished: '2026-01-01T00:00:00+09:00',
    dateModified: '2026-08-25T00:00:00+09:00',
    author: {
      '@type': 'Organization',
      name: 'HistoryDiff Project',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HistoryDiff',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og/og-top-ja.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    ...(category ? { articleSection: category } : {}),
    ...(keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
    about: aboutEntities,
  };
}

/**
 * Generates schema.org FAQPage structured data from Community Notes & Perspectives.
 * Enables Google rich snippets / People Also Ask (PAA) cards.
 */
export function generateEventFaqSchema(params: {
  lang: string;
  title: string;
  notes?: EventNotes | null;
  perspectives?: EventPerspective[];
  [key: string]: unknown;
}) {
  const { lang, title, notes, perspectives = [] } = params;


  const mainEntities: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }> = [];

  // 1. Add Community Notes as Q&As if present
  if (notes && notes.notes && notes.notes.length > 0) {
    for (const note of notes.notes) {
      const sourcesSummary = note.sources && note.sources.length > 0
        ? ` (Source: ${note.sources.map((s) => `${s.title} [${s.publisher}]`).join(', ')})`
        : '';
      const verdictLabel = lang === 'ja' ? '【検証結果】' : lang === 'zh' ? '【结论】' : lang === 'ko' ? '【판정】' : '[Verdict] ';
      const contextLabel = lang === 'ja' ? '【解説・背景】' : lang === 'zh' ? '【背景与分析】' : lang === 'ko' ? '【배경 및 분석】' : '[Context & Analysis] ';

      const questionPrompt = lang === 'ja'
        ? `「${title}」の論点: ${note.claim}`
        : lang === 'zh'
        ? `“${title}”争议焦点: ${note.claim}`
        : lang === 'ko'
        ? `"${title}" 쟁점: ${note.claim}`
        : `Historical point on "${title}": ${note.claim}`;

      mainEntities.push({
        '@type': 'Question',
        name: questionPrompt,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${contextLabel}${note.context} ${verdictLabel}${note.verdict}${sourcesSummary}`,
        },
      });
    }
  }

  // 2. Add Perspectives summary as Q&As for key national viewpoints
  if (perspectives && perspectives.length > 0) {
    for (const p of perspectives) {
      const question = lang === 'ja'
        ? `「${p.country}」の歴史教科書における「${title}」の記述と立場は？`
        : lang === 'zh'
        ? `“${p.country}”历史教科书关于“${title}”的记述与立场是什么？`
        : lang === 'ko'
        ? `"${p.country}" 역사 교과서의 "${title}"에 대한 기술과 입장은?`
        : `How is "${title}" described in ${p.country}'s history textbooks?`;

      // Use first 200 chars or first paragraph of content
      const firstPara = p.content.trim().split('\n\n')[0] || p.content.slice(0, 200);
      const answer = `${firstPara} (Source: ${p.source})`;

      mainEntities.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      });
    }
  }

  if (mainEntities.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: mainEntities,
  };
}

/**
 * Generates schema.org BreadcrumbList structured data.
 */
export function generateBreadcrumbSchema({
  eventId,
  lang,
  title,
  category,
}: {
  eventId: string;
  lang: string;
  title: string;
  category?: string;
}) {
  const homeUrl = lang === 'en' ? `${SITE_URL}` : `${SITE_URL}/${lang}`;
  const eventUrl = lang === 'en' ? `${SITE_URL}/events/${eventId}` : `${SITE_URL}/${lang}/events/${eventId}`;

  const homeName = lang === 'ja' ? 'ホーム' : lang === 'zh' ? '首页' : lang === 'ko' ? '홈' : 'Home';
  const categoryName = category || (lang === 'ja' ? '比較アーカイブ' : lang === 'zh' ? '对比档案' : lang === 'ko' ? '비교 아카이브' : 'Archive');

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeName,
      item: homeUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: categoryName,
      item: `${homeUrl}#archive`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: title,
      item: eventUrl,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

/**
 * Generates schema.org WebSite structured data for Homepages.
 */
export function generateWebSiteSchema(lang: string = 'en') {
  const descriptions: Record<string, string> = {
    ja: '世界各国の歴史教科書に記載されている記述の違いをテキスト比較（Diff）で浮き彫りにするプラットフォーム。',
    zh: '通过文本对比（Diff）客观直观地展示各国历史教科书中的记述差异。',
    ko: '세계 각국의 역사 교과서 기술 차이를 텍스트 비교(Diff)로 시각화하는 플랫폼.',
    en: 'A platform that highlights differences in historical perceptions and textbook descriptions across nations using text diff comparison.',
  };

  const titles: Record<string, string> = {
    ja: 'HistoryDiff | 歴史の「記述の差」を視覚的に解明する',
    zh: 'HistoryDiff | 直观阐明历史“记述之差”',
    ko: 'HistoryDiff | 역사의 "기술 차이"를 시각적으로 밝힌다',
    en: 'HistoryDiff | Visualizing Textbook Differences in History',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HistoryDiff',
    url: SITE_URL,
    description: descriptions[lang] || descriptions.en,
    headline: titles[lang] || titles.en,
    inLanguage: ['en', 'ja', 'zh', 'ko'],
    publisher: {
      '@type': 'Organization',
      name: 'HistoryDiff Project',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og/og-top-ja.png`,
      },
    },
  };
}
