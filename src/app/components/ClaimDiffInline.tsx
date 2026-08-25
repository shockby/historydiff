'use client';

import React, { useMemo } from 'react';
import { extractClaimPair, computeTokenDiff, DiffToken } from '@/lib/sentenceDiff';
import { Language, translations } from '@/lib/translations';

interface ClaimDiffInlineProps {
  oldFullText: string;
  newFullText: string;
  oldTerm: string;
  newTerm: string;
  oldCountry: string;
  newCountry: string;
  lang: Language;
  topic?: string;
}

/** DiffToken 配列を span でレンダリング */
function TokenRow({
  tokens,
  side,
  keyTerms,
}: {
  tokens: DiffToken[];
  side: 'old' | 'new';
  keyTerms: string[];
}) {
  return (
    <span className="claim-diff-token-row" aria-label={side === 'old' ? 'source text' : 'target text'}>
      {tokens.map((token, idx) => {
        const isChanged = side === 'old' ? token.removed : token.added;
        const isKeyTerm =
          keyTerms.some(
            kt => kt && token.text.toLowerCase().includes(kt.toLowerCase())
          ) || token.isKeyTerm;

        // 空白・句読点は強調しない
        const isPunct = /^[\s。、！？!?,.，：；]+$/.test(token.text);

        if (isPunct) {
          return <span key={idx}>{token.text}</span>;
        }

        let className = '';
        if (isChanged && side === 'old') className = 'diff-token-removed';
        if (isChanged && side === 'new') className = 'diff-token-added';
        if (isKeyTerm && isChanged) className += ' diff-token-key';

        return (
          <span key={idx} className={className || undefined}>
            {token.text}
          </span>
        );
      })}
    </span>
  );
}

export default function ClaimDiffInline({
  oldFullText,
  newFullText,
  oldTerm,
  newTerm,
  oldCountry,
  newCountry,
  lang,
  topic,
}: ClaimDiffInlineProps) {
  const t = translations[lang] || translations.en;

  // 対応文ペアを抽出
  const { oldSentences, newSentences } = useMemo(
    () => extractClaimPair(oldFullText, newFullText, oldTerm, newTerm),
    [oldFullText, newFullText, oldTerm, newTerm]
  );

  // 旧/新の代表文を結合して差分計算
  const oldText = oldSentences.join(' ');
  const newText = newSentences.join(' ');

  const [oldTokens, newTokens] = useMemo(
    () => computeTokenDiff(oldText, newText, lang, [oldTerm, newTerm]),
    [oldText, newText, lang, oldTerm, newTerm]
  );

  const noMatch = oldSentences.length === 0 && newSentences.length === 0;

  if (noMatch) {
    return (
      <div className="claim-diff-container claim-diff-expand">
        <p className="claim-diff-no-match">{t.claimDiffNoMatch}</p>
      </div>
    );
  }

  return (
    <div className="claim-diff-container claim-diff-expand">
      {/* ヘッダー */}
      <div className="claim-diff-header">
        <span className="claim-diff-badge">📖 {t.claimDiffTitle}</span>
        {topic && <span className="claim-diff-topic">{topic}</span>}
      </div>

      {/* 凡例 */}
      <div className="claim-diff-legend">
        <span className="claim-diff-legend-item">
          <span className="diff-token-removed claim-diff-legend-swatch">削</span>
          {lang === 'ja' ? '旧側のみ' : lang === 'zh' ? '仅旧方' : lang === 'ko' ? '이전만' : 'Source only'}
        </span>
        <span className="claim-diff-legend-item">
          <span className="diff-token-added claim-diff-legend-swatch">加</span>
          {lang === 'ja' ? '新側のみ' : lang === 'zh' ? '仅新方' : lang === 'ko' ? '새것만' : 'Target only'}
        </span>
        <span className="claim-diff-legend-item">
          <span className="diff-token-key diff-token-removed claim-diff-legend-swatch">★</span>
          {lang === 'ja' ? '対立語' : lang === 'zh' ? '对立词' : lang === 'ko' ? '대립어' : 'Key term'}
        </span>
      </div>

      {/* 2カラム diff 表示 */}
      <div className="claim-diff-cols">
        {/* 旧側（赤） */}
        <div className="claim-diff-col claim-diff-col-old">
          <div className="claim-diff-col-header">
            <span className="claim-diff-side-dot dot-old" />
            <span className="claim-diff-country">{oldCountry}</span>
            <span className="claim-diff-term-badge term-old">{oldTerm}</span>
          </div>
          <p className="claim-diff-text">
            <TokenRow tokens={oldTokens} side="old" keyTerms={[oldTerm, newTerm]} />
          </p>
        </div>

        {/* 新側（緑） */}
        <div className="claim-diff-col claim-diff-col-new">
          <div className="claim-diff-col-header">
            <span className="claim-diff-side-dot dot-new" />
            <span className="claim-diff-country">{newCountry}</span>
            <span className="claim-diff-term-badge term-new">{newTerm}</span>
          </div>
          <p className="claim-diff-text">
            <TokenRow tokens={newTokens} side="new" keyTerms={[oldTerm, newTerm]} />
          </p>
        </div>
      </div>

      <p className="claim-diff-note">{t.claimDiffExtractedFrom}</p>
    </div>
  );
}
