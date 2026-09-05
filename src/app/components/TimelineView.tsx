'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { EventPerspective, EventNote } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { getEventDecades, getRelevantNotesForDecade, DecadeInfo } from '@/lib/timelineUtils';
import { Calendar, Layers, Filter, CheckCircle2, RotateCcw } from 'lucide-react';

interface TimelineViewProps {
  events: { id: string; perspectives: EventPerspective[]; imageUrl?: string; notes?: EventNote[] }[];
  lang: string;
  selectedCountry?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  '侵略・虐殺': '#ef4444',
  '領土問題・主権': '#f97316',
  '戦時人権問題・歴史認識問題': '#eab308',
  '政治・社会運動': '#8b5cf6',
  '安全保障': '#3b82f6',
  '環境・科学': '#22c55e',
  '戦争・紛争': '#ef4444',
  'Invasion/Massacre': '#ef4444',
  'Territory/Sovereignty': '#f97316',
  'Wartime Human Rights': '#eab308',
  'Political/Social Movement': '#8b5cf6',
  'Security': '#3b82f6',
  'War': '#ef4444',
  'Environment/Science': '#22c55e',
};

function getCategoryColor(category: string): string {
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase())) {
      return color;
    }
  }
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

// verdict文字列からアイコン・色を判定
function getVerdictStyle(verdict: string): { icon: string; color: string; bg: string } {
  const v = verdict.toLowerCase();
  if (v.includes('公式記録') || v.includes('official') || v.includes('confirmed') || v.includes('事実')) {
    return { icon: '✓', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
  }
  if (v.includes('議論') || v.includes('dispute') || v.includes('disagreement') || v.includes('差異') || v.includes('調査')) {
    return { icon: '⚖', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  }
  if (v.includes('否定') || v.includes('deny') || v.includes('disputed')) {
    return { icon: '✗', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
  }
  return { icon: '📋', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' };
}

interface AnnotationPanelProps {
  notes: EventNote[];
  lang: string;
  color: string;
}

function AnnotationPanel({ notes, lang, color }: AnnotationPanelProps) {
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const t = translations[lang as Language] || translations.en;

  const labelAnnotations = lang === 'ja' ? '注釈' : lang === 'zh' ? '注释' : lang === 'ko' ? '주석' : 'Notes';

  return (
    <div style={{
      marginTop: '0.6rem',
      borderTop: `1px dashed ${color}44`,
      paddingTop: '0.6rem',
    }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        marginBottom: '0.5rem',
      }}>
        <span style={{ fontSize: '0.65rem', color: color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          📌 {labelAnnotations}
        </span>
        <span style={{
          fontSize: '0.6rem',
          padding: '1px 6px',
          borderRadius: '10px',
          background: `${color}22`,
          color: color,
          fontWeight: 600,
        }}>
          {notes.length}
        </span>
      </div>

      {/* ノートリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {notes.map((note) => {
          const isOpen = openNoteId === note.id;
          const vs = getVerdictStyle(note.verdict);

          return (
            <div key={note.id}>
              {/* クリック可能な行 */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenNoteId(isOpen ? null : note.id);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  border: `1px solid ${isOpen ? color + '55' : 'rgba(255,255,255,0.06)'}`,
                  background: isOpen ? `${color}0d` : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}44`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }
                }}
              >
                {/* verdict icon */}
                <span style={{
                  flexShrink: 0,
                  fontSize: '0.7rem',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: vs.bg,
                  color: vs.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  marginTop: '1px',
                }}>
                  {vs.icon}
                </span>

                {/* claim text */}
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  flex: 1,
                }}>
                  {note.claim}
                </span>

                {/* chevron */}
                <span style={{
                  flexShrink: 0,
                  fontSize: '0.6rem',
                  color: 'var(--text-secondary)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease',
                  marginTop: '2px',
                }}>
                  ▼
                </span>
              </button>

              {/* 展開パネル */}
              {isOpen && (
                <div
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  style={{
                    margin: '0.25rem 0 0.25rem 1.6rem',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}33`,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  {/* verdict badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: vs.bg,
                    marginBottom: '0.5rem',
                  }}>
                    <span style={{ fontSize: '0.65rem', color: vs.color, fontWeight: 700 }}>
                      {t.verdictLabel}: {note.verdict}
                    </span>
                  </div>

                  {/* context */}
                  <p style={{
                    fontSize: '0.73rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: '0 0 0.6rem 0',
                  }}>
                    {note.context}
                  </p>

                  {/* sources */}
                  {note.sources.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {note.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '0.65rem',
                            color: color,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span>🔗</span>
                          <span style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                            {src.title}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                            — {src.publisher}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TimelineItem {
  event: { id: string; perspectives: EventPerspective[]; imageUrl?: string; notes?: EventNote[] };
  persp: EventPerspective;
  decade: DecadeInfo;
  isPrimaryDecade: boolean;
  relevantNotes: EventNote[];
}

export default function TimelineView({ events, lang, selectedCountry = 'all' }: TimelineViewProps) {
  const activeLang = lang as Language;
  const t = (translations[activeLang] ?? translations.en);

  const [selectedDecade, setSelectedDecade] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyWithNotes, setOnlyWithNotes] = useState<boolean>(false);

  const eventLink = (id: string) =>
    activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`;

  // Helper to pick perspective based on selectedCountry
  const getPerspective = (ev: { perspectives: EventPerspective[] }): EventPerspective => {
    if (selectedCountry !== 'all') {
      const match = ev.perspectives.find((p) => p.country === selectedCountry);
      if (match) return match;
    }
    const jaPref = activeLang === 'ja' ? ev.perspectives.find((p) => p.country === '日本') : undefined;
    return (jaPref ?? (ev.perspectives[0]!));
  };

  // 1. Expand events across all relevant decades with strict note relevance
  const allTimelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    for (const event of events) {
      if (!event.perspectives || event.perspectives.length === 0) continue;
      const persp = getPerspective(event);
      const { primaryDecades, allDecades, noteDecadesMap } = getEventDecades(persp.year, event.notes);

      for (const decade of allDecades) {
        const isPrimary = primaryDecades.has(decade.key);
        const relevantNotes = getRelevantNotesForDecade(event.notes, decade.key, isPrimary, noteDecadesMap);

        items.push({
          event,
          persp,
          decade,
          isPrimaryDecade: isPrimary,
          relevantNotes,
        });
      }
    }

    return items;
  }, [events, selectedCountry, activeLang]);

  // Collect unique categories and decades for filters
  const { availableCategories, availableDecades } = useMemo(() => {
    const catSet = new Set<string>();
    const decMap = new Map<string, DecadeInfo>();

    for (const item of allTimelineItems) {
      if (item.persp.category) catSet.add(item.persp.category);
      decMap.set(item.decade.key, item.decade);
    }

    const sortedDecades = Array.from(decMap.values()).sort((a, b) => a.sortKey - b.sortKey);
    const sortedCategories = Array.from(catSet).sort();

    return {
      availableCategories: sortedCategories,
      availableDecades: sortedDecades,
    };
  }, [allTimelineItems]);

  // 2. Filter items according to user selections
  const filteredItems = useMemo(() => {
    return allTimelineItems.filter((item) => {
      if (selectedDecade !== 'all' && item.decade.key !== selectedDecade) {
        return false;
      }
      if (selectedCategory !== 'all' && item.persp.category !== selectedCategory) {
        return false;
      }
      if (onlyWithNotes && item.relevantNotes.length === 0) {
        return false;
      }
      return true;
    });
  }, [allTimelineItems, selectedDecade, selectedCategory, onlyWithNotes]);

  // 3. Group filtered items by decade
  const grouped = useMemo(() => {
    const acc: Record<string, TimelineItem[]> = {};
    for (const item of filteredItems) {
      if (!acc[item.decade.key]) {
        acc[item.decade.key] = [];
      }
      acc[item.decade.key].push(item);
    }
    return acc;
  }, [filteredItems]);

  const sortedDecadeKeys = useMemo(() => {
    const keys = Object.keys(grouped);
    const keyToInfo = new Map(availableDecades.map((d) => [d.key, d]));
    return keys.sort((a, b) => {
      const aKey = keyToInfo.get(a)?.sortKey ?? 0;
      const bKey = keyToInfo.get(b)?.sortKey ?? 0;
      return aKey - bKey;
    });
  }, [grouped, availableDecades]);

  const hasActiveFilters = selectedDecade !== 'all' || selectedCategory !== 'all' || onlyWithNotes;

  // Multi-language UI labels
  const ui = {
    filterLabel: activeLang === 'ja' ? '絞り込み' : activeLang === 'zh' ? '筛选' : activeLang === 'ko' ? '필터' : 'Filters',
    filterByDecade: activeLang === 'ja' ? '年代で絞り込み' : activeLang === 'zh' ? '按年代筛选' : activeLang === 'ko' ? '연대별 필터' : 'Filter by Decade',
    allDecades: activeLang === 'ja' ? '全年代' : activeLang === 'zh' ? '全部年代' : activeLang === 'ko' ? '모든 연代' : 'All Periods',
    filterByCategory: activeLang === 'ja' ? 'カテゴリ' : activeLang === 'zh' ? '分类' : activeLang === 'ko' ? '카테고리' : 'Category',
    allCategories: activeLang === 'ja' ? '全カテゴリ' : activeLang === 'zh' ? '全部分类' : activeLang === 'ko' ? '모든 카테고리' : 'All Categories',
    onlyWithNotesLabel: activeLang === 'ja' ? '注釈・検証ありのみ' : activeLang === 'zh' ? '仅显示有注释' : activeLang === 'ko' ? '주석/검증 있는 항목만' : 'With Notes Only',
    resetFilters: activeLang === 'ja' ? '絞り込み解除' : activeLang === 'zh' ? '重置筛选' : activeLang === 'ko' ? '필터 초기화' : 'Reset Filters',
    showingCount: (count: number, decadeCount: number) => {
      if (activeLang === 'ja') return `${count} 件の出来事 (${decadeCount} 年代)`;
      if (activeLang === 'zh') return `显示 ${count} 个事件 (${decadeCount} 个年代)`;
      if (activeLang === 'ko') return `${count}개 사건 (${decadeCount}개 연대)`;
      return `${count} items (${decadeCount} periods)`;
    },
    noResults: activeLang === 'ja' ? '条件に一致する出来事はありません' : activeLang === 'zh' ? '没有符合条件的事件' : activeLang === 'ko' ? '조건에 일치하는 사건이 없습니다' : 'No events match the selected filters',
    primaryPeriod: activeLang === 'ja' ? '主要期間' : activeLang === 'zh' ? '主要时期' : activeLang === 'ko' ? '주요 기간' : 'Main Period',
    relatedTimeline: activeLang === 'ja' ? '関連年代' : activeLang === 'zh' ? '相关年代' : activeLang === 'ko' ? '관련 연대' : 'Related Era',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Timeline Filter Controls ── */}
      <div
        className="glass"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--card-border)',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Top bar: Selectors and Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Filter size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 600 }}>{ui.filterLabel}:</span>
          </div>

          {/* Decade select */}
          <div style={{ minWidth: '150px' }}>
            <select
              aria-label={ui.filterByDecade}
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 1.8rem 0.4rem 0.75rem',
                borderRadius: '8px',
                border: selectedDecade !== 'all' ? '1px solid var(--accent)' : '1px solid var(--card-border)',
                background: selectedDecade !== 'all' ? 'rgba(var(--accent-rgb, 139,92,246),0.12)' : 'rgba(255,255,255,0.04)',
                color: selectedDecade !== 'all' ? '#fff' : 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.6rem center',
                backgroundSize: '0.85em',
              }}
            >
              <option value="all" style={{ background: '#121216' }}>{ui.allDecades} ({availableDecades.length})</option>
              {availableDecades.map((d) => (
                <option key={d.key} value={d.key} style={{ background: '#121216' }}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category select */}
          <div style={{ minWidth: '160px' }}>
            <select
              aria-label={ui.filterByCategory}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 1.8rem 0.4rem 0.75rem',
                borderRadius: '8px',
                border: selectedCategory !== 'all' ? '1px solid var(--accent)' : '1px solid var(--card-border)',
                background: selectedCategory !== 'all' ? 'rgba(var(--accent-rgb, 139,92,246),0.12)' : 'rgba(255,255,255,0.04)',
                color: selectedCategory !== 'all' ? '#fff' : 'var(--text-primary)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23a1a1aa\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.6rem center',
                backgroundSize: '0.85em',
              }}
            >
              <option value="all" style={{ background: '#121216' }}>{ui.allCategories} ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#121216' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* "With Notes Only" toggle button */}
          <button
            type="button"
            onClick={() => setOnlyWithNotes(!onlyWithNotes)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              border: onlyWithNotes ? '1px solid rgba(251,191,36,0.7)' : '1px solid var(--card-border)',
              background: onlyWithNotes ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.03)',
              color: onlyWithNotes ? '#fbbf24' : 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: onlyWithNotes ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            <span>📌</span>
            <span>{ui.onlyWithNotesLabel}</span>
          </button>

          {/* Reset filter button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSelectedDecade('all');
                setSelectedCategory('all');
                setOnlyWithNotes(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <RotateCcw size={12} />
              <span>{ui.resetFilters}</span>
            </button>
          )}

          {/* Count badge */}
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {ui.showingCount(filteredItems.length, sortedDecadeKeys.length)}
          </div>
        </div>

        {/* Quick jump decade chips (only shown when 'all' decades is selected) */}
        {selectedDecade === 'all' && availableDecades.length > 1 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginRight: '0.3rem' }}>
              ⚡
            </span>
            {availableDecades.map((d) => {
              const countInDecade = grouped[d.key]?.length ?? 0;
              if (countInDecade === 0) return null;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`decade-${d.key}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.73rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {d.label} ({countInDecade})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Timeline Track & Content ── */}
      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '0',
          bottom: '0',
          width: '2px',
          background: 'linear-gradient(to bottom, var(--accent), transparent)',
          borderRadius: '2px',
        }} />

        {sortedDecadeKeys.length > 0 ? (
          sortedDecadeKeys.map((decadeKey) => {
            const itemsInDecade = grouped[decadeKey] || [];
            const decadeLabel = itemsInDecade[0]?.decade.label ?? decadeKey;

            return (
              <div key={decadeKey} id={`decade-${decadeKey}`} style={{ marginBottom: '3.5rem' }}>
                {/* Decade marker & header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-6px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '2px solid var(--bg-primary)',
                    boxShadow: '0 0 12px var(--accent)',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', paddingLeft: '1rem' }}>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--accent)',
                      letterSpacing: '0.05em',
                    }}>
                      {decadeLabel}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                      ({itemsInDecade.length})
                    </span>
                  </div>
                </div>

                {/* Events in this decade */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingLeft: '1rem' }}>
                  {itemsInDecade.map(({ event, persp, relevantNotes, isPrimaryDecade }) => {
                    const color = getCategoryColor(persp.category);
                    const hasNotes = relevantNotes.length > 0;

                    return (
                      <div key={`${event.id}-${decadeKey}`}>
                        <Link
                          href={eventLink(event.id)}
                          style={{ display: 'block', textDecoration: 'none' }}
                        >
                          <div
                            className="card glass"
                            style={{
                              display: 'flex',
                              gap: '1.5rem',
                              padding: '1.2rem 1.5rem',
                              borderRadius: hasNotes ? '12px 12px 0 0' : '12px',
                              border: '1px solid var(--card-border)',
                              borderLeft: `3px solid ${color}`,
                              borderBottom: hasNotes ? 'none' : undefined,
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.transform = 'translateX(6px)';
                              (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${color}33`;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                              (e.currentTarget as HTMLElement).style.boxShadow = '';
                            }}
                          >
                            {/* Thumbnail */}
                            {event.imageUrl && (
                              <div style={{
                                flexShrink: 0,
                                width: '68px',
                                height: '68px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}>
                                <img
                                  src={event.imageUrl}
                                  alt={persp.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: `${color}22`,
                                  color: color,
                                  fontWeight: 600,
                                }}>
                                  {persp.category}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.07)',
                                  color: 'var(--text-secondary)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}>
                                  <Calendar size={11} />
                                  {persp.year}
                                </span>
                                {persp.location && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.07)',
                                    color: 'var(--text-secondary)',
                                  }}>
                                    📍 {persp.location}
                                  </span>
                                )}
                                {!isPrimaryDecade && (
                                  <span style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 7px',
                                    borderRadius: '10px',
                                    background: 'rgba(var(--accent-rgb, 139,92,246),0.15)',
                                    color: 'var(--accent)',
                                    fontWeight: 600,
                                  }}>
                                    {ui.relatedTimeline}
                                  </span>
                                )}
                                {hasNotes && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: 'rgba(251,191,36,0.14)',
                                    color: '#fbbf24',
                                    fontWeight: 600,
                                  }}>
                                    📌 {relevantNotes.length} {activeLang === 'ja' ? '注釈' : activeLang === 'zh' ? '注释' : activeLang === 'ko' ? '주석' : 'notes'}
                                  </span>
                                )}
                              </div>

                              <h3 style={{
                                fontSize: '1.05rem',
                                fontWeight: 700,
                                marginBottom: '0.35rem',
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {persp.title}
                              </h3>
                              <p style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                margin: 0,
                                lineHeight: 1.5,
                              }}>
                                {persp.content.slice(0, 120)}...
                              </p>
                            </div>

                            {/* Countries */}
                            <div style={{
                              flexShrink: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.3rem',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                            }}>
                              {event.perspectives.map((p) => (
                                <span key={p.country} style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: p.country === selectedCountry
                                    ? 'rgba(224,46,46,0.18)'
                                    : 'rgba(255,255,255,0.05)',
                                  color: p.country === selectedCountry
                                    ? '#f87171'
                                    : 'var(--text-secondary)',
                                  border: p.country === selectedCountry
                                    ? '1px solid rgba(224,46,46,0.35)'
                                    : '1px solid rgba(255,255,255,0.06)',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {p.country}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Link>

                        {/* Annotation panel: Strictly filtered to notes relevant to THIS decade */}
                        {hasNotes && (
                          <div
                            className="glass"
                            style={{
                              padding: '0.8rem 1.5rem',
                              borderRadius: '0 0 12px 12px',
                              border: '1px solid var(--card-border)',
                              borderLeft: `3px solid ${color}`,
                              borderTop: `1px dashed ${color}33`,
                              background: 'rgba(0,0,0,0.15)',
                            }}
                          >
                            <AnnotationPanel notes={relevantNotes} lang={lang} color={color} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="glass"
            style={{
              padding: '3rem',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              border: '1px solid var(--card-border)',
            }}
          >
            {ui.noResults}
          </div>
        )}
      </div>
    </div>
  );
}

