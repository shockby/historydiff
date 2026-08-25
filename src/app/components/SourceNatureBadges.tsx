'use client';

import React from 'react';
import {
  Building,
  BookOpen,
  Scale,
  GraduationCap,
  Globe,
  Newspaper,
  Archive,
  Languages,
  FileCheck,
} from 'lucide-react';
import { getSourceNatureTags, SourceNatureTag } from '@/lib/sourceNature';
import { Language } from '@/lib/translations';

interface SourceNatureBadgesProps {
  perspective: {
    source: string;
    country: string;
    language?: string;
    source_type?: string;
  };
  lang: Language;
  size?: 'sm' | 'md';
}

function getIcon(iconName: SourceNatureTag['iconName'], iconSize: number) {
  switch (iconName) {
    case 'Building':
      return <Building size={iconSize} />;
    case 'BookOpen':
      return <BookOpen size={iconSize} />;
    case 'Scale':
      return <Scale size={iconSize} />;
    case 'GraduationCap':
      return <GraduationCap size={iconSize} />;
    case 'Globe':
      return <Globe size={iconSize} />;
    case 'Newspaper':
      return <Newspaper size={iconSize} />;
    case 'Archive':
      return <Archive size={iconSize} />;
    case 'Languages':
      return <Languages size={iconSize} />;
    case 'FileCheck':
      return <FileCheck size={iconSize} />;
    default:
      return <BookOpen size={iconSize} />;
  }
}

export default function SourceNatureBadges({ perspective, lang, size = 'md' }: SourceNatureBadgesProps) {
  const tags = getSourceNatureTags(perspective, lang);
  const isSm = size === 'sm';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <span
          key={tag.id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: isSm ? '0.2rem' : '0.3rem',
            padding: isSm ? '1px 6px' : '2px 8px',
            borderRadius: isSm ? '4px' : '6px',
            fontSize: isSm ? '0.68rem' : '0.72rem',
            fontWeight: 600,
            color: tag.color,
            background: tag.bg,
            border: `1px solid ${tag.border}`,
            whiteSpace: 'nowrap',
          }}
        >
          {getIcon(tag.iconName, isSm ? 10 : 12)}
          <span>{tag.label}</span>
        </span>
      ))}
    </div>
  );
}
