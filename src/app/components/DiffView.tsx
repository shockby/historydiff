'use client';

import { useState, useEffect } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewProps {
  oldValue: string;
  newValue: string;
  oldTitle: string;
  newTitle: string;
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

export default function DiffView({ oldValue, newValue, oldTitle, newTitle }: DiffViewProps) {
  const isMobile = useIsMobile();

  return (
    <div className="diff-viewer-container glass">
      <div style={{
        padding: isMobile ? '0.75rem' : '1rem',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
      }}>
        {isMobile ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#f85149', fontWeight: 600 }}>{oldTitle}</span>
            <span style={{ margin: '0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>vs</span>
            <span style={{ fontSize: '0.8rem', color: '#3fb950', fontWeight: 600 }}>{newTitle}</span>
          </div>
        ) : (
          <>
            <h5 style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{oldTitle}</h5>
            <div style={{ width: '1px', background: 'var(--card-border)' }}></div>
            <h5 style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{newTitle}</h5>
          </>
        )}
      </div>
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        splitView={!isMobile}
        compareMethod={DiffMethod.WORDS}
        useDarkTheme={true}
        styles={{
          variables: {
            dark: {
              diffViewerBackground: '#0a0a0c',
              addedBackground: 'rgba(46, 160, 67, 0.15)',
              addedColor: '#3fb950',
              removedBackground: 'rgba(248, 81, 73, 0.15)',
              removedColor: '#f85149',
              wordAddedBackground: 'rgba(46, 160, 67, 0.4)',
              wordRemovedBackground: 'rgba(240, 81, 73, 0.4)',
              codeFoldBackground: '#0d1117',
              codeFoldContentColor: '#8b949e',
              codeFoldGutterBackground: '#0d1117',
              emptyLineBackground: '#0a0a0c',
              gutterBackground: '#0a0a0c',
              gutterColor: '#484f58',
              diffViewerTitleBackground: '#0a0a0c',
              diffViewerTitleColor: '#8b949e',
              diffViewerTitleBorderColor: '#30363d',
            },
          },
          line: {
            fontSize: isMobile ? '12px' : '14px',
            lineHeight: '1.6',
            fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
            wordBreak: 'break-all' as const,
          },
          content: {
            padding: isMobile ? '6px 0' : '10px 0',
          }
        }}
      />
    </div>
  );
}
