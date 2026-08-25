import { translations, Language } from './translations';

export type SourceNatureType =
  | 'government_textbook'
  | 'private_textbook'
  | 'official_statement'
  | 'academic_research'
  | 'international_report'
  | 'media_press'
  | 'historical_archive'
  | 'general_material';

export interface SourceNatureTag {
  id: string;
  type: SourceNatureType | 'translation' | 'original';
  label: string;
  kind: 'nature' | 'language';
  color: string;
  bg: string;
  border: string;
  iconName: 'Building' | 'BookOpen' | 'Scale' | 'GraduationCap' | 'Globe' | 'Newspaper' | 'Archive' | 'Languages' | 'FileCheck';
}

function detectNatureType(source: string, explicitType?: string): SourceNatureType {
  if (explicitType) {
    switch (explicitType.toLowerCase()) {
      case 'government_textbook':
      case 'gov_textbook':
        return 'government_textbook';
      case 'private_textbook':
      case 'textbook':
        return 'private_textbook';
      case 'government':
      case 'official_statement':
      case 'gov_statement':
        return 'official_statement';
      case 'academic':
      case 'academic_research':
        return 'academic_research';
      case 'international':
      case 'international_report':
        return 'international_report';
      case 'media':
      case 'media_press':
        return 'media_press';
      case 'archive':
      case 'historical_archive':
        return 'historical_archive';
      default:
        break;
    }
  }

  const s = source.toLowerCase();

  // Government official statements
  if (
    s.includes('外務省') ||
    s.includes('外交部') ||
    s.includes('国務省') ||
    s.includes('state department') ||
    s.includes('department of defense') ||
    s.includes('国防総省') ||
    s.includes('ministry of foreign affairs') ||
    s.includes('official statement') ||
    s.includes('official position') ||
    s.includes('외무성') ||
    s.includes('외교부') ||
    s.includes('국방부')
  ) {
    // If it also explicitly says it's a textbook
    if (s.includes('教科書') || s.includes('textbook') || s.includes('教材') || s.includes('교과서')) {
      return 'government_textbook';
    }
    return 'official_statement';
  }

  // Academic / Scientific journals
  if (
    s.includes('nature') ||
    s.includes('science') ||
    s.includes('研究所') ||
    s.includes('学術') ||
    s.includes('academic') ||
    s.includes('brookings') ||
    s.includes('journal') ||
    s.includes('research') ||
    s.includes('논문') ||
    s.includes('학술')
  ) {
    return 'academic_research';
  }

  // International organizations
  if (
    s.includes('who') ||
    s.includes('unesco') ||
    s.includes('ユネスコ') ||
    s.includes('国連') ||
    s.includes('un ') ||
    s.includes('united nations') ||
    s.includes('international') ||
    s.includes('국제기구') ||
    s.includes('세계보건기구')
  ) {
    return 'international_report';
  }

  // Official & state textbooks
  if (
    s.includes('国定') ||
    s.includes('検定') ||
    s.includes('公式見解・教科書') ||
    s.includes('公式教科書') ||
    s.includes('政府見解・教科書') ||
    s.includes('教育資料・政府見解') ||
    s.includes('中国の歴史教科書') ||
    s.includes('中国历史教材') ||
    s.includes('中国历史教科书') ||
    s.includes('대한민국') ||
    s.includes('education materials') ||
    s.includes('official opinion/textbook') ||
    s.includes('government opinion')
  ) {
    return 'government_textbook';
  }

  // Standard/Commercial textbooks
  if (
    s.includes('教科書') ||
    s.includes('textbook') ||
    s.includes('教材') ||
    s.includes('教本') ||
    s.includes('교과서')
  ) {
    return 'private_textbook';
  }

  // Media / Press
  if (
    s.includes('新華社') ||
    s.includes('人民日報') ||
    s.includes('環球時報') ||
    s.includes('xinhua') ||
    s.includes('people\'s daily') ||
    s.includes('global times') ||
    s.includes('報道') ||
    s.includes('メディア') ||
    s.includes('news') ||
    s.includes('press') ||
    s.includes('신문사')
  ) {
    return 'media_press';
  }

  // Historical archives & treaties
  if (
    s.includes('条約') ||
    s.includes('協定') ||
    s.includes('合意') ||
    s.includes('公文書') ||
    s.includes('議会') ||
    s.includes('国会') ||
    s.includes('treaty') ||
    s.includes('agreement') ||
    s.includes('accord') ||
    s.includes('archive') ||
    s.includes('records') ||
    s.includes('조약') ||
    s.includes('협정')
  ) {
    return 'historical_archive';
  }

  return 'general_material';
}

function isNativeLanguageMatch(country: string, currentLang: Language): boolean {
  const c = country.toLowerCase();
  
  if (currentLang === 'ja') {
    return c.includes('日本') || c.includes('japan');
  }
  if (currentLang === 'zh') {
    return c.includes('中国') || c.includes('china') || c.includes('台湾') || c.includes('taiwan');
  }
  if (currentLang === 'ko') {
    return c.includes('韓国') || c.includes('korea') || c.includes('대한민국') || c.includes('남한') || c.includes('북한');
  }
  if (currentLang === 'en') {
    return (
      c.includes('usa') ||
      c.includes('united states') ||
      c.includes('アメリカ') ||
      c.includes('米国') ||
      c.includes('uk') ||
      c.includes('united kingdom') ||
      c.includes('イギリス') ||
      c.includes('英国') ||
      c.includes('australia') ||
      c.includes('オーストラリア') ||
      c.includes('canada') ||
      c.includes('カナダ')
    );
  }
  return false;
}

export function getSourceNatureTags(
  perspective: {
    source: string;
    country: string;
    language?: string;
    source_type?: string;
  },
  lang: Language
): SourceNatureTag[] {
  const t = translations[lang] || translations.en;
  const tags: SourceNatureTag[] = [];

  const natureType = detectNatureType(perspective.source, perspective.source_type);

  switch (natureType) {
    case 'government_textbook':
      tags.push({
        id: 'nature-gov-tb',
        type: 'government_textbook',
        label: t.sourceGovTextbook,
        kind: 'nature',
        color: '#60a5fa',
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.28)',
        iconName: 'Building',
      });
      break;
    case 'private_textbook':
      tags.push({
        id: 'nature-pvt-tb',
        type: 'private_textbook',
        label: t.sourcePrivateTextbook,
        kind: 'nature',
        color: '#38bdf8',
        bg: 'rgba(6, 182, 212, 0.12)',
        border: 'rgba(6, 182, 212, 0.28)',
        iconName: 'BookOpen',
      });
      break;
    case 'official_statement':
      tags.push({
        id: 'nature-gov-stmt',
        type: 'official_statement',
        label: t.sourceGovStatement,
        kind: 'nature',
        color: '#a78bfa',
        bg: 'rgba(139, 92, 246, 0.12)',
        border: 'rgba(139, 92, 246, 0.28)',
        iconName: 'Scale',
      });
      break;
    case 'academic_research':
      tags.push({
        id: 'nature-academic',
        type: 'academic_research',
        label: t.sourceAcademic,
        kind: 'nature',
        color: '#34d399',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.28)',
        iconName: 'GraduationCap',
      });
      break;
    case 'international_report':
      tags.push({
        id: 'nature-intl',
        type: 'international_report',
        label: t.sourceInternational,
        kind: 'nature',
        color: '#818cf8',
        bg: 'rgba(99, 102, 241, 0.12)',
        border: 'rgba(99, 102, 241, 0.28)',
        iconName: 'Globe',
      });
      break;
    case 'media_press':
      tags.push({
        id: 'nature-media',
        type: 'media_press',
        label: t.sourceMedia,
        kind: 'nature',
        color: '#fbbf24',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.28)',
        iconName: 'Newspaper',
      });
      break;
    case 'historical_archive':
      tags.push({
        id: 'nature-archive',
        type: 'historical_archive',
        label: t.sourceArchive,
        kind: 'nature',
        color: '#f472b6',
        bg: 'rgba(236, 72, 153, 0.12)',
        border: 'rgba(236, 72, 153, 0.28)',
        iconName: 'Archive',
      });
      break;
    case 'general_material':
    default:
      tags.push({
        id: 'nature-general',
        type: 'general_material',
        label: t.sourceGeneral,
        kind: 'nature',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.12)',
        border: 'rgba(148, 163, 184, 0.28)',
        iconName: 'BookOpen',
      });
      break;
  }

  // Language / Translation tag
  const isOriginal = isNativeLanguageMatch(perspective.country, lang);
  if (isOriginal) {
    tags.push({
      id: 'lang-orig',
      type: 'original',
      label: t.sourceOriginalLanguage,
      kind: 'language',
      color: '#2dd4bf',
      bg: 'rgba(20, 184, 166, 0.12)',
      border: 'rgba(20, 184, 166, 0.28)',
      iconName: 'FileCheck',
    });
  } else {
    tags.push({
      id: 'lang-trans',
      type: 'translation',
      label: t.sourceViaTranslation,
      kind: 'language',
      color: '#c084fc',
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.28)',
      iconName: 'Languages',
    });
  }

  return tags;
}
