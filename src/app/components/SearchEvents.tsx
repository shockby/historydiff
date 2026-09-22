'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Calendar, Layers, ArrowRight, Search, X } from 'lucide-react';
import { EventPerspective, EventNote, EventOngoing } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';

// Clean markdown markup and format excerpt cleanly
function cleanExcerpt(text: string, maxLength: number = 110): string {
  const stripped = text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength) + '...';
}

// Dynamically import client widgets to avoid SSR issues
const MiniDiffDemo = dynamic(() => import('./MiniDiffDemo'), { ssr: false });
const InteractiveHub = dynamic(() => import('./InteractiveHub'), { ssr: false });
const WelcomeModal = dynamic(() => import('./WelcomeModal'), { ssr: false });

interface SearchEventsProps {
  initialEvents: {
    id: string;
    perspectives: EventPerspective[];
    imageUrl?: string;
    notes?: EventNote[];
    ongoing?: EventOngoing | null;
  }[];
  lang: string;
}

function SearchEventsInner({ initialEvents, lang }: SearchEventsProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;
  const events = initialEvents || [];

  // Popular search keyword suggestions
  const quickTags = activeLang === 'ja'
    ? ['慰安婦', '南京事件', '朝鮮戦争', '北方領土', 'フォークランド紛争', '中東戦争']
    : activeLang === 'zh'
    ? ['慰安妇', '南京大屠杀', '朝鲜战争', '福克兰战争', '中东战争', '冷战']
    : activeLang === 'ko'
    ? ['위안부', '난징', '한국전쟁', '포클랜드 전쟁', '중동전쟁', '냉전']
    : ['Comfort Women', 'Nanjing', 'Korean War', 'Falklands', 'Middle East', 'Cold War'];

  // Home and archive links
  const archiveLink = activeLang === 'en' ? '/events' : `/${activeLang}/events`;
  const eventLink = (id: string) => activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`;

  // Default preferred country perspective
  const getPreferredPerspective = (event: { perspectives: EventPerspective[] }): EventPerspective => {
    if (activeLang === 'ja') {
      const jp = event.perspectives.find((p) => p.country === '日本');
      if (jp) return jp;
    } else if (activeLang === 'ko') {
      const ko = event.perspectives.find((p) => p.country === '한국' || p.country === '대한민국');
      if (ko) return ko;
    } else if (activeLang === 'zh') {
      const zh = event.perspectives.find((p) => p.country === '中国' || p.country === '中華民國');
      if (zh) return zh;
    }
    return event.perspectives[0]!;
  };

  // Real-time search filtering
  const filteredEvents = searchTerm.trim()
    ? events.filter((event) => {
        const query = searchTerm.toLowerCase();
        const first = event.perspectives[0];
        if (!first) return false;
        return (
          first.title.toLowerCase().includes(query) ||
          first.category.toLowerCase().includes(query) ||
          event.perspectives.some((p) => p.country.toLowerCase().includes(query)) ||
          event.perspectives.some((p) => p.content.toLowerCase().includes(query))
        );
      })
    : events;

  // Select top 6 events for the recent archives / search results showcase
  const displayEvents = filteredEvents.slice(0, 6);

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome & Onboarding Modal for first-time visitors */}
      <WelcomeModal lang={lang} />

      {/* ── 1. Hero Section (Clean White) ── */}
      <section className="section-full section-white" style={{ padding: '4.5rem 0 2rem', textAlign: 'center' }}>
        <div className="container" style={{ padding: '0 1.5rem' }}>
          <h1 className="title-gradient" style={{ fontSize: '3.2rem', marginBottom: '1.5rem', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            {t.heroTitleLine1}<br />
            {t.heroTitleLine2}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
            {t.heroDesc}
          </p>

          {/* ── Search Input Field ── */}
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1.25rem',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="search-input"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    router.push(`${archiveLink}?q=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.95rem 3.2rem 0.95rem 3.3rem',
                  borderRadius: '30px',
                  border: '1px solid var(--card-border)',
                  background: '#ffffff',
                  fontSize: '1rem',
                  color: 'var(--foreground)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '1.1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '50%',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Quick Search Tag Suggestions */}
            <div style={{
              display: 'flex',
              gap: '0.45rem',
              marginTop: '0.9rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}>
              <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                {activeLang === 'ja' ? '注目キーワード:' : activeLang === 'zh' ? '热门关键词:' : activeLang === 'ko' ? '인기 키워드:' : 'Popular:'}
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchTerm(tag)}
                  style={{
                    background: searchTerm === tag ? '#fff1f2' : '#f8fafc',
                    border: searchTerm === tag ? '1px solid #fecdd3' : '1px solid var(--card-border)',
                    color: searchTerm === tag ? '#dc2626' : 'var(--text-secondary)',
                    borderRadius: '16px',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Recent Archives Showcase (Clean White) ── */}
      <section id="events-archive-section" className="section-full section-white" style={{ padding: '1rem 0 4rem' }}>
        <div className="container" style={{ padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, borderLeft: '4px solid var(--accent)', paddingLeft: '1rem', color: 'var(--foreground)', lineHeight: 1.2 }}>
                {searchTerm.trim() ? (
                  activeLang === 'ja' ? `「${searchTerm}」の検索結果` :
                  activeLang === 'zh' ? `“${searchTerm}”的搜索结果` :
                  activeLang === 'ko' ? `"${searchTerm}" 검색 결과` :
                  `Search Results for "${searchTerm}"`
                ) : t.recentArchiveTitle}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', marginTop: '0.5rem', paddingLeft: '1rem' }}>
                {searchTerm.trim() ? (
                  activeLang === 'ja' ? `該当件数: ${filteredEvents.length}件` :
                  activeLang === 'zh' ? `匹配项: ${filteredEvents.length}条` :
                  activeLang === 'ko' ? `검색 결과: ${filteredEvents.length}건` :
                  `${filteredEvents.length} matching event${filteredEvents.length !== 1 ? 's' : ''}`
                ) : t.recentArchiveSubtitle}
              </p>
            </div>
            <Link
              href={searchTerm.trim() ? `${archiveLink}?q=${encodeURIComponent(searchTerm.trim())}` : archiveLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              <span>
                {searchTerm.trim()
                  ? (activeLang === 'ja' ? '一覧で詳細に絞り込む' : activeLang === 'zh' ? '在列表中详细筛选' : activeLang === 'ko' ? '목록에서 상세 필터링' : 'Filter in Archive List')
                  : t.archive}
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Cards Grid */}
          {displayEvents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {displayEvents.map((event) => {
                const persp = getPreferredPerspective(event);
                return (
                  <Link href={eventLink(event.id)} key={event.id} style={{ display: 'flex' }}>
                    <div
                      title={persp.title}
                      className="card"
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid var(--card-border)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {event.imageUrl && (
                        <div className="card-image-container">
                          <img
                            src={event.imageUrl}
                            alt={persp.title}
                            loading="lazy"
                            className="card-image"
                          />
                        </div>
                      )}
                      <div className="card-content">
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {event.ongoing?.isOngoing && (
                            <span
                              className="badge"
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.6rem',
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#ef4444',
                                  display: 'inline-block',
                                }}
                              />
                              {t.ongoingBadge}
                            </span>
                          )}
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(220, 38, 38, 0.08)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(220, 38, 38, 0.3)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.65rem',
                            }}
                          >
                            {persp.country}
                          </span>
                          <span className="badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {persp.category}
                          </span>
                          <span className="badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} style={{ opacity: 0.7 }} />
                            {persp.year}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.6rem', color: 'var(--foreground)' }}>
                          {persp.title}
                        </h3>
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.86rem',
                          lineHeight: 1.55,
                          marginBottom: '1.1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {cleanExcerpt(persp.content, 110)}
                        </p>
                        <div style={{
                          marginTop: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--card-border)',
                          paddingTop: '0.75rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          gap: '0.5rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                            <Layers size={13} style={{ opacity: 0.7 }} />
                            <span>{t.compareTarget}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {event.perspectives.map((p) => (
                              <span
                                key={p.country}
                                style={{
                                  padding: '2px 7px',
                                  borderRadius: '10px',
                                  fontSize: '0.72rem',
                                  background: '#f1f5f9',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--card-border)',
                                }}
                              >
                                {p.country}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px dashed var(--card-border)',
              marginBottom: '2.5rem',
            }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                {t.noResults}
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '20px',
                  border: '1px solid var(--card-border)',
                  background: '#ffffff',
                  color: 'var(--foreground)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {activeLang === 'ja' ? '検索をクリアして最新アーカイブを表示' :
                 activeLang === 'zh' ? '清空搜索并显示最新档案' :
                 activeLang === 'ko' ? '검색어 초기화 및 최근 아카이브 보기' :
                 'Clear search and show recent archives'}
              </button>
            </div>
          )}

          {/* Call To Action Banner to Full Archive */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid var(--card-border)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '0.8rem' }}>
              {t.archivePageTitle}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
              {t.archiveExploreHint}
            </p>
            <Link
              href={searchTerm.trim() ? `${archiveLink}?q=${encodeURIComponent(searchTerm.trim())}` : archiveLink}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.95rem 2.4rem',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(220, 38, 38, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(220, 38, 38, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.35)';
              }}
            >
              <span>
                {searchTerm.trim() && filteredEvents.length > 6
                  ? (activeLang === 'ja' ? `「${searchTerm}」の全 ${filteredEvents.length} 件を一覧で見る →` :
                     activeLang === 'zh' ? `查看“${searchTerm}”的全部 ${filteredEvents.length} 条结果 →` :
                     activeLang === 'ko' ? `"${searchTerm}" 전체 ${filteredEvents.length}건 목록 보기 →` :
                     `View all ${filteredEvents.length} results for "${searchTerm}" →`)
                  : t.viewAllArchives(events.length)}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Mini Diff Demo Section (Subtle Slate Tint) ── */}
      <section className="section-full section-slate" style={{ padding: '2.5rem 0' }}>
        <div className="container" style={{ padding: '0 1.5rem' }}>
          <MiniDiffDemo lang={lang} />
        </div>
      </section>

      {/* ── 4. Ongoing Issues Showcase (Subtle Rose Tint) ── */}
      {events.some((e) => e.ongoing?.isOngoing) && (
        <section className="section-full section-rose" style={{ padding: '3.5rem 0' }}>
          <div className="container" style={{ padding: '0 1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#dc2626',
                    boxShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
                    display: 'inline-block',
                  }}
                />
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>
                  {t.ongoingSectionTitle}
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', margin: 0 }}>
                {t.ongoingSectionSubtitle}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {events
                .filter((e) => e.ongoing?.isOngoing)
                .slice(0, 3)
                .map((event) => {
                  const persp = event.perspectives[0];
                  if (!persp) return null;
                  const ongoing = event.ongoing!;
                  const whyShort = (ongoing.whyItMatters[activeLang] ?? ongoing.whyItMatters.en) ?? ongoing.whyItMatters.ja ?? '';
                  const watchShort = (ongoing.whatToWatchNext[activeLang] ?? ongoing.whatToWatchNext.en) ?? ongoing.whatToWatchNext.ja ?? '';
                  const firstWatchPoint = watchShort.split('\n')[0] || '';

                  return (
                    <Link href={eventLink(event.id)} key={event.id} style={{ textDecoration: 'none', display: 'flex' }}>
                      <div
                        className="card"
                        style={{
                          padding: '1.6rem',
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          background: '#ffffff',
                          border: '1px solid rgba(220, 38, 38, 0.3)',
                          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)',
                          transition: 'all 0.22s ease',
                        }}
                      >
                        {/* Top Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(220, 38, 38, 0.1)',
                              color: '#dc2626',
                              border: '1px solid rgba(220, 38, 38, 0.3)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            ● {t.ongoingBadge}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {t.lastUpdated}: {ongoing.lastUpdated}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--foreground)', lineHeight: 1.35 }}>
                          {persp.title}
                        </h3>

                        {/* Why it matters preview */}
                        <p
                          style={{
                            fontSize: '0.88rem',
                            lineHeight: 1.65,
                            color: 'var(--text-secondary)',
                            marginBottom: '1.2rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {whyShort}
                        </p>

                        {/* Next Watch Point Preview */}
                        {firstWatchPoint && (
                          <div
                            style={{
                              marginTop: 'auto',
                              padding: '0.75rem 0.9rem',
                              borderRadius: '8px',
                              background: '#fff1f2',
                              border: '1px solid #fecdd3',
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                            }}
                          >
                            <span style={{ fontWeight: 700, flexShrink: 0, color: '#dc2626' }}>⚡</span>
                            <span style={{ color: 'var(--foreground)', lineHeight: 1.45 }}>
                              {firstWatchPoint.replace(/^[0-9]+[.\-、]\s*/, '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Interactive Exploration Lab (Subtle Purple Tint) ── */}
      <section className="section-full section-purple" style={{ padding: '3rem 0' }}>
        <div className="container" style={{ padding: '0 1.5rem' }}>
          <InteractiveHub events={events} lang={lang} />
        </div>
      </section>

      {/* ── 6. About Section (Subtle Slate Tint) ── */}
      <section id="about" className="section-full section-slate" style={{ padding: '4.5rem 0' }}>
        <div className="container" style={{ padding: '0 1.5rem' }}>
          <div
            style={{
              background: '#ffffff',
              padding: '3rem',
              borderRadius: '20px',
              border: '1px solid var(--card-border)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 800, borderLeft: '4px solid var(--accent)', paddingLeft: '1rem', color: 'var(--foreground)' }}>
              {t.aboutTitle}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', lineHeight: '1.8' }}>
              <div>
                <p style={{ color: 'var(--foreground)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  {t.aboutText1}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  {t.aboutText2}
                </p>
              </div>
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {t.aboutFeaturesTitle}
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.aboutFeature1}</span>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.aboutFeature2}</span>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>✓</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.aboutFeature3}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function SearchEvents({ initialEvents, lang }: SearchEventsProps) {
  return (
    <Suspense fallback={
      <section className="section-full section-white" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            HistoryDiff
          </h1>
        </div>
      </section>
    }>
      <SearchEventsInner initialEvents={initialEvents} lang={lang} />
    </Suspense>
  );
}
