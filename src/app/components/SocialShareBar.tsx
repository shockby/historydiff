'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Language } from '@/lib/translations';
import { SITE_URL } from '@/lib/schema';

interface SocialShareBarProps {
  eventId?: string;
  eventTitle: string;
  leftCountry?: string;
  rightCountry?: string;
  allCountries?: string[];
  lang: Language;
  variant?: 'compact' | 'callout';
}

export default function SocialShareBar({
  eventId,
  eventTitle,
  leftCountry,
  rightCountry,
  allCountries = [],
  lang,
  variant = 'compact',
}: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

  const canonicalPath = eventId
    ? lang === 'en'
      ? `/events/${eventId}`
      : `/${lang}/events/${eventId}`
    : lang === 'en'
    ? ''
    : `/${lang}`;
  const fallbackUrl = `${SITE_URL}${canonicalPath}`;

  const getShareUrl = () => {
    if (typeof window !== 'undefined' && window.location?.href) {
      return window.location.href;
    }
    return fallbackUrl;
  };

  const hasPair = Boolean(leftCountry && rightCountry && leftCountry !== rightCountry);
  const countriesPreview =
    allCountries.length >= 2 ? allCountries.slice(0, 4).join(lang === 'ja' ? '・' : lang === 'zh' ? '、' : ', ') : '';

  const buildShareText = () => {
    if (lang === 'ja') {
      if (hasPair) {
        return `「${eventTitle}」を${leftCountry}と${rightCountry}の歴史教科書で比較すると記述・視点がここまで違う！ #HistoryDiff`;
      }
      return `「${eventTitle}」${countriesPreview ? `（${countriesPreview}）` : ''}の歴史教科書の記述比較 #HistoryDiff`;
    }
    if (lang === 'zh') {
      if (hasPair) {
        return `对比${leftCountry}与${rightCountry}历史教科书对“${eventTitle}”的不同记述与视角差异！ #HistoryDiff`;
      }
      return `“${eventTitle}”${countriesPreview ? `（${countriesPreview}）` : ''}各国历史教科书记述对比 #HistoryDiff`;
    }
    if (lang === 'ko') {
      if (hasPair) {
        return `"${eventTitle}"에 대한 ${leftCountry} vs ${rightCountry} 역사 교과서 서술 차이 비교! #HistoryDiff`;
      }
      return `"${eventTitle}"${countriesPreview ? ` (${countriesPreview})` : ''} 세계 역사 교과서 기술 비교 #HistoryDiff`;
    }
    if (hasPair) {
      return `How ${leftCountry} vs ${rightCountry} history textbooks describe "${eventTitle}" differently — side-by-side comparison on #HistoryDiff:`;
    }
    return `Comparing global history textbook narratives on "${eventTitle}"${countriesPreview ? ` (${countriesPreview})` : ''} | #HistoryDiff`;
  };

  const openPopup = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareX = () => {
    const url = getShareUrl();
    const text = buildShareText();
    openPopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
  };

  const handleShareLine = () => {
    const url = getShareUrl();
    const text = buildShareText();
    openPopup(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
  };

  const handleShareFacebook = () => {
    const url = getShareUrl();
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  const handleShareHatena = () => {
    const url = getShareUrl();
    const text = buildShareText();
    openPopup(`https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`);
  };

  const handleShareReddit = () => {
    const url = getShareUrl();
    const text = buildShareText();
    openPopup(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`);
  };

  const handleCopy = () => {
    const url = getShareUrl();
    const text = `${buildShareText()} ${url}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const labels = {
    shareLabel:
      lang === 'ja'
        ? 'この比較をシェア:'
        : lang === 'zh'
        ? '分享此对比:'
        : lang === 'ko'
        ? '이 비교 공유하기:'
        : 'Share this comparison:',
    calloutTitle:
      lang === 'ja'
        ? hasPair
          ? `${leftCountry}と${rightCountry}の教科書の「記述の差」をシェアする`
          : 'この歴史教科書の比較をSNSでシェアする'
        : lang === 'zh'
        ? hasPair
          ? `分享${leftCountry}与${rightCountry}教科书的“记述差异”`
          : '在社交媒体上分享此历史教科书对比'
        : lang === 'ko'
        ? hasPair
          ? `${leftCountry}·${rightCountry} 교과서의 "서술 차이" 공유하기`
          : '이 역사 교과서 비교를 SNS에 공유하기'
        : hasPair
        ? `Share how ${leftCountry} & ${rightCountry} textbooks differ`
        : 'Share this textbook comparison',
    calloutSub:
      lang === 'ja'
        ? '国による歴史記述や視点の違いを、X（旧Twitter）やLINE・はてなブックマーク等で共有して議論を深めましょう。'
        : lang === 'zh'
        ? '将各国历史教科书的视角差异分享至社交平台，与更多人一起探讨多元历史认知。'
        : lang === 'ko'
        ? '국가별 역사 서술과 시각의 차이를 X, LINE, 커뮤니티 등에 공유해 보세요.'
        : 'Spark a conversation by sharing these contrasting textbook narratives on X, Reddit, or with friends.',
    xBtn: lang === 'ja' ? 'Xでシェア' : lang === 'zh' ? '分享到 X' : lang === 'ko' ? 'X 공유' : 'Post on X',
    lineBtn: 'LINE',
    fbBtn: 'Facebook',
    hatenaBtn: lang === 'ja' ? 'はてブ' : 'Hatena',
    redditBtn: 'Reddit',
    copyBtn:
      lang === 'ja'
        ? 'リンクをコピー'
        : lang === 'zh'
        ? '复制链接'
        : lang === 'ko'
        ? '링크 복사'
        : 'Copy Link',
    copiedBtn:
      lang === 'ja'
        ? 'コピー完了！'
        : lang === 'zh'
        ? '已复制！'
        : lang === 'ko'
        ? '복사됨!'
        : 'Copied!',
  };

  const buttonBaseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: variant === 'callout' ? '0.5rem 0.95rem' : '0.38rem 0.78rem',
    borderRadius: '9999px',
    fontSize: variant === 'callout' ? '0.82rem' : '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  };

  const buttons = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      {/* X (Twitter) */}
      <button
        type="button"
        onClick={handleShareX}
        aria-label={labels.xBtn}
        style={{
          ...buttonBaseStyle,
          background: '#0f172a',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>{labels.xBtn}</span>
      </button>

      {/* LINE */}
      <button
        type="button"
        onClick={handleShareLine}
        aria-label={labels.lineBtn}
        style={{
          ...buttonBaseStyle,
          background: '#06C755',
          color: '#ffffff',
          border: '1px solid #05b34c',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 5.58 2 10c0 3.95 3.52 7.25 8.27 7.89.32.07.76.21.87.49.1.25.07.64.03.89l-.14.85c-.04.25-.2 1.01.88.55 1.08-.46 5.83-3.43 7.96-5.88C21.35 13.21 22 11.69 22 10c0-4.42-4.48-8-10-8z" />
        </svg>
        <span>{labels.lineBtn}</span>
      </button>

      {/* Hatena Bookmark (highlighted for Japanese or available generally) */}
      {lang === 'ja' && (
        <button
          type="button"
          onClick={handleShareHatena}
          aria-label={labels.hatenaBtn}
          style={{
            ...buttonBaseStyle,
            background: '#00A4DE',
            color: '#ffffff',
            border: '1px solid #0090c4',
          }}
        >
          <span style={{ fontWeight: 900, fontSize: '0.8rem', fontFamily: 'sans-serif' }}>B!</span>
          <span>{labels.hatenaBtn}</span>
        </button>
      )}

      {/* Reddit */}
      <button
        type="button"
        onClick={handleShareReddit}
        aria-label={labels.redditBtn}
        style={{
          ...buttonBaseStyle,
          background: '#FF4500',
          color: '#ffffff',
          border: '1px solid #e03d00',
        }}
      >
        <span>{labels.redditBtn}</span>
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={handleShareFacebook}
        aria-label={labels.fbBtn}
        style={{
          ...buttonBaseStyle,
          background: '#1877F2',
          color: '#ffffff',
          border: '1px solid #166fe5',
        }}
      >
        <span>{labels.fbBtn}</span>
      </button>

      {/* Copy Link */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={labels.copyBtn}
        style={{
          ...buttonBaseStyle,
          background: copied ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.08)',
          color: copied ? '#10b981' : 'var(--foreground)',
          border: copied ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid var(--card-border)',
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span>{copied ? labels.copiedBtn : labels.copyBtn}</span>
      </button>
    </div>
  );

  if (variant === 'callout') {
    return (
      <section
        className="card glass"
        style={{
          marginTop: '2rem',
          marginBottom: '2rem',
          padding: '1.5rem 1.75rem',
          borderRadius: '16px',
          border: '1px solid rgba(220, 38, 38, 0.25)',
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(220, 38, 38, 0.12)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Share2 size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 0.25rem' }}>
              {labels.calloutTitle}
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {labels.calloutSub}
            </p>
          </div>
        </div>
        {buttons}
      </section>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.6rem',
        marginTop: '1rem',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
        }}
      >
        <Share2 size={14} />
        {labels.shareLabel}
      </span>
      {buttons}
    </div>
  );
}
