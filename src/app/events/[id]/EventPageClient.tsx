'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DiffView from '@/app/components/DiffView';
import CommunityNotes from '@/app/components/CommunityNotes';
import { EventPerspective, EventNotes } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { Columns, Rows3, Info, CheckCircle2, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

interface EventPageClientProps {
  eventId: string;
  initialPerspectives: EventPerspective[];
  initialNotes: EventNotes | null;
  lang: string;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

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
          [t.tableTitle, <span style={{ color: 'var(--foreground)', textAlign: 'right', maxWidth: '60%' }}>{p.title}</span>],
          [t.tableCategory, <span className="badge">{p.category}</span>],
          [t.tableEra, <span style={{ color: 'var(--foreground)' }}>{p.year}</span>],
          [t.tableSource, <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'right', maxWidth: '60%' }}>{p.source}</span>],
        ].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label as string}</span>
            {value as React.ReactNode}
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
              [t.tableTitle, (p: EventPerspective) => p.title],
              [t.tableCategory, (p: EventPerspective) => <span className="badge">{p.category}</span>],
              [t.tableEra, (p: EventPerspective) => p.year],
              [t.tableSource, (p: EventPerspective) => <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>{p.source}</span>],
              [t.tableExcerpt, (p: EventPerspective) => p.content.trim().split('\n')[0].slice(0, 120) + '…'],
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

function EventPageInner({ eventId, initialPerspectives, initialNotes, lang }: EventPageClientProps) {
  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;

  const perspectives = initialPerspectives || [];
  const notes = initialNotes?.notes || [];

  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(1);
  const isMobile = useIsMobile();

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

  const left = perspectives[leftIndex] || perspectives[0];
  const right = perspectives[rightIndex] || perspectives[Math.min(1, perspectives.length - 1)];

  const getPerspectiveLabel = (countryName: string) => {
    if (activeLang === 'ja') return `${countryName} の記述`;
    if (activeLang === 'zh') return `${countryName} 的记述`;
    return `${countryName}'s Description`;
  };

  return (
    <div className="container" style={{ paddingBottom: '10rem', padding: isMobile ? '1rem' : '2rem' }}>
      <header style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>{t.archive}</span>
          <span className="badge">{left.category}</span>
          <span className="badge">{left.year}</span>
          <span className="badge">{left.location}</span>
        </div>
        <h2 className="title-gradient" style={{ fontSize: isMobile ? '1.6rem' : '2.5rem', marginBottom: '1rem' }}>{left.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.9rem' : '1.1rem', maxWidth: '900px' }}>
          {t.compareHelp}
        </p>
      </header>

      {isMobile
        ? <MobileSummaryCards perspectives={perspectives} lang={activeLang} />
        : <DesktopSummaryTable perspectives={perspectives} lang={activeLang} />
      }

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="card glass" style={{ borderLeft: '4px solid #f85149', padding: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t.sourcePerspective}</label>
            <select value={leftIndex} onChange={(e) => setLeftIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              {perspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{getPerspectiveLabel(p.country)}</option>
              ))}
            </select>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.source}: <span style={{ fontStyle: 'italic' }}>{left.source}</span></div>
          </div>
          <button onClick={() => { setLeftIndex(rightIndex); setRightIndex(leftIndex); }} style={{
            alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
          }}>
            <ArrowLeftRight size={14} /> {t.swap}
          </button>
          <div className="card glass" style={{ borderLeft: '4px solid #3fb950', padding: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t.targetPerspective}</label>
            <select value={rightIndex} onChange={(e) => setRightIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              {perspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{getPerspectiveLabel(p.country)}</option>
              ))}
            </select>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.source}: <span style={{ fontStyle: 'italic' }}>{right.source}</span></div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card glass" style={{ borderLeft: '4px solid #f85149' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>{t.sourcePerspective}</label>
            <select value={leftIndex} onChange={(e) => setLeftIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              {perspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{getPerspectiveLabel(p.country)}</option>
              ))}
            </select>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.source}: <span style={{ fontStyle: 'italic' }}>{left.source}</span></div>
          </div>
          <div className="card glass" style={{ borderLeft: '4px solid #3fb950' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>{t.targetPerspective}</label>
            <select value={rightIndex} onChange={(e) => setRightIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
              {perspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{getPerspectiveLabel(p.country)}</option>
              ))}
            </select>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.source}: <span style={{ fontStyle: 'italic' }}>{right.source}</span></div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          {isMobile ? <Rows3 size={18} /> : <Columns size={18} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.diffViewer} {isMobile ? '(Unified)' : '(Side-by-Side)'}</span>
        </div>
        <div style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: isMobile ? '0.7rem' : '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#f85149' }}>{t.deletedDiff}</span>
          <span style={{ margin: '0 0.3rem' }}>|</span>
          <span style={{ color: '#3fb950' }}>{t.addedDiff}</span>
        </div>
      </div>

      <DiffView
        oldValue={left.content}
        newValue={right.content}
        oldTitle={getPerspectiveLabel(left.country)}
        newTitle={getPerspectiveLabel(right.country)}
      />

      {notes.length > 0 && <CommunityNotes notes={notes} lang={activeLang} />}

      <section style={{ marginTop: '4rem', padding: isMobile ? '1.5rem 0' : '2rem', borderTop: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
          <Info size={20} />
          <h4 style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700 }}>{t.notesTitle}</h4>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: '1.8' }}>
          {t.notesText(left.country, right.country)}
        </p>
      </section>
    </div>
  );
}

export default function EventPageClient({ eventId, initialPerspectives, initialNotes, lang }: EventPageClientProps) {
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
        lang={lang}
      />
    </Suspense>
  );
}
