'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, Camera, ZoomIn } from 'lucide-react';
import { EventPhoto, EventPhotos } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';

interface PhotoGalleryProps {
  photos: EventPhotos;
  lang: Language;
}

function LightboxModal({
  photo,
  lang,
  onClose,
}: {
  photo: EventPhoto;
  lang: Language;
  onClose: () => void;
}) {
  const t = translations[lang] || translations.en;
  const caption = photo.caption[lang] ?? photo.caption.en ?? photo.caption.ja ?? '';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '100%',
          background: 'rgba(20, 20, 30, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem 0' }}>
          <button
            onClick={onClose}
            aria-label={t.photoClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={14} />
            {t.photoClose}
          </button>
        </div>

        {/* Image */}
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <img
            src={photo.url}
            alt={caption}
            style={{
              width: '100%',
              maxHeight: '500px',
              objectFit: 'contain',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              display: 'block',
            }}
          />
        </div>

        {/* Caption + Source */}
        <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
          {caption && (
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--foreground)',
              lineHeight: 1.6,
              marginBottom: '0.75rem',
              fontWeight: 500,
            }}>
              {caption}
            </p>
          )}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
          }}>
            {/* License badge */}
            <span style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 600,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#818cf8',
            }}>
              {photo.source.license}
            </span>
            {/* Author */}
            {photo.source.author && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {t.photoAuthor}: {photo.source.author}
              </span>
            )}
            {/* Source link */}
            <a
              href={photo.source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                marginLeft: 'auto',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <ExternalLink size={12} />
              {t.photoSource}: {photo.source.title}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoCard({
  photo,
  lang,
  onClick,
}: {
  photo: EventPhoto;
  lang: Language;
  onClick: () => void;
}) {
  const t = translations[lang] || translations.en;
  const caption = photo.caption[lang] ?? photo.caption.en ?? photo.caption.ja ?? '';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={caption || t.photoExpand}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        flexShrink: 0,
        width: '240px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.025)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: '158px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
        <img
          src={photo.url}
          alt={caption}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
        />
        {/* Zoom hint overlay */}
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ZoomIn size={14} color="rgba(255,255,255,0.7)" />
        </div>
      </div>

      {/* Caption */}
      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {caption && (
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--foreground)',
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {caption}
          </p>
        )}

        {/* Source footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.4rem',
        }}>
          <span style={{
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {t.photoSource}:{' '}
            <a
              href={photo.source.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(255,255,255,0.2)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {photo.source.title}
            </a>
          </span>
          <span style={{
            flexShrink: 0,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.62rem',
            fontWeight: 600,
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
          }}>
            {photo.source.license}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PhotoGallery({ photos, lang }: PhotoGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<EventPhoto | null>(null);
  const t = translations[lang] || translations.en;

  const handleClose = useCallback(() => setActivePhoto(null), []);

  if (!photos.photos || photos.photos.length === 0) return null;

  return (
    <>
      <section style={{ marginTop: '3rem', marginBottom: '2rem' }}>
        {/* Section header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Camera size={16} color="#fbbf24" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--foreground)' }}>
              {t.photoGalleryTitle}
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {t.photoGallerySubtitle}
            </p>
          </div>
          <div style={{
            marginLeft: 'auto',
            padding: '4px 10px',
            borderRadius: '12px',
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.2)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#fbbf24',
          }}>
            {photos.photos.length}
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div style={{
          display: 'flex',
          gap: '0.875rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.12) transparent',
          WebkitOverflowScrolling: 'touch',
        }}>
          {photos.photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              lang={lang}
              onClick={() => setActivePhoto(photo)}
            />
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {activePhoto && (
        <LightboxModal photo={activePhoto} lang={lang} onClose={handleClose} />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
