'use client';

import React from 'react';
import { ControversyAnalysis } from '@/lib/diffAnalysis';
import { translations, Language } from '@/lib/translations';
import { Sparkles, ArrowLeftRight, Tag, TrendingUp } from 'lucide-react';

interface ControversyKeywordsProps {
  analysis: ControversyAnalysis;
  oldCountry: string;
  newCountry: string;
  lang: Language;
  onKeywordClick?: (keyword: string, side: 'old' | 'new' | 'contrast') => void;
  activeKeyword?: string | null;
}

export default function ControversyKeywords({
  analysis,
  oldCountry,
  newCountry,
  lang,
  onKeywordClick,
  activeKeyword,
}: ControversyKeywordsProps) {
  const t = translations[lang] || translations.en;

  const { exclusiveOld, exclusiveNew, contrasts, stats } = analysis;

  return (
    <div className="controversy-panel glass">
      {/* Header bar */}
      <div className="controversy-header">
        <div className="controversy-header-left">
          <div className="controversy-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>{t.controversyAnalysisTitle}</span>
          </div>
          <p className="controversy-subtitle">{t.controversyAnalysisSubtitle}</p>
        </div>

        {/* Divergence Rate Indicator */}
        <div className="divergence-rate-box" title={`${t.divergenceRateLabel}: ${stats.divergenceRate}%`}>
          <div className="divergence-label-row">
            <span className="divergence-text-label">
              <TrendingUp size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {t.divergenceRateLabel}
            </span>
            <span className="divergence-percentage">{stats.divergenceRate}%</span>
          </div>
          <div className="divergence-bar-track">
            <div
              className="divergence-bar-fill"
              style={{
                width: `${Math.max(10, Math.min(100, stats.divergenceRate))}%`,
                background:
                  stats.divergenceRate > 60
                    ? 'linear-gradient(90deg, #f97316, #ef4444)'
                    : 'linear-gradient(90deg, #eab308, #f97316)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="controversy-tip">
        <Tag size={13} style={{ flexShrink: 0, opacity: 0.8 }} />
        <span>{t.clickToHighlight}</span>
      </div>

      {/* 3-Section Grid: Left Exclusive (Red), Contrasts (Yellow), Right Exclusive (Green) */}
      <div className="controversy-grid">
        {/* Source Perspective Exclusive (Red) */}
        <div className="controversy-col col-old">
          <div className="col-header">
            <span className="side-indicator red-dot" />
            <h4 className="col-title">{t.exclusiveInSide(oldCountry)}</h4>
            <span className="count-pill red-count">{exclusiveOld.length}</span>
          </div>
          <div className="keyword-cloud">
            {exclusiveOld.length === 0 ? (
              <span className="empty-hint">-</span>
            ) : (
              exclusiveOld.map((item, idx) => {
                const isActive = activeKeyword === item.word;
                return (
                  <button
                    key={`old-${idx}-${item.word}`}
                    onClick={() => onKeywordClick?.(item.word, 'old')}
                    className={`keyword-chip chip-old ${isActive ? 'active' : ''}`}
                    title={item.sampleContext ? `“${item.sampleContext}”` : item.word}
                  >
                    <span className="chip-word">{item.word}</span>
                    {item.count > 1 && <span className="chip-count">×{item.count}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Terminology Contrasts / Paraphrasing (Yellow) */}
        {contrasts.length > 0 && (
          <div className="controversy-col col-contrast">
            <div className="col-header">
              <span className="side-indicator yellow-dot" />
              <h4 className="col-title">{t.terminologyContrastsTitle}</h4>
              <span className="count-pill yellow-count">{contrasts.length}</span>
            </div>
            <div className="contrast-list">
              {contrasts.map((c, idx) => {
                const isActiveOld = activeKeyword === c.oldTerm;
                const isActiveNew = activeKeyword === c.newTerm;
                return (
                  <div key={`contrast-${idx}`} className="contrast-item-card">
                    {c.topic && <div className="contrast-topic">{c.topic}</div>}
                    <div className="contrast-pair-row">
                      <button
                        onClick={() => onKeywordClick?.(c.oldTerm, 'old')}
                        className={`contrast-term term-old ${isActiveOld ? 'active' : ''}`}
                        title={c.oldTerm}
                      >
                        {c.oldTerm}
                      </button>
                      <ArrowLeftRight size={12} className="contrast-arrow" />
                      <button
                        onClick={() => onKeywordClick?.(c.newTerm, 'new')}
                        className={`contrast-term term-new ${isActiveNew ? 'active' : ''}`}
                        title={c.newTerm}
                      >
                        {c.newTerm}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Target Perspective Exclusive (Green) */}
        <div className="controversy-col col-new">
          <div className="col-header">
            <span className="side-indicator green-dot" />
            <h4 className="col-title">{t.exclusiveInSide(newCountry)}</h4>
            <span className="count-pill green-count">{exclusiveNew.length}</span>
          </div>
          <div className="keyword-cloud">
            {exclusiveNew.length === 0 ? (
              <span className="empty-hint">-</span>
            ) : (
              exclusiveNew.map((item, idx) => {
                const isActive = activeKeyword === item.word;
                return (
                  <button
                    key={`new-${idx}-${item.word}`}
                    onClick={() => onKeywordClick?.(item.word, 'new')}
                    className={`keyword-chip chip-new ${isActive ? 'active' : ''}`}
                    title={item.sampleContext ? `“${item.sampleContext}”` : item.word}
                  >
                    <span className="chip-word">{item.word}</span>
                    {item.count > 1 && <span className="chip-count">×{item.count}</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
