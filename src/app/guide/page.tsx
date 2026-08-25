import { Metadata } from 'next';
import Link from 'next/link';
import { translations } from '@/lib/translations';
import { SITE_URL } from '@/lib/schema';
import {
  Compass,
  Layers,
  FileCheck,
  BookOpen,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Globe2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guide & How to Use | HistoryDiff',
  description: 'Comprehensive guide and walkthrough for HistoryDiff multilateral comparison, verification notes, and interactive tools.',
  alternates: {
    canonical: `${SITE_URL}/guide`,
    languages: {
      en: `${SITE_URL}/guide`,
      ja: `${SITE_URL}/ja/guide`,
      zh: `${SITE_URL}/zh/guide`,
      ko: `${SITE_URL}/ko/guide`,
      'x-default': `${SITE_URL}/guide`,
    },
  },
};

export default function RootGuidePage() {
  const t = translations.en;
  const homeLink = '/';

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <section style={{ padding: '3.5rem 0 2.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: 'var(--accent)',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} />
          {t.guideBadge}
        </div>
        <h1
          className="title-gradient"
          style={{ fontSize: '2.8rem', marginBottom: '1.2rem', lineHeight: 1.25, fontWeight: 800 }}
        >
          {t.guideTitle}
        </h1>
        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '820px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {t.guideSubtitle}
        </p>
      </section>

      {/* Mission & Neutrality Section */}
      <section
        className="glass"
        style={{
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)',
          marginBottom: '3.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <ShieldCheck size={28} color="var(--accent)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            {t.guideMissionTitle}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', lineHeight: '1.8' }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0 }}>
            {t.guideMissionText1}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', margin: 0 }}>
            {t.guideMissionText2}
          </p>
        </div>

        {/* 3 Neutrality Pillars */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid var(--glass-border)',
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Globe2 size={18} />
            {t.guideNeutralityTitle}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <CheckCircle size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t.guideNeutralityPoint1}
              </span>
            </div>
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <CheckCircle size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t.guideNeutralityPoint2}
              </span>
            </div>
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <CheckCircle size={18} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t.guideNeutralityPoint3}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Steps to Use HistoryDiff */}
      <section style={{ marginBottom: '4.5rem' }}>
        <h2
          className="title-gradient"
          style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}
        >
          {t.guideStepsTitle}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Step 1 */}
          <div
            className="glass"
            style={{
              padding: '1.75rem 2rem',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Compass size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {t.guideStep1Title}
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {t.guideStep1Desc}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className="glass"
            style={{
              padding: '1.75rem 2rem',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {t.guideStep2Title}
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {t.guideStep2Desc}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className="glass"
            style={{
              padding: '1.75rem 2rem',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {t.guideStep3Title}
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {t.guideStep3Desc}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div
            className="glass"
            style={{
              padding: '1.75rem 2rem',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BookOpen size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {t.guideStep4Title}
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {t.guideStep4Desc}
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div
            className="glass"
            style={{
              padding: '1.75rem 2rem',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                {t.guideStep5Title}
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {t.guideStep5Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="glass"
        style={{
          padding: '2.5rem',
          borderRadius: '20px',
          border: '1px solid var(--glass-border)',
          marginBottom: '3.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <HelpCircle size={26} color="var(--accent)" />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            {t.guideFaqTitle}
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent)' }}>
              Q. {t.guideFaq1Q}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              A. {t.guideFaq1A}
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent)' }}>
              Q. {t.guideFaq2Q}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              A. {t.guideFaq2A}
            </p>
          </div>

          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--accent)' }}>
              Q. {t.guideFaq3Q}
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              A. {t.guideFaq3A}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(168, 85, 247, 0.12))',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {t.guideCtaTitle}
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          {t.guideCtaDesc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link
            href={homeLink}
            className="glow-effect"
            style={{
              padding: '0.9rem 1.75rem',
              borderRadius: '12px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            }}
          >
            {t.guideCtaButtonArchive}
            <ArrowRight size={18} />
          </Link>
          <Link
            href={`${homeLink}#demo`}
            style={{
              padding: '0.9rem 1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {t.guideCtaButtonDemo}
            <ExternalLink size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
