'use client';

import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewProps {
  oldValue: string;
  newValue: string;
  oldTitle: string;
  newTitle: string;
}

export default function DiffView({ oldValue, newValue, oldTitle, newTitle }: DiffViewProps) {
  return (
    <div className="diff-viewer-container glass">
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
        <h5 style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{oldTitle}</h5>
        <div style={{ width: '1px', background: 'var(--card-border)' }}></div>
        <h5 style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{newTitle}</h5>
      </div>
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        splitView={true}
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
            fontSize: '14px',
            lineHeight: '1.6',
            fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
          },
          content: {
            padding: '10px 0',
          }
        }}
      />
    </div>
  );
}
