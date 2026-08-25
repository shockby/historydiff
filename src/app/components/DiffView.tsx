'use client';

import { useState, useEffect, useRef, useSyncExternalStore, ReactElement } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Columns, Rows3, Terminal } from 'lucide-react';
import { translations, Language } from '@/lib/translations';

interface DiffViewProps {
  oldValue: string;
  newValue: string;
  oldTitle: string;
  newTitle: string;
  lang?: string;
  highlightKeyword?: string | null;
  contrastTerms?: string[];
}

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

export default function DiffView({
  oldValue,
  newValue,
  oldTitle,
  newTitle,
  lang = 'ja',
  highlightKeyword = null,
  contrastTerms = [],
}: DiffViewProps) {
  const isMobile = useIsMobile();
  const activeLang = (lang as Language) in translations ? (lang as Language) : 'en';
  const t = translations[activeLang] || translations.en;

  const containerRef = useRef<HTMLDivElement>(null);

  const [splitView, setSplitView] = useState<boolean>(true);
  const [compareMethod, setCompareMethod] = useState<DiffMethod>(DiffMethod.WORDS);

  // Scroll to active keyword in diff if changed
  useEffect(() => {
    if (!highlightKeyword || !containerRef.current) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const target = containerRef.current.querySelector('.diff-keyword-highlight');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [highlightKeyword, splitView, compareMethod]);

  // Content renderer helper for highlighting searched keywords and contrasting terms
  const formatDiffContent = (str: string): ReactElement => {
    if (!str) return <>{str}</>;

    const activeKey = highlightKeyword?.trim();
    const termsToHighlight = [
      ...(activeKey ? [activeKey] : []),
      ...contrastTerms,
    ].filter(Boolean);

    if (termsToHighlight.length === 0) {
      return <>{str}</>;
    }

    const escaped = termsToHighlight
      .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!escaped) return <>{str}</>;

    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = str.split(regex);

    if (parts.length <= 1) return <>{str}</>;

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = termsToHighlight.some(
            (term) => term.toLowerCase() === part.toLowerCase()
          );

          if (isMatch) {
            const isTargetActive =
              activeKey && activeKey.toLowerCase() === part.toLowerCase();

            return (
              <mark
                key={i}
                className={`diff-keyword-highlight ${isTargetActive ? 'active-focus' : 'contrast-focus'}`}
              >
                {part}
              </mark>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="diff-viewer-wrapper glass" ref={containerRef}>
      {/* ── Git Diff Terminal Header ── */}
      <div className="git-diff-terminal-header">
        <div className="terminal-window-controls">
          <span className="window-dot dot-red" />
          <span className="window-dot dot-yellow" />
          <span className="window-dot dot-green" />
          <span className="terminal-title">
            <Terminal size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
            git diff --color-words
          </span>
        </div>

        <div className="terminal-actions">
          {/* Compare Method Toggle */}
          <div className="diff-toggle-group">
            <button
              onClick={() => setCompareMethod(DiffMethod.WORDS)}
              className={`diff-toggle-btn ${compareMethod === DiffMethod.WORDS ? 'active' : ''}`}
              title={t.diffCompareWords}
            >
              {t.diffCompareWords}
            </button>
            <button
              onClick={() => setCompareMethod(DiffMethod.LINES)}
              className={`diff-toggle-btn ${compareMethod === DiffMethod.LINES ? 'active' : ''}`}
              title={t.diffCompareSentences}
            >
              {t.diffCompareSentences}
            </button>
          </div>

          {/* Split / Unified Toggle (Desktop only) */}
          {!isMobile && (
            <div className="diff-toggle-group">
              <button
                onClick={() => setSplitView(true)}
                className={`diff-toggle-btn ${splitView ? 'active' : ''}`}
                title={t.diffModeSplit}
              >
                <Columns size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {t.diffModeSplit}
              </button>
              <button
                onClick={() => setSplitView(false)}
                className={`diff-toggle-btn ${!splitView ? 'active' : ''}`}
                title={t.diffModeUnified}
              >
                <Rows3 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {t.diffModeUnified}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Git diff banner & file paths ── */}
      <div className="git-diff-info-bar">
        <div className="git-diff-command">
          <span className="git-prompt">$</span> {t.gitDiffBanner(oldTitle, newTitle)}
        </div>
        <div className="diff-legend-badges">
          <span className="legend-badge legend-red" title={t.exclusiveLegendRemoved}>
            {t.exclusiveLegendRemoved}
          </span>
          <span className="legend-badge legend-green" title={t.exclusiveLegendAdded}>
            {t.exclusiveLegendAdded}
          </span>
          <span className="legend-badge legend-yellow" title={t.exclusiveLegendContrast}>
            {t.exclusiveLegendContrast}
          </span>
        </div>
      </div>

      {/* ── Column Headers for Split View ── */}
      {splitView && (
        <div className="diff-columns-header">
          <div className="diff-col-title title-old">
            <span className="diff-sign-symbol">---</span>
            <span className="diff-header-text">{oldTitle}</span>
          </div>
          <div className="diff-columns-divider" />
          <div className="diff-col-title title-new">
            <span className="diff-sign-symbol">+++</span>
            <span className="diff-header-text">{newTitle}</span>
          </div>
        </div>
      )}

      {/* ── ReactDiffViewer ── */}
      <div className="diff-react-viewer-container">
        <ReactDiffViewer
          oldValue={oldValue}
          newValue={newValue}
          splitView={isMobile ? false : splitView}
          compareMethod={compareMethod}
          useDarkTheme={true}
          renderContent={formatDiffContent}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#0b0c10',
                addedBackground: 'rgba(34, 197, 94, 0.16)',
                addedColor: '#4ade80',
                removedBackground: 'rgba(239, 68, 68, 0.16)',
                removedColor: '#f87171',
                wordAddedBackground: 'rgba(34, 197, 94, 0.38)',
                wordRemovedBackground: 'rgba(239, 68, 68, 0.38)',
                codeFoldBackground: '#0d1117',
                codeFoldContentColor: '#8b949e',
                codeFoldGutterBackground: '#0d1117',
                emptyLineBackground: '#0b0c10',
                gutterBackground: '#090a0d',
                gutterColor: '#4b5563',
                diffViewerTitleBackground: '#0b0c10',
                diffViewerTitleColor: '#9ca3af',
                diffViewerTitleBorderColor: 'rgba(255,255,255,0.08)',
              },
            },
            line: {
              fontSize: isMobile ? '12.5px' : '14px',
              lineHeight: '1.75',
              fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              wordBreak: 'break-word',
            },
            content: {
              padding: isMobile ? '8px 6px' : '10px 14px',
            },
            gutter: {
              padding: isMobile ? '0 4px' : '0 10px',
              minWidth: isMobile ? '28px' : '40px',
              fontSize: '11px',
              userSelect: 'none' as const,
            },
          }}
        />
      </div>
    </div>
  );
}

