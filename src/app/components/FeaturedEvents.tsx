'use client';

import Link from 'next/link';
import { translations, Language } from '@/lib/translations';

interface FeaturedEventsProps {
  lang: string;
}

interface FeaturedItem {
  id: string;
  rank: number;
  title: Record<Language, string>;
  category: Record<Language, string>;
  year: string;
  imageUrl: string;
  countries: { flag: string; name: Record<Language, string> }[];
  divergencePoints: {
    flag: string;
    countryName: Record<Language, string>;
    point: Record<Language, string>;
  }[];
}

const FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: 'nanjing-massacre',
    rank: 1,
    title: {
      ja: '南京事件 / 南京大屠殺',
      en: 'Nanjing Massacre (The Rape of Nanking)',
      zh: '南京大屠杀 / 南京事件',
      ko: '난징 사건 / 난징 대학살',
    },
    category: {
      ja: '侵略・虐殺・戦争犯罪',
      en: 'War Crimes & Atrocities',
      zh: '侵略·屠杀·战争罪行',
      ko: '침략·학살·전쟁범죄',
    },
    year: '1937',
    imageUrl: 'https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev/events/nanjing-massacre/chinese-captives-1938.jpg',
    countries: [
      { flag: '🇨🇳', name: { ja: '中国', en: 'China', zh: '中国', ko: '중국' } },
      { flag: '🇯🇵', name: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' } },
      { flag: '🇺🇸', name: { ja: '米国', en: 'USA', zh: '美国', ko: '미국' } },
    ],
    divergencePoints: [
      {
        flag: '🇨🇳',
        countryName: { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
        point: {
          ja: '組織的計画的虐殺・犠牲者30万人以上・国家公祭日',
          en: 'Systematic genocide of 300,000+ victims; National Memorial Day',
          zh: '有计划的大屠杀·遇难者达30万人以上·国家公祭日',
          ko: '조직적 학살·희생자 30만 명 이상·국가 추모일',
        },
      },
      {
        flag: '🇯🇵',
        countryName: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
        point: {
          ja: '「多数の殺害」と記述・犠牲者数に諸説あり議論継続',
          en: 'Describes "numerous killings"; death toll debated with multiple theories',
          zh: '记述为“多数杀害”·牺牲者人数存在诸说且争议持续',
          ko: '"다수의 살해"로 기술·희생자 수에 여러 학설과 논쟁 지속',
        },
      },
      {
        flag: '🇺🇸',
        countryName: { ja: '米国', en: 'USA', zh: '美国', ko: '미국' },
        point: {
          ja: '数万〜30万人以上・The Rape of Nankingと安全区救援',
          en: 'Tens of thousands to 300,000+ killed; The Rape of Nanking & Safety Zone',
          zh: '数万至30万人以上·定性为Rape of Nanking及国际安全区救援',
          ko: '수만~30만 명 이상·The Rape of Nanking 및 안전구역 구호',
        },
      },
    ],
  },
  {
    id: 'comfort-women',
    rank: 2,
    title: {
      ja: '日本軍「慰安婦」問題',
      en: 'Comfort Women Controversy',
      zh: '日军“慰安妇”问题',
      ko: '일본군 "위안부" 문제',
    },
    category: {
      ja: '戦時人権問題・植民地支配',
      en: 'Human Rights & Colonial Rule',
      zh: '战时人权·殖民统治',
      ko: '전시 인권·식민 지배',
    },
    year: '1930s-1945',
    imageUrl: 'https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev/events/comfort-women/peace-statue-seoul.jpg',
    countries: [
      { flag: '🇰🇷', name: { ja: '韓国', en: 'Korea', zh: '韩国', ko: '한국' } },
      { flag: '🇯🇵', name: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' } },
      { flag: '🇨🇳', name: { ja: '中国', en: 'China', zh: '中国', ko: '중국' } },
      { flag: '🇺🇸', name: { ja: '米国', en: 'USA', zh: '美国', ko: '미국' } },
    ],
    divergencePoints: [
      {
        flag: '🇰🇷',
        countryName: { ja: '韓国', en: 'Korea', zh: '韩国', ko: '한국' },
        point: {
          ja: '組織的強制動員・性的奴隷制度・法的謝罪と賠償請求',
          en: 'Organized sexual slavery; state responsibility & legal reparations',
          zh: '组织性强征性奴隶制·要求官方谢罪与法律赔偿',
          ko: '조직적 성노예 동원·국가 법적 사죄 및 손해배상 청구',
        },
      },
      {
        flag: '🇯🇵',
        countryName: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
        point: {
          ja: '河野談話でお詫び・請求権協定で法的には解決済み',
          en: '1993 Kono apology; legally resolved by 1965 Claims Agreement',
          zh: '河野谈话致歉·主张通过1965年请求权协定在法律上已解决',
          ko: '고노 담화 사죄·청구권 협정으로 법적 해결 완료 입장',
        },
      },
      {
        flag: '🇨🇳',
        countryName: { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
        point: {
          ja: '中国人被害者20万人以上・侵略戦争の重大な人道犯罪',
          en: '200,000+ Chinese victims; severe wartime crime against humanity',
          zh: '20万以上中国受害妇女·侵略战争中的重大反人类罪行',
          ko: '중국인 피해자 20만 명 이상·침략전쟁의 중대 반인도 범죄',
        },
      },
    ],
  },
  {
    id: 'senkaku',
    rank: 3,
    title: {
      ja: '尖閣諸島（釣魚島）領有権問題',
      en: 'Senkaku / Diaoyu Islands Dispute',
      zh: '钓鱼岛及其附属岛屿主权问题',
      ko: '센카쿠 열도 (댜오위다오) 영유권 분쟁',
    },
    category: {
      ja: '領土問題・主権',
      en: 'Territorial Sovereignty',
      zh: '领土主权·海洋权益',
      ko: '영토 문제·주권',
    },
    year: '1885-Present',
    imageUrl: 'https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev/events/senkaku/senkaku-islands-aerial-kitakojima.jpg',
    countries: [
      { flag: '🇯🇵', name: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' } },
      { flag: '🇨🇳', name: { ja: '中国', en: 'China', zh: '中国', ko: '중국' } },
      { flag: '🇺🇸', name: { ja: '米国', en: 'USA', zh: '美国', ko: '미국' } },
    ],
    divergencePoints: [
      {
        flag: '🇯🇵',
        countryName: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
        point: {
          ja: '1895年無主地先占・固有の領土・解決すべき領有権問題なし',
          en: 'Terra nullius incorporation in 1895; inherent territory with no dispute',
          zh: '1895年无主地先占·固有领土·不存在需要解决的领土争议',
          ko: '1895년 무주지 선점·고유 영토·해결할 영유권 분쟁 부인',
        },
      },
      {
        flag: '🇨🇳',
        countryName: { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
        point: {
          ja: '明清代からの固有領土・日清戦争での不法盗取と返還要求',
          en: 'Inherent territory since Ming dynasty; illegally annexed in 1895',
          zh: '自明清以来的固有领土·甲午战末非法窃取·依据战后国际秩序要求返还',
          ko: '명·청대 이래 고유 영토·청일전쟁 말기 불법 찬탈 및 반환 요구',
        },
      },
      {
        flag: '🇺🇸',
        countryName: { ja: '米国', en: 'USA', zh: '美国', ko: '미국' },
        point: {
          ja: '施政権を日本に返還・最終主権は中立・日米安保5条適用',
          en: 'Administrative rights returned in 1972; neutral on sovereignty; US-Japan Treaty Art 5 applies',
          zh: '1972年归还施政权·最终主权中立·美日安保条约第5条适用',
          ko: '1972년 시정권 반환·최종 주권 중립·미일 안보조약 제5조 적용 확인',
        },
      },
    ],
  },
];

export default function FeaturedEvents({ lang }: FeaturedEventsProps) {
  const activeLang = (lang as Language) in translations ? (lang as Language) : 'en';
  const t = translations[activeLang] || translations.en;

  const eventLink = (id: string) => (activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`);

  return (
    <section className="featured-section">
      {/* Section Header with fiery vibe */}
      <div className="featured-section-header">
        <h2 className="featured-section-title">
          {t.featuredTitle}
        </h2>
        <p className="featured-section-subtitle">
          {t.featuredSubtitle}
        </p>
      </div>

      {/* Grid of 3 Top Contested Events */}
      <div className="featured-grid">
        {FEATURED_ITEMS.map((item) => {
          const itemTitle = (item.title[activeLang] ?? item.title.en);
          const itemCategory = (item.category[activeLang] ?? item.category.en);

          return (
            <div key={item.id} className="featured-card glass">
              {/* Image & Rank Badge */}
              <div className="featured-card-image-wrap">
                <img
                  src={item.imageUrl}
                  alt={itemTitle}
                  className="featured-card-image"
                  loading="lazy"
                />
                <div className={`featured-rank-badge rank-${item.rank}`}>
                  <span className="rank-num">#{item.rank}</span>
                </div>
                <div className="featured-tags-overlay">
                  <span className="featured-tag">{item.year}</span>
                  <span className="featured-tag">{itemCategory}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="featured-card-body">
                <h3 className="featured-card-title">{itemTitle}</h3>

                {/* Country Comparison Bar */}
                <div className="featured-countries-bar">
                  {item.countries.map((c, idx) => (
                    <span key={idx} className="country-badge">
                      <span className="flag-icon">{c.flag}</span>
                      <span>{(c.name[activeLang] ?? c.name.en)}</span>
                    </span>
                  ))}
                </div>

                {/* Core Divergence Points */}
                <div className="featured-divergence-box">
                  <div className="divergence-label">
                    <span>⚡ {t.keyDivergence}</span>
                  </div>
                  <ul className="divergence-list">
                    {item.divergencePoints.map((dp, idx) => (
                      <li key={idx} className="divergence-item">
                        <span className="divergence-flag">{dp.flag}</span>
                        <span className="divergence-text">
                          <strong>{(dp.countryName[activeLang] ?? dp.countryName.en)}:</strong>{' '}
                          {(dp.point[activeLang] ?? dp.point.en)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Link / CTA */}
                <div className="featured-card-action">
                  <Link href={eventLink(item.id)} className="featured-diff-btn">
                    <span>{t.viewDiff}</span>
                    <span className="arrow-icon">→</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
