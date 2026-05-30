'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Shield, BookOpen, Newspaper, Globe, Archive, Building } from 'lucide-react';
import { translations, Language } from '@/lib/translations';

interface NoteSource {
  title: string;
  url: string;
  publisher: string;
  type: 'government' | 'academic' | 'media' | 'ngo' | 'international' | 'archive';
}

interface EventNote {
  id: string;
  claim: string;
  context: string;
  verdict: string;
  sources: NoteSource[];
}

interface CommunityNotesProps {
  notes: EventNote[];
  lang: Language;
}

function getVerdictStyle(verdict: string) {
  const lower = verdict.toLowerCase();
  
  // Safe language-independent verdict coloring check
  if (
    lower.includes('公式') || 
    lower.includes('事実') || 
    lower.includes('official') || 
    lower.includes('fact') || 
    lower.includes('官方') || 
    lower.includes('已确认') ||
    lower.includes('存在')
  ) {
    return { color: '#3fb950', bg: 'rgba(46, 160, 67, 0.12)', border: 'rgba(46, 160, 67, 0.3)' };
  }
  
  if (
    lower.includes('議論') || 
    lower.includes('差異') || 
    lower.includes('幅あり') || 
    lower.includes('解釈') || 
    lower.includes('dispute') || 
    lower.includes('differ') || 
    lower.includes('interpret') || 
    lower.includes('争议') || 
    lower.includes('分歧') || 
    lower.includes('解释') ||
    lower.includes('誤報') ||
    lower.includes('誇張') ||
    lower.includes('exaggerat') ||
    lower.includes('misleading')
  ) {
    return { color: '#d29922', bg: 'rgba(210, 153, 34, 0.12)', border: 'rgba(210, 153, 34, 0.3)' };
  }
  
  return { color: '#8b949e', bg: 'rgba(139, 148, 158, 0.12)', border: 'rgba(139, 148, 158, 0.3)' };
}

function getSourceIcon(type: string) {
  switch (type) {
    case 'government': return <Building size={13} />;
    case 'academic': return <BookOpen size={13} />;
    case 'media': return <Newspaper size={13} />;
    case 'ngo': return <Shield size={13} />;
    case 'international': return <Globe size={13} />;
    case 'archive': return <Archive size={13} />;
    default: return <ExternalLink size={13} />;
  }
}

function getSourceTypeLabel(type: string, lang: Language) {
  if (lang === 'ja') {
    switch (type) {
      case 'government': return '政府公式';
      case 'academic': return '学術';
      case 'media': return 'メディア';
      case 'ngo': return 'NGO';
      case 'international': return '国際機関';
      case 'archive': return '公文書';
      default: return 'その他';
    }
  } else if (lang === 'zh') {
    switch (type) {
      case 'government': return '官方政府';
      case 'academic': return '学术';
      case 'media': return '媒体';
      case 'ngo': return 'NGO';
      case 'international': return '国际机构';
      case 'archive': return '档案文献';
      default: return '其他';
    }
  } else {
    switch (type) {
      case 'government': return 'Government';
      case 'academic': return 'Academic';
      case 'media': return 'Media';
      case 'ngo': return 'NGO';
      case 'international': return 'International';
      case 'archive': return 'Archive';
      default: return 'Other';
    }
  }
}

function NoteCard({ note, lang }: { note: EventNote; lang: Language }) {
  const [expanded, setExpanded] = useState(false);
  const verdictStyle = getVerdictStyle(note.verdict);
  
  const sourcesHeader = lang === 'ja' ? '出典・証跡' : lang === 'zh' ? '出处与凭证' : 'Sources & Evidence';

  return (
    <div
      className="community-note-card"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          minWidth: '28px',
          height: '28px',
          borderRadius: '8px',
          background: verdictStyle.bg,
          border: `1px solid ${verdictStyle.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2px',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={verdictStyle.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--foreground)',
            lineHeight: 1.5,
            marginBottom: '0.4rem',
          }}>
            {note.claim}
          </p>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: verdictStyle.color,
            background: verdictStyle.bg,
            border: `1px solid ${verdictStyle.border}`,
          }}>
            {note.verdict}
          </span>
        </div>
        <div style={{
          color: 'var(--text-secondary)',
          flexShrink: 0,
          marginTop: '4px',
          transition: 'transform 0.2s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <ChevronDown size={16} />
        </div>
      </button>

      {/* Expandable content */}
      <div style={{
        maxHeight: expanded ? '600px' : '0',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.4s ease, opacity 0.3s ease',
      }}>
        <div style={{
          padding: '0 1.25rem 1.25rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {/* Context */}
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}>
              {note.context}
            </p>
          </div>

          {/* Sources */}
          <div>
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {sourcesHeader}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {note.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    color: 'var(--foreground)',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}>
                    {getSourceIcon(source.type)}
                    {getSourceTypeLabel(source.type, lang)}
                  </span>
                  <span style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {source.title}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', flexShrink: 0 }}>
                    {source.publisher}
                  </span>
                  <ExternalLink size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CommunityNotes({ notes, lang }: CommunityNotesProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleNotes = showAll ? notes : notes.slice(0, 3);
  const t = translations[lang] || translations.en;
  
  const subTitle = lang === 'ja' 
    ? '記述内容に関する証跡・出典リンクと文脈の補足' 
    : lang === 'zh'
    ? '关于记述内容的凭证、出处链接与背景补充'
    : 'Evidence, source links, and contextual annotations regarding descriptions.';

  return (
    <section style={{ marginTop: '3rem' }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            {t.communityNotesTitle}
          </h3>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginTop: '2px',
          }}>
            {subTitle}
          </p>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '4px 10px',
          borderRadius: '12px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#818cf8',
        }}>
          {t.sourcesCount(notes.length)}
        </div>
      </div>

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {visibleNotes.map((note) => (
          <NoteCard key={note.id} note={note} lang={lang} />
        ))}
      </div>

      {/* Show more/less toggle */}
      {notes.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem',
            marginTop: '0.75rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          {showAll ? (
            <>
              <ChevronUp size={16} />
              {t.showLess}
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              {t.showMore(notes.length - 3)}
            </>
          )}
        </button>
      )}
    </section>
  );
}
