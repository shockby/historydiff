'use client';

import { useState, Suspense, useMemo, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import DiffView from '@/app/components/DiffView';
import ControversyKeywords from '@/app/components/ControversyKeywords';
import CommunityNotes from '@/app/components/CommunityNotes';
import PhotoGallery from '@/app/components/PhotoGallery';
import PublicVoices from '@/app/components/PublicVoices';
import NeutralityBanner from '@/app/components/NeutralityBanner';
import SourceNatureBadges from '@/app/components/SourceNatureBadges';
const HistoryQuiz = dynamic(() => import('@/app/components/HistoryQuiz'), { ssr: false });
const PerceptionDiagnostic = dynamic(() => import('@/app/components/PerceptionDiagnostic'), { ssr: false });
import WhyItMattersSection from '@/app/components/WhyItMattersSection';
import { analyzeControversyDiff } from '@/lib/diffAnalysis';
import { EventPerspective, EventNotes, EventPhotos, EventVoices, EventOngoing } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { Info, CheckCircle2, ArrowLeftRight, BookOpen, GitCompare } from 'lucide-react';
import Link from 'next/link';

interface EventPageClientProps {
  eventId?: string;
  initialPerspectives: EventPerspective[];
  initialNotes: EventNotes | null;
  initialPhotos?: EventPhotos | null;
  initialVoices?: EventVoices | null;
  initialOngoing?: EventOngoing | null;
  lang: string;
}

type ViewMode = 'read' | 'diff';

function useIsMobile(breakpoint = 768) {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
    () => false
  );
}

// ── Perspective Switcher Bar ──────────────────────────────────────────────
interface PerspectiveSwitcherProps {
  perspectives: EventPerspective[];
  activeIndex: number;
  onSelect: (idx: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  lang: Language;
}

function PerspectiveSwitcher({
  perspectives, activeIndex, onSelect, viewMode, onViewModeChange, lang,
}: PerspectiveSwitcherProps) {
  const readLabel  = lang === 'ja' ? '読む'   : lang === 'zh' ? '阅读'   : lang === 'ko' ? '읽기'   : 'Read';
  const diffLabel  = lang === 'ja' ? '差分比較' : lang === 'zh' ? '差异比较' : lang === 'ko' ? '비교'    : 'Compare';

  return (
    <div
      style={{
        position: 'sticky',
        top: '61px', // site-header height
        zIndex: 90,
        background: 'rgba(10,10,12,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Perspective pills */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        flex: 1,
        minWidth: 0,
      }}>
        {perspectives.map((p, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '20px',
                border: active
                  ? '1px solid rgba(224,46,46,0.7)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: active
                  ? 'rgba(224,46,46,0.18)'
                  : 'rgba(255,255,255,0.04)',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.18s ease',
                outline: 'none',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {p.country}
            </button>
          );
        })}
      </div>

      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        gap: '0.3rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: '0.25rem',
        border: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {(['read', 'diff'] as ViewMode[]).map(mode => {
          const isActive = viewMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '16px',
                border: 'none',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {mode === 'read'
                ? <><BookOpen size={12} /> {readLabel}</>
                : <><GitCompare size={12} /> {diffLabel}</>
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Single Perspective Read View ──────────────────────────────────────────
function SinglePerspectiveView({
  perspective, lang, isMobile,
}: { perspective: EventPerspective; lang: Language; isMobile: boolean }) {
  const t = translations[lang] || translations.en;

  const paragraphs = perspective.content
    .split(/\n{2,}/)
    .map(s => s.replace(/\n/g, ' ').trim())
    .filter(Boolean);

  return (
    <section
      className="card glass"
      style={{
        marginBottom: '2rem',
        padding: isMobile ? '1.5rem' : '2.5rem',
        animation: 'fadeInUp 0.22s ease-out forwards',
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <span className="badge" style={{ background: 'rgba(224,46,46,0.15)', color: '#f87171', border: '1px solid rgba(224,46,46,0.3)' }}>
          {perspective.country}
        </span>
        <span className="badge">{perspective.category}</span>
        <span className="badge">{perspective.year}</span>
        <span className="badge">{perspective.location}</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: isMobile ? '1.15rem' : '1.4rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        lineHeight: 1.4,
        color: 'var(--foreground)',
      }}>
        {perspective.title}
      </h3>

      {/* Source & Nature Tags */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.source}:
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontStyle: 'italic' }}>
            {perspective.source}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {t.sourceNatureLabel}:
          </span>
          <SourceNatureBadges perspective={perspective} lang={lang} size="md" />
        </div>
      </div>

      {/* Body text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: isMobile ? '0.92rem' : '1rem',
              lineHeight: 1.85,
              color: 'var(--foreground)',
              opacity: 0.9,
            }}
            dangerouslySetInnerHTML={{
              __html: para
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>'),
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ── Desktop Summary Table ─────────────────────────────────────────────────
function DesktopSummaryTable({ perspectives, lang }: { perspectives: EventPerspective[]; lang: Language }) {
  const t = translations[lang] || translations.en;
  return (
    <section className="card glass" style={{ marginBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
        <CheckCircle2 size={18} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t.perspectiveSummary}</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: `${perspectives.length * 180}px` }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)', fontWeight: 600, width: '100px' }}>{t.tableItem}</th>
              {perspectives.map((p) => (
                <th key={p.country} style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '1px solid var(--card-border)', color: 'var(--foreground)', fontWeight: 700 }}>{p.country}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              [t.tableTitle,    (p: EventPerspective) => p.title],
              [t.tableCategory, (p: EventPerspective) => <span className="badge">{p.category}</span>],
              [t.tableEra,      (p: EventPerspective) => p.year],
              [t.tableSource,   (p: EventPerspective) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>{p.source}</span>
                  <SourceNatureBadges perspective={p} lang={lang} size="sm" />
                </div>
              )],
              [t.tableExcerpt,  (p: EventPerspective) => p.content.trim().split('\n')[0].slice(0, 120) + '…'],
            ] as [string, (p: EventPerspective) => React.ReactNode][]).map(([label, render]) => (
              <tr key={label as string}>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 600 }}>{label as string}</td>
                {perspectives.map((p) => (
                  <td key={p.country + label} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Mobile Summary Cards ──────────────────────────────────────────────────
function MobileSummaryCards({ perspectives, lang }: { perspectives: EventPerspective[]; lang: Language }) {
  const [activeTab, setActiveTab] = useState(0);
  const p = perspectives[activeTab];
  const t = translations[lang] || translations.en;
  if (!p) return null;
  return (
    <section className="card glass" style={{ marginBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
        <CheckCircle2 size={18} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t.perspectiveSummary}</h3>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {perspectives.map((per, idx) => (
          <button key={per.country} onClick={() => setActiveTab(idx)} style={{
            padding: '0.4rem 0.8rem', borderRadius: '20px',
            border: activeTab === idx ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
            background: activeTab === idx ? 'rgba(224, 46, 46, 0.15)' : 'rgba(255,255,255,0.03)',
            color: activeTab === idx ? '#fff' : 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s ease',
          }}>
            {per.country}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
        {[
          { label: t.tableTitle, value: <span key="title" style={{ color: 'var(--foreground)', textAlign: 'right', maxWidth: '60%' }}>{p.title}</span> },
          { label: t.tableCategory, value: <span key="cat" className="badge">{p.category}</span> },
          { label: t.tableEra, value: <span key="era" style={{ color: 'var(--foreground)' }}>{p.year}</span> },
          {
            label: t.tableSource,
            value: (
              <div key="src" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', maxWidth: '65%' }}>
                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'right' }}>{p.source}</span>
                <SourceNatureBadges perspective={p} lang={lang} size="sm" />
              </div>
            ),
          },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
            {item.value}
          </div>
        ))}
        <div style={{ padding: '0.5rem 0' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{t.tableExcerpt}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{p.content.trim().split('\n')[0].slice(0, 150)}…</span>
        </div>
      </div>
      <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
        {t.tabViewHint}
      </div>
    </section>
  );
}

function getDefaultPerspectiveIndex(perspectives: EventPerspective[], lang: Language): number {
  if (!perspectives || perspectives.length === 0) return 0;
  const targetCountry = (lang === 'ja')
    ? ['日本', 'japan']
    : (lang === 'zh')
    ? ['中国', 'china', '台湾', 'taiwan']
    : (lang === 'ko')
    ? ['韓国', 'korea', '대한민국']
    : ['usa', 'united states', 'アメリカ', '米国', 'uk', 'イギリス'];

  const idx = perspectives.findIndex(p => {
    const c = p.country.toLowerCase();
    return targetCountry.some(t => c.includes(t.toLowerCase()));
  });
  return idx >= 0 ? idx : 0;
}

// ── Main Event Page ───────────────────────────────────────────────────────
function EventPageInner({ eventId, initialPerspectives, initialNotes, initialPhotos, initialVoices, initialOngoing, lang }: EventPageClientProps) {
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;

  const perspectives = initialPerspectives || [];
  const notes = initialNotes?.notes || [];
  const photos = initialPhotos ?? null;
  const voices = initialVoices ?? null;
  const ongoing = initialOngoing ?? null;

  const [activeIndex, setActiveIndex]   = useState(() => getDefaultPerspectiveIndex(initialPerspectives || [], activeLang));
  const [viewMode,    setViewMode]      = useState<ViewMode>('read');
  const [rightIndex,  setRightIndex]    = useState(() => {
    const def = getDefaultPerspectiveIndex(initialPerspectives || [], activeLang);
    return def === 0 ? ((initialPerspectives?.length ?? 0) > 1 ? 1 : 0) : 0;
  });
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const left  = perspectives[activeIndex] || perspectives[0];

  // Prevent left === right in diff mode
  const safeRightIndex = rightIndex === activeIndex
    ? perspectives.findIndex((_, i) => i !== activeIndex)
    : rightIndex;
  const safeRight = perspectives[safeRightIndex] ?? perspectives[0];

  // Compute controversy analysis for active left vs right perspectives (before early return for Hook rules)
  const analysis = useMemo(() => {
    if (!left || !safeRight) {
      return {
        exclusiveOld: [],
        exclusiveNew: [],
        contrasts: [],
        stats: {
          oldWordCount: 0,
          newWordCount: 0,
          exclusiveOldCount: 0,
          exclusiveNewCount: 0,
          divergenceRate: 0,
        },
      };
    }
    return analyzeControversyDiff(left.content, safeRight.content, activeLang);
  }, [left, safeRight, activeLang]);

  const contrastTerms = useMemo(() => {
    return analysis.contrasts.flatMap((c) => [c.oldTerm, c.newTerm]);
  }, [analysis]);

  const homeLink = activeLang === 'en' ? '/' : `/${activeLang}`;

  if (perspectives.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2>{t.eventNotFound}</h2>
        <Link href={homeLink} style={{ color: 'var(--accent)', marginTop: '2rem', display: 'inline-block' }}>
          {t.backToHome}
        </Link>
      </div>
    );
  }

  const getPerspectiveLabel = (countryName: string) => {
    if (activeLang === 'ja') return `${countryName} の記述`;
    if (activeLang === 'zh') return `${countryName} 的记述`;
    return `${countryName}'s Description`;
  };

  return (
    <>
      {/* ── Sticky perspective switcher bar ── */}
      {perspectives.length > 0 && (
        <PerspectiveSwitcher
          perspectives={perspectives}
          activeIndex={activeIndex}
          onSelect={(idx) => {
            setActiveIndex(idx);
            setActiveKeyword(null);
          }}
          viewMode={viewMode}
          onViewModeChange={(m) => {
            setViewMode(m);
            setActiveKeyword(null);
          }}
          lang={activeLang}
        />
      )}

      <div className="container" style={{ paddingBottom: '10rem', padding: isMobile ? '1rem' : '2rem' }}>
        {/* ── Neutrality Declaration Banner ── */}
        <NeutralityBanner lang={activeLang} />

        {/* ── Page header ── */}
        <header style={{ marginBottom: isMobile ? '2rem' : '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>{t.archive}</span>
            {ongoing?.isOngoing && (
              <span
                className="badge"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
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
            <span className="badge">{left.category}</span>
            <span className="badge">{left.year}</span>
            <span className="badge">{left.location}</span>
          </div>
          <h2 className="title-gradient" style={{ fontSize: isMobile ? '1.6rem' : '2.5rem', marginBottom: '1rem' }}>
            {left.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.9rem' : '1.1rem', maxWidth: '900px' }}>
            {viewMode === 'read' ? t.perspectiveSummary : t.compareHelp}
          </p>
        </header>

        {/* ── Why This Matters Today & Live News (Ongoing Events) ── */}
        {ongoing?.isOngoing && <WhyItMattersSection ongoing={ongoing} lang={activeLang} />}

        {/* ── Photos ── */}
        {photos && <PhotoGallery photos={photos} lang={activeLang} />}

        {/* ── Read mode: single perspective ── */}
        {viewMode === 'read' && (
          <>
            <SinglePerspectiveView
              perspective={left}
              lang={activeLang}
              isMobile={isMobile}
            />
            {/* All-perspectives summary (collapsed) */}
            {isMobile
              ? <MobileSummaryCards perspectives={perspectives} lang={activeLang} />
              : <DesktopSummaryTable perspectives={perspectives} lang={activeLang} />
            }
          </>
        )}

        {/* ── Diff mode ── */}
        {viewMode === 'diff' && (
          <>
            {isMobile
              ? <MobileSummaryCards perspectives={perspectives} lang={activeLang} />
              : <DesktopSummaryTable perspectives={perspectives} lang={activeLang} />
            }

            {/* Left = active perspective (from switcher); Right = selectable */}
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="card glass" style={{ borderLeft: '4px solid #f85149', padding: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t.sourcePerspective}</label>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{getPerspectiveLabel(left.country)}</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '0.35rem' }}>{t.source}: <span style={{ fontStyle: 'italic', color: 'var(--foreground)' }}>{left.source}</span></div>
                    <SourceNatureBadges perspective={left} lang={activeLang} size="sm" />
                  </div>
                </div>
                <button onClick={() => {
                  const newRight = safeRightIndex;
                  setActiveIndex(newRight);
                  setRightIndex(activeIndex);
                  setActiveKeyword(null);
                }} style={{
                  alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                }}>
                  <ArrowLeftRight size={14} /> {t.swap}
                </button>
                <div className="card glass" style={{ borderLeft: '4px solid #3fb950', padding: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t.targetPerspective}</label>
                  <select value={safeRightIndex} onChange={(e) => {
                    setRightIndex(Number(e.target.value));
                    setActiveKeyword(null);
                  }}
                    style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                    {perspectives.map((p, idx) => idx !== activeIndex && (
                      <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{getPerspectiveLabel(p.country)}</option>
                    ))}
                  </select>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '0.35rem' }}>{t.source}: <span style={{ fontStyle: 'italic', color: 'var(--foreground)' }}>{safeRight.source}</span></div>
                    <SourceNatureBadges perspective={safeRight} lang={activeLang} size="sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div className="card glass" style={{ borderLeft: '4px solid #f85149' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>{t.sourcePerspective}</label>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{getPerspectiveLabel(left.country)}</div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '0.4rem' }}>{t.source}: <span style={{ fontStyle: 'italic', color: 'var(--foreground)' }}>{left.source}</span></div>
                    <SourceNatureBadges perspective={left} lang={activeLang} size="sm" />
                  </div>
                </div>
                <div className="card glass" style={{ borderLeft: '4px solid #3fb950' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>{t.targetPerspective}</label>
                  <select value={safeRightIndex} onChange={(e) => {
                    setRightIndex(Number(e.target.value));
                    setActiveKeyword(null);
                  }}
                    style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                    {perspectives.map((p, idx) => idx !== activeIndex && (
                      <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{getPerspectiveLabel(p.country)}</option>
                    ))}
                  </select>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '0.4rem' }}>{t.source}: <span style={{ fontStyle: 'italic', color: 'var(--foreground)' }}>{safeRight.source}</span></div>
                    <SourceNatureBadges perspective={safeRight} lang={activeLang} size="sm" />
                  </div>
                </div>
              </div>
            )}

            {/* ── Controversy Keywords Analysis Panel (Automatic Extraction) ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <ControversyKeywords
                analysis={analysis}
                oldCountry={left.country}
                newCountry={safeRight.country}
                lang={activeLang}
                activeKeyword={activeKeyword}
                oldFullText={left.content}
                newFullText={safeRight.content}
                onKeywordClick={(word) => {
                  setActiveKeyword((prev) => (prev === word ? null : word));
                }}
              />
            </div>

            <DiffView
              oldValue={left.content}
              newValue={safeRight.content}
              oldTitle={getPerspectiveLabel(left.country)}
              newTitle={getPerspectiveLabel(safeRight.country)}
              lang={activeLang}
              highlightKeyword={activeKeyword}
              contrastTerms={contrastTerms}
            />
          </>
        )}

        {/* ── Interactive Gamification & Diagnostic for this Event ── */}
        {perspectives.length >= 2 && (
          <div style={{ marginTop: '3.5rem' }}>
            <PerceptionDiagnostic
              lang={activeLang}
              eventId={eventId || left.id}
              perspectives={perspectives}
            />

            <HistoryQuiz
              lang={activeLang}
              eventId={eventId || left.id}
              perspectives={perspectives}
            />
          </div>
        )}

        {/* ── Community Notes & Voices (both modes) ── */}
        {notes.length > 0 && <CommunityNotes notes={notes} lang={activeLang} />}
        {voices && voices.voices.length > 0 && <PublicVoices voices={voices} lang={activeLang} />}

        {/* ── Footer note ── */}
        <section style={{ marginTop: '4rem', padding: isMobile ? '1.5rem 0' : '2rem', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
            <Info size={20} />
            <h4 style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700 }}>{t.notesTitle}</h4>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: '1.8' }}>
            {t.notesText(left.country, safeRight.country)}
          </p>
        </section>
      </div>
    </>
  );
}

export default function EventPageClient({ eventId, initialPerspectives, initialNotes, initialPhotos, initialVoices, initialOngoing, lang }: EventPageClientProps) {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    }>
      <EventPageInner
        eventId={eventId}
        initialPerspectives={initialPerspectives}
        initialNotes={initialNotes}
        initialPhotos={initialPhotos}
        initialVoices={initialVoices}
        initialOngoing={initialOngoing}
        lang={lang}
      />
    </Suspense>
  );
}
