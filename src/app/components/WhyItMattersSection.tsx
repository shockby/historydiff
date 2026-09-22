'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventOngoing, NewsArticle } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { ExternalLink, RefreshCw, Radio, Compass, Clock, Newspaper, Sparkles, CheckCircle } from 'lucide-react';

interface WhyItMattersSectionProps {
  ongoing: EventOngoing;
  lang: string;
}

interface ParsedRSSItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
}

export default function WhyItMattersSection({ ongoing, lang }: WhyItMattersSectionProps) {
  const activeLang = (lang as Language) in translations ? (lang as Language) : 'en';
  const t = translations[activeLang] || translations.en;

  const [articles, setArticles] = useState<NewsArticle[]>(ongoing.articles || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveFeed, setIsLiveFeed] = useState(false);
  const [lastFetchedTime, setLastFetchedTime] = useState<string | null>(null);

  // Determine query parameters for Google News RSS based on active language
  const getRSSParams = useCallback(() => {
    let query = ongoing.rssQuery?.[activeLang] || ongoing.rssQuery?.ja || ongoing.rssQuery?.en || '';
    let hl = 'ja';
    let gl = 'JP';
    let ceid = 'JP:ja';

    if (activeLang === 'en') {
      hl = 'en';
      gl = 'US';
      ceid = 'US:en';
    } else if (activeLang === 'zh') {
      hl = 'zh-CN';
      gl = 'CN';
      ceid = 'CN:zh-Hans';
    } else if (activeLang === 'ko') {
      hl = 'ko';
      gl = 'KR';
      ceid = 'KR:ko';
    }

    return { query, hl, gl, ceid };
  }, [ongoing, activeLang]);

  const fetchLiveNews = useCallback(async () => {
    const { query, hl, gl, ceid } = getRSSParams();
    if (!query) return;

    setIsLoading(true);
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
      // Use public CORS proxies with a timeout for fast fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');

      if (items && items.length > 0) {
        const liveItems: ParsedRSSItem[] = [];
        items.forEach((item, index) => {
          if (index >= 5) return; // Top 5 items
          const rawTitle = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const sourceName = item.querySelector('source')?.textContent || '';

          // Format clean title and source
          let title = rawTitle;
          let source = sourceName;
          if (!source && rawTitle.includes(' - ')) {
            const parts = rawTitle.split(' - ');
            source = parts.pop() || '';
            title = parts.join(' - ');
          }

          let formattedDate = pubDate;
          try {
            const d = new Date(pubDate);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().split('T')[0] || '';
            }
          } catch {
            // Keep raw date if parsing fails
          }

          if (title && link) {
            liveItems.push({
              title,
              source: source || (activeLang === 'ja' ? 'ニュース速報' : 'News Feed'),
              url: link,
              publishedAt: formattedDate,
            });
          }
        });

        if (liveItems.length > 0) {
          const converted: NewsArticle[] = liveItems.map((item) => ({
            title: item.title,
            source: item.source,
            url: item.url,
            publishedAt: item.publishedAt,
          }));
          setArticles(converted);
          setIsLiveFeed(true);
          setLastFetchedTime(new Date().toLocaleTimeString());
          return;
        }
      }
    } catch {
      // Fallback seamlessly to curated articles
    } finally {
      setIsLoading(false);
    }
  }, [getRSSParams, activeLang]);

  useEffect(() => {
    fetchLiveNews();
  }, [fetchLiveNews]);

  const whyText = (ongoing.whyItMatters[activeLang] ?? ongoing.whyItMatters.en) ?? ongoing.whyItMatters.ja ?? '';
  const watchText = (ongoing.whatToWatchNext[activeLang] ?? ongoing.whatToWatchNext.en) ?? ongoing.whatToWatchNext.ja ?? '';

  // Split watch points by newline or bullet numbers if present
  const watchPoints = watchText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section
      className="card glass"
      style={{
        marginBottom: '2.5rem',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #fca5a5',
        background: '#ffffff',
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.06)',
        borderRadius: '16px',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Header Bar with Live Pulse and Last Updated Date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.2rem',
          borderBottom: '1px solid var(--card-border)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Live Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: 'var(--accent)',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
                animation: 'pulse 1.8s infinite',
              }}
            />
            <style>{`
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.85; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                70% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
                100% { transform: scale(0.95); opacity: 0.85; box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
              }
            `}</style>
            <span>{t.ongoingBadge}</span>
          </div>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Radio size={14} style={{ color: 'var(--accent)' }} />
            {t.ongoingLiveText}
          </span>
        </div>

        {/* Last Updated Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          <Clock size={14} style={{ color: 'var(--accent)' }} />
          <span>
            {t.lastUpdated}: <strong>{ongoing.lastUpdated}</strong>
          </span>
        </div>
      </div>

      {/* Section Title */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '1.8rem' }}>
        <h3
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.5rem',
          }}
        >
          <Sparkles size={22} style={{ color: 'var(--accent)' }} />
          {t.whyItMattersTitle}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
          {t.whyItMattersSubtitle}
        </p>
      </div>

      {/* Content Grid: Left (Why It Matters + What to Watch) | Right (Recent Related News) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.8rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Column: Context and Watch Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Why It Matters Text Box */}
          <div
            style={{
              padding: '1.3rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--card-border)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.85,
                color: 'var(--foreground)',
              }}
            >
              {whyText}
            </div>
          </div>

          {/* Key Watchpoints Box */}
          <div
            style={{
              padding: '1.3rem',
              background: '#fff8f8',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#dc2626',
                fontSize: '0.9rem',
                fontWeight: 700,
                marginBottom: '0.8rem',
              }}
            >
              <Compass size={16} />
              <span>{t.whatToWatchNextTitle}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {watchPoints.map((point, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: 'var(--foreground)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(220, 38, 38, 0.12)',
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span>{point.replace(/^[0-9]+[.\-、]\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Related News (Live RSS / Curated) */}
        <div
          style={{
            padding: '1.3rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid var(--card-border)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header of News Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--card-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--foreground)' }}>
              <Newspaper size={17} style={{ color: '#dc2626' }} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>{t.recentNewsTitle}</h4>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchLiveNews}
              disabled={isLoading}
              title={t.refreshNews}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                background: '#ffffff',
                color: 'var(--foreground)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <RefreshCw
                size={12}
                style={{
                  animation: isLoading ? 'spin 1s linear infinite' : 'none',
                }}
              />
              <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}</style>
              <span>{isLoading ? t.fetchingNews : t.refreshNews}</span>
            </button>
          </div>

          {/* RSS status hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={12} style={{ color: isLiveFeed ? '#16a34a' : '#dc2626' }} />
              {isLiveFeed ? t.newsAutoUpdateHint : t.newsEmptyFallback}
            </span>
            {lastFetchedTime && <span>{lastFetchedTime}</span>}
          </div>

          {/* News Article List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {articles.map((art, idx) => {
              const summaryText = art.summary ? (art.summary[activeLang] ?? art.summary.en) ?? art.summary.ja : null;
              return (
                <a
                  key={idx}
                  href={art.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.4 }}>
                      {art.title}
                    </div>
                    <ExternalLink size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
                  </div>

                  {summaryText && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        marginBottom: '0.4rem',
                      }}
                    >
                      {summaryText}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        fontWeight: 600,
                      }}
                    >
                      {art.source}
                    </span>
                    <span>{art.publishedAt}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
