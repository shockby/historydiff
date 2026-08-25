'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, Flame, BookOpen } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import { EventPerspective } from '@/lib/markdown';
import { curatedQuizList, QuizItem, getQuizForEvent } from '@/lib/quizData';

interface HistoryQuizProps {
  lang: string;
  eventId?: string;
  perspectives?: EventPerspective[];
  isCardOnly?: boolean;
}

export default function HistoryQuiz({ lang, eventId, perspectives, isCardOnly = false }: HistoryQuizProps) {
  const activeLang = (lang as Language) || 'en';
  const t = translations[activeLang] || translations.en;

  // If event-specific, try to get question for this event; otherwise use curated list
  const initialQuestions = useMemo(() => {
    if (eventId && perspectives && perspectives.length > 0) {
      const q = getQuizForEvent(eventId, perspectives, activeLang);
      return q ? [q] : curatedQuizList;
    }
    return curatedQuizList;
  }, [eventId, perspectives, activeLang]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const currentQuiz: QuizItem = initialQuestions[currentIndex % initialQuestions.length] || curatedQuizList[0];

  const currentCountry = currentQuiz.country[activeLang] || currentQuiz.country.en;
  const currentExcerpt = currentQuiz.excerpt[activeLang] || currentQuiz.excerpt.en;
  const currentEventTitle = currentQuiz.eventTitle[activeLang] || currentQuiz.eventTitle.en;
  const currentExplanation = currentQuiz.explanation[activeLang] || currentQuiz.explanation.en;
  const currentClue = currentQuiz.clue[activeLang] || currentQuiz.clue.en;

  const handleSelectOption = (countryName: string) => {
    if (hasAnswered) return;

    setSelectedOption(countryName);
    setHasAnswered(true);

    const isCorrect = countryName.toLowerCase() === currentCountry.toLowerCase();
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setStats((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setStreak(0);
      setStats((prev) => ({ correct: prev.correct, total: prev.total + 1 }));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setCurrentIndex((prev) => (prev + 1) % initialQuestions.length);
  };

  const isCorrect = selectedOption?.toLowerCase() === currentCountry.toLowerCase();
  const eventHref = activeLang === 'en' ? `/events/${currentQuiz.eventId}` : `/${activeLang}/events/${currentQuiz.eventId}`;

  return (
    <section
      className="card glass"
      style={{
        padding: isCardOnly ? '1.5rem' : '2.5rem 2rem',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(145deg, rgba(20, 20, 28, 0.7) 0%, rgba(10, 10, 15, 0.85) 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        marginTop: isCardOnly ? '0' : '2.5rem',
        marginBottom: isCardOnly ? '0' : '2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(224, 46, 46, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(249, 115, 22, 0.25))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
          }}>
            <HelpCircle size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#f87171',
                textTransform: 'uppercase',
              }}>
                {t.quizBadge}
              </span>
              <span className="badge" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                {currentEventTitle}
              </span>
            </div>
            <h3 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--foreground)',
              marginTop: '2px',
            }}>
              {t.quizTitle}
            </h3>
          </div>
        </div>

        {/* Stats & Streak counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {streak > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#fb923c',
            }}>
              <Flame size={14} />
              <span>{t.quizStreakLabel(streak)}</span>
            </div>
          )}
          {stats.total > 0 && (
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              padding: '4px 8px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
            }}>
              {t.quizScoreLabel(stats.correct, stats.total)}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle instructions */}
      <p style={{
        fontSize: '0.88rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.25rem',
        lineHeight: 1.5,
      }}>
        {t.quizSubtitle}
      </p>

      {/* Excerpt quotation box */}
      <div style={{
        position: 'relative',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderLeft: '4px solid #ef4444',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          📖 {t.tableExcerpt}
        </div>
        <p style={{
          fontSize: '0.98rem',
          lineHeight: 1.8,
          color: '#f3f4f6',
          fontStyle: 'normal',
        }}>
          {currentExcerpt}
        </p>

        {currentClue && !hasAnswered && (
          <div style={{
            marginTop: '0.8rem',
            paddingTop: '0.6rem',
            borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            <Sparkles size={13} style={{ color: '#d29922', flexShrink: 0 }} />
            <span>Hint: {currentClue}</span>
          </div>
        )}
      </div>

      {/* Question prompt */}
      <div style={{
        fontSize: '0.88rem',
        fontWeight: 600,
        color: 'var(--foreground)',
        marginBottom: '0.9rem',
      }}>
        {t.quizSelectPrompt}
      </div>

      {/* Options grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {currentQuiz.options.map((opt, idx) => {
          const optName = opt[activeLang] || opt.en;
          const isThisOptionCorrect = optName.toLowerCase() === currentCountry.toLowerCase();
          const isSelected = selectedOption === optName;

          let btnStyle = {
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: 'var(--foreground)',
          };

          if (hasAnswered) {
            if (isThisOptionCorrect) {
              btnStyle = {
                border: '1px solid #3fb950',
                background: 'rgba(46, 160, 67, 0.2)',
                color: '#3fb950',
              };
            } else if (isSelected) {
              btnStyle = {
                border: '1px solid #f85149',
                background: 'rgba(248, 81, 73, 0.2)',
                color: '#f85149',
              };
            } else {
              btnStyle = {
                border: '1px solid rgba(255, 255, 255, 0.04)',
                background: 'rgba(255, 255, 255, 0.01)',
                color: 'rgba(255, 255, 255, 0.3)',
              };
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelectOption(optName)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: hasAnswered ? 'default' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                ...btnStyle,
              }}
              onMouseEnter={(e) => {
                if (!hasAnswered) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasAnswered) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <span>{optName}</span>
              {hasAnswered && isThisOptionCorrect && <CheckCircle2 size={16} color="#3fb950" />}
              {hasAnswered && isSelected && !isThisOptionCorrect && <XCircle size={16} color="#f85149" />}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Explanation box */}
      {hasAnswered && (
        <div style={{
          padding: '1.25rem',
          borderRadius: '12px',
          background: isCorrect ? 'rgba(46, 160, 67, 0.08)' : 'rgba(248, 81, 73, 0.08)',
          border: isCorrect ? '1px solid rgba(46, 160, 67, 0.3)' : '1px solid rgba(248, 81, 73, 0.3)',
          animation: 'fadeIn 0.25s ease-out',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: isCorrect ? '#3fb950' : '#f85149',
            marginBottom: '0.6rem',
          }}>
            {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            <span>{isCorrect ? t.quizCorrect : t.quizIncorrect}</span>
          </div>

          <div style={{
            fontSize: '0.85rem',
            color: 'var(--foreground)',
            marginBottom: '0.6rem',
          }}>
            <strong>{t.quizCorrectAnswer}: </strong>
            <span style={{ color: '#3fb950', fontWeight: 700 }}>{currentCountry}</span>
          </div>

          {/* Explanation */}
          <div style={{
            fontSize: '0.85rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(0, 0, 0, 0.2)',
            marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.3rem' }}>
              {t.quizExplanationTitle}
            </div>
            {currentExplanation}
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.8rem',
          }}>
            <Link
              href={eventHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
              }}
            >
              <BookOpen size={14} />
              <span>{t.quizExploreEvent}</span>
            </Link>

            {initialQuestions.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #e02e2e, #ff5757)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>{t.quizNextQuestion}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
