'use client';

import { useState, useEffect } from 'react';
import DiffView from '@/app/components/DiffView';
import CommunityNotes from '@/app/components/CommunityNotes';
import { EventPerspective } from '@/lib/markdown';
import { Columns, Rows3, Info, CheckCircle2, ArrowLeftRight } from 'lucide-react';

interface EventNote {
  id: string;
  claim: string;
  context: string;
  verdict: string;
  sources: {
    title: string;
    url: string;
    publisher: string;
    type: 'government' | 'academic' | 'media' | 'ngo' | 'international' | 'archive';
  }[];
}

interface EventPageClientProps {
  initialPerspectives: EventPerspective[];
  notes: EventNote[];
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

/* Card-based mobile summary for each perspective */
function MobileSummaryCards({ perspectives }: { perspectives: EventPerspective[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const p = perspectives[activeTab];

  return (
    <section className="card glass" style={{ marginBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
        <CheckCircle2 size={18} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>各国の視点まとめ</h3>
      </div>

      {/* Tab pills */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {perspectives.map((per, idx) => (
          <button
            key={per.country}
            onClick={() => setActiveTab(idx)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '20px',
              border: activeTab === idx ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === idx ? 'rgba(224, 46, 46, 0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === idx ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {per.country}
          </button>
        ))}
      </div>

      {/* Active card content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>タイトル</span>
          <span style={{ color: 'var(--foreground)', textAlign: 'right', maxWidth: '60%' }}>{p.title}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>カテゴリー</span>
          <span className="badge">{p.category}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>年代</span>
          <span style={{ color: 'var(--foreground)' }}>{p.year}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>出典</span>
          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'right', maxWidth: '60%' }}>{p.source}</span>
        </div>
        <div style={{ padding: '0.5rem 0' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>冒頭の記述</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{p.content.trim().split('\n')[0].slice(0, 150)}…</span>
        </div>
      </div>

      {/* Swipe hint */}
      <div style={{
        marginTop: '0.75rem',
        textAlign: 'center',
        fontSize: '0.7rem',
        color: 'rgba(255,255,255,0.25)',
      }}>
        タブを切り替えて各国の視点を確認
      </div>
    </section>
  );
}

/* Desktop table summary */
function DesktopSummaryTable({ perspectives }: { perspectives: EventPerspective[] }) {
  return (
    <section className="card glass" style={{ marginBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--foreground)' }}>
        <CheckCircle2 size={18} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>各国の視点まとめ</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.85rem',
          minWidth: `${perspectives.length * 180}px`,
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--card-border)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                width: '100px',
              }}>項目</th>
              {perspectives.map((p) => (
                <th key={p.country} style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid var(--card-border)',
                  color: 'var(--foreground)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>{p.country}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 600 }}>タイトル</td>
              {perspectives.map((p) => (
                <td key={p.country + '-title'} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--foreground)' }}>{p.title}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 600 }}>カテゴリー</td>
              {perspectives.map((p) => (
                <td key={p.country + '-cat'} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--foreground)' }}>
                  <span className="badge">{p.category}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 600 }}>年代</td>
              {perspectives.map((p) => (
                <td key={p.country + '-year'} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--foreground)' }}>{p.year}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontWeight: 600 }}>出典</td>
              {perspectives.map((p) => (
                <td key={p.country + '-src'} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>{p.source}</td>
              ))}
            </tr>
            <tr>
              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>冒頭の記述</td>
              {perspectives.map((p) => (
                <td key={p.country + '-excerpt'} style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5 }}>{p.content.trim().split('\n')[0].slice(0, 120)}…</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function EventPageClient({ initialPerspectives, notes }: EventPageClientProps) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(1);
  const isMobile = useIsMobile();

  const left = initialPerspectives[leftIndex];
  const right = initialPerspectives[rightIndex];

  /* Quick swap left/right */
  const handleSwap = () => {
    setLeftIndex(rightIndex);
    setRightIndex(leftIndex);
  };

  return (
    <div className="container" style={{ paddingBottom: '10rem', padding: isMobile ? '1rem' : '2rem' }}>
      <header style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>アーカイブ</span>
          <span className="badge">{left.category}</span>
          <span className="badge">{left.year}</span>
          <span className="badge">{left.location}</span>
        </div>
        <h2 className="title-gradient" style={{ fontSize: isMobile ? '1.6rem' : '2.5rem', marginBottom: '1rem' }}>{left.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.9rem' : '1.1rem', maxWidth: '900px' }}>
          歴史教科書における記述の差異を比較します。{isMobile ? '' : '左側と右側の'}ドロップダウンから比較したい国を選択してください。
        </p>
      </header>

      {/* Summary section: tab cards on mobile, table on desktop */}
      {isMobile ? (
        <MobileSummaryCards perspectives={initialPerspectives} />
      ) : (
        <DesktopSummaryTable perspectives={initialPerspectives} />
      )}

      {/* Perspective selectors */}
      {isMobile ? (
        /* Mobile: stacked with swap button */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="card glass" style={{ borderLeft: '4px solid #f85149', padding: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
              比較元
            </label>
            <select 
              value={leftIndex} 
              onChange={(e) => setLeftIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              {initialPerspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{p.country} の記述</option>
              ))}
            </select>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              出典: <span style={{ fontStyle: 'italic' }}>{left.source}</span>
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            style={{
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeftRight size={14} />
            入れ替え
          </button>

          <div className="card glass" style={{ borderLeft: '4px solid #3fb950', padding: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>
              比較先
            </label>
            <select 
              value={rightIndex} 
              onChange={(e) => setRightIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              {initialPerspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{p.country} の記述</option>
              ))}
            </select>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              出典: <span style={{ fontStyle: 'italic' }}>{right.source}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop: side-by-side */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card glass" style={{ borderLeft: '4px solid #f85149' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              視点(比較元)
            </label>
            <select 
              value={leftIndex} 
              onChange={(e) => setLeftIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              {initialPerspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{p.country} の記述</option>
              ))}
            </select>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              出典: <span style={{ fontStyle: 'italic' }}>{left.source}</span>
            </div>
          </div>

          <div className="card glass" style={{ borderLeft: '4px solid #3fb950' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              視点(比較先)
            </label>
            <select 
              value={rightIndex} 
              onChange={(e) => setRightIndex(Number(e.target.value))}
              style={{ width: '100%', background: 'transparent', color: 'white', border: 'none', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
            >
              {initialPerspectives.map((p, idx) => (
                <option key={idx} value={idx} style={{ background: '#1a1a1a' }}>{p.country} の記述</option>
              ))}
            </select>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              出典: <span style={{ fontStyle: 'italic' }}>{right.source}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          {isMobile ? <Rows3 size={18} /> : <Columns size={18} />}
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {isMobile ? '差分ビュアー (Unified)' : '差分ビュアー (Side-by-Side)'}
          </span>
        </div>
        <div style={{
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)',
          fontSize: isMobile ? '0.7rem' : '0.8rem',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ color: '#f85149' }}>● 削除/差異</span>
          <span style={{ margin: '0 0.3rem' }}>|</span>
          <span style={{ color: '#3fb950' }}>● 追加/差異</span>
        </div>
      </div>

      <DiffView 
        oldValue={left.content}
        newValue={right.content}
        oldTitle={`${left.country} の記述内容`}
        newTitle={`${right.country} の記述内容`}
      />

      {/* Community Notes Section */}
      {notes.length > 0 && (
        <CommunityNotes notes={notes} />
      )}

      <section style={{ marginTop: '4rem', padding: isMobile ? '1.5rem 0' : '2rem', borderTop: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
          <Info size={20} />
          <h4 style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 700 }}>この比較についての補足</h4>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: '1.8' }}>
          この比較は、各国の公式または広く使われている歴史教科書の一般的記述に基づいています。
          翻訳の過程で細かなニュアンスが変化する可能性がありますが、主要な事象の捉え方や、記述の順序、重視されている点の違いを浮き彫りにすることを目的としています。
          特に「{left.country}」と「{right.country}」の間では、事象の呼称や発生の背景についての解釈に顕著な差異が見られます。
        </p>
      </section>
    </div>
  );
}
