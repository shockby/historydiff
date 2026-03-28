'use client';

import { useState } from 'react';
import DiffView from '@/app/components/DiffView';
import { EventPerspective } from '@/lib/markdown';
import { Columns, Info, CheckCircle2, ChevronDown } from 'lucide-react';

interface EventPageClientProps {
  initialPerspectives: EventPerspective[];
}

export default function EventPageClient({ initialPerspectives }: EventPageClientProps) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(1);
  const [showMeta, setShowMeta] = useState(true);

  const left = initialPerspectives[leftIndex];
  const right = initialPerspectives[rightIndex];

  return (
    <div className="container" style={{ paddingBottom: '10rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <span className="badge" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>アーカイブ</span>
          <span className="badge">{left.category}</span>
          <span className="badge">{left.year}</span>
          <span className="badge">{left.location}</span>
        </div>
        <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{left.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '900px' }}>
          歴史教科書における記述の差異を比較します。左側と右側のドロップダウンから比較したい国を選択してください。
        </p>
      </header>

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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Columns size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>差分ビュアー (Side-by-Side)</span>
        </div>
        <div style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#f85149' }}>● 削除または差異</span> <span style={{ margin: '0 0.5rem' }}>|</span> <span style={{ color: '#3fb950' }}>● 追加または差異</span>
        </div>
      </div>

      <DiffView 
        oldValue={left.content}
        newValue={right.content}
        oldTitle={`${left.country} の記述内容`}
        newTitle={`${right.country} の記述内容`}
      />

      <section style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
          <Info size={20} />
          <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>この比較についての補足</h4>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.8' }}>
          この比較は、各国の公式または広く使われている歴史教科書の一般的記述に基づいています。
          翻訳の過程で細かなニュアンスが変化する可能性がありますが、主要な事象の捉え方や、記述の順序、重視されている点の違いを浮き彫りにすることを目的としています。
          特に「{left.country}」と「{right.country}」の間では、事象の呼称や発生の背景についての解釈に顕著な差異が見られます。
        </p>
      </section>
    </div>
  );
}
