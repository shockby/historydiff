'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  id: string;
  icon: React.ReactNode;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  title: string;
  subtitle: string;
  metaBadge?: string;
  themeColor: string;
  defaultOpen?: boolean;
  actionLabel?: string;
  closeLabel?: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  id,
  icon,
  badgeText,
  badgeBg,
  badgeColor,
  badgeBorder,
  title,
  subtitle,
  metaBadge,
  themeColor,
  defaultOpen = false,
  actionLabel,
  closeLabel,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className={`collapsible-section-card ${isOpen ? 'is-open' : ''}`}
      style={{
        marginBottom: '1.25rem',
        borderRadius: '16px',
        border: isOpen
          ? `1px solid ${themeColor}55`
          : '1px solid rgba(255, 255, 255, 0.08)',
        background: isOpen
          ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(12, 14, 20, 0.95) 100%)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(16, 18, 24, 0.7) 100%)',
        boxShadow: isOpen
          ? `0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 0 20px -8px ${themeColor}33`
          : '0 4px 20px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header Button (Whole Bar Clickable) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="collapsible-section-header"
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          outline: 'none',
          transition: 'background 0.2s ease',
        }}
      >
        {/* Left: Icon + Content Overview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
          <div
            className="collapsible-icon-box"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${themeColor}22`,
            }}
          >
            {icon}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: badgeColor,
                  background: badgeBg,
                  border: `1px solid ${badgeBorder}`,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px',
                }}
              >
                {badgeText}
              </span>
              {metaBadge && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '12px',
                  }}
                >
                  {metaBadge}
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '0.2rem',
                lineHeight: 1.35,
              }}
            >
              {title}
            </h3>

            <p
              className="collapsible-subtitle"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Action Pill & Toggle Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          <span
            className="collapsible-toggle-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: isOpen ? '#fff' : 'var(--text-secondary)',
              background: isOpen ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: isOpen ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
            }}
          >
            {isOpen ? (closeLabel || '閉じる') : (actionLabel || '開く')}
            <ChevronDown
              size={14}
              style={{
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
              }}
            />
          </span>
        </div>
      </button>

      {/* Expanded Content Body */}
      {isOpen && (
        <div
          className="collapsible-section-body"
          style={{
            padding: '0 1.5rem 1.5rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            animation: 'collapsibleFadeIn 0.25s ease-out',
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
