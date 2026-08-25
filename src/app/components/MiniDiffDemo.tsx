'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DiffView from '@/app/components/DiffView';
import ControversyKeywords from '@/app/components/ControversyKeywords';
import { analyzeControversyDiff } from '@/lib/diffAnalysis';
import { translations, Language } from '@/lib/translations';

interface MiniDiffDemoProps {
  lang: string;
}

interface DemoPerspective {
  countryCode: string;
  countryName: Record<Language, string>;
  flag: string;
  excerpt: Record<Language, string>;
}

interface DemoEvent {
  id: string;
  title: Record<Language, string>;
  year: string;
  divergenceSummary: Record<Language, string>;
  defaultLeft: string;
  defaultRight: string;
  perspectives: DemoPerspective[];
}

const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 'nanjing-massacre',
    title: {
      ja: '南京事件 / 南京大屠殺',
      en: 'Nanjing Massacre (The Rape of Nanking)',
      zh: '南京大屠杀 / 南京事件',
      ko: '난징 사건 / 난징 대학살',
    },
    year: '1937',
    divergenceSummary: {
      ja: '【対立の焦点】犠牲者数（中国: 30万人以上 vs 日本: 多数・諸説あり vs 米国: 数万〜30万人以上）および事件の呼称（大虐殺 vs 事件）。',
      en: '【Core Divergence】Death toll (China: 300,000+ vs Japan: numerous / disputed vs USA: tens of thousands to 300,000+) and naming (Massacre vs Incident).',
      zh: '【争议焦点】遇难者人数（中国：30万人以上 vs 日本：多数/存争议 vs 美国：数万至30万人以上）及定性命名（大屠杀 vs 事件）。',
      ko: '【핵심 쟁점】희생자 수(중국: 30만 명 이상 vs 일본: 다수/여러 설 존재 vs 미국: 수만~30만 명 이상) 및 사건 명칭(대학살 vs 사건).',
    },
    defaultLeft: 'china',
    defaultRight: 'japan',
    perspectives: [
      {
        countryCode: 'china',
        countryName: { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
        flag: '🇨🇳',
        excerpt: {
          ja: '1937年12月13日、日本侵略軍は南京を占領し、組織的かつ計画的に市民や捕虜を虐殺しました。犠牲者の数は30万人以上に達し、人類史上最も残虐な蛮行の一つとして国家公祭日に追悼されています。',
          en: 'On December 13, 1937, the Japanese invading army occupied Nanjing and systematically massacred disarmed soldiers and civilians. The death toll exceeded 300,000 victims, recognized as one of the most brutal atrocities in human history.',
          zh: '1937年12月13日，日本侵略军占领南京，对无辜市民和放下武器的俘虏进行了灭绝人性的惨绝人寰的大屠杀。遇难者总数达30万人以上，每年12月13日设立为国家公祭日予以悼念。',
          ko: '1937년 12월 13일, 일본 침략군은 난징을 점령하고 무고한 시민과 무기를 버린 포로를 조직적으로 학살했습니다. 희생자 수는 30만 명 이상에 달하며, 인류 역사상 가장 잔혹한 만행 중 하나로 국가 추모일에 기리고 있습니다.',
        },
      },
      {
        countryCode: 'japan',
        countryName: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
        flag: '🇯🇵',
        excerpt: {
          ja: '1937年12月、日本軍は日中戦争の中で首都南京を占領しました。この過程で捕虜や民間人に対して多数の殺害や略奪（南京事件）が発生しましたが、犠牲者の規模については様々な見解があり今日でも議論が続いています。',
          en: 'In December 1937, during the escalation of the Second Sino-Japanese War, the Japanese army occupied the capital Nanjing. During this process, numerous killings and looting of prisoners and civilians occurred (Nanjing Incident), though estimates of the death toll vary widely and remain debated.',
          zh: '1937年12月，日军在日中战争战线扩大中占领了首都南京。在此过程中，日军对俘虏和非武装平民造成了多数杀害与掠夺行为（南京事件），关于牺牲者人数存在多种不同见解，至今仍有学术争议。',
          ko: '1937년 12월, 일본군은 중일전쟁 중 수도 난징을 점령했습니다. 이 과정에서 포로와 민간인에 대한 다수의 살해와 약탈(난징 사건)이 발생했으나, 희생자 규모에 대해서는 다양한 견해가 있어 오늘날에도 논쟁이 계속되고 있습니다.',
        },
      },
      {
        countryCode: 'usa',
        countryName: { ja: 'アメリカ合衆国', en: 'United States', zh: '美国', ko: '미국' },
        flag: '🇺🇸',
        excerpt: {
          ja: '1937年12月、日本軍は南京を占領し、大規模な残虐行為（The Rape of Nanking）を行いました。数万人から30万人以上が殺害されたと推定され、安全区の欧米人が市民の救援活動を行いました。',
          en: 'In December 1937, Japanese forces captured Nanjing and unleashed weeks of atrocities known as The Rape of Nanking. An estimated tens of thousands to over 300,000 civilians and POWs were murdered, while Western residents organized an International Safety Zone.',
          zh: '1937年12月，日军占领南京并实施了持续数周的大规模暴行（The Rape of Nanking）。据估计有数万至30万人以上的平民与战俘被杀害，留守的欧美人士设立了南京安全区救助难民。',
          ko: '1937년 12월, 일본군은 난징을 점령하고 수 주간 대규모 만행(The Rape of Nanking)을 자행했습니다. 수만 명에서 30만 명 이상의 민간인과 포로가 살해된 것으로 추정되며, 서구인들이 설립한 국제안전구역이 피난민을 구호했습니다.',
        },
      },
    ],
  },
  {
    id: 'comfort-women',
    title: {
      ja: '慰安婦問題',
      en: 'Comfort Women Controversy',
      zh: '慰安妇问题',
      ko: '일본군 "위안부" 문제',
    },
    year: '1930s-1945',
    divergenceSummary: {
      ja: '【対立の焦点】強制性の認定（軍・官憲による強制動員・性的奴隷 vs 業者による商業的募集・軍の直接関与否定）と法的補償の有効性。',
      en: '【Core Divergence】Coercion and state responsibility (organized sexual slavery vs civilian recruitment) and the validity of legal settlements.',
      zh: '【争议焦点】强制性与国家责任认定（有组织强征性奴隶 vs 民间商业招募与否认军方直接强征）及法律赔偿诉求。',
      ko: '【핵심 쟁점】강제성 및 국가 책임 인정(조직적 성노예 동원 vs 민간 모집 및 직접 강제연행 부인)과 법적 배상 유효성.',
    },
    defaultLeft: 'korea',
    defaultRight: 'japan',
    perspectives: [
      {
        countryCode: 'korea',
        countryName: { ja: '韓国', en: 'South Korea', zh: '韩国', ko: '한국' },
        flag: '🇰🇷',
        excerpt: {
          ja: '日本帝国主義は朝鮮半島の若い女性たちを詐欺や暴力により組織的に動員し、性的奴隷（慰安婦）として人権を著しく侵害しました。被害者の尊厳回復と日本政府による公式謝罪・法的賠償を一貫して求めています。',
          en: 'Imperial Japan systematically mobilized young Korean women through deception and coercion, subjecting them to sexual slavery in comfort stations. Survivors and civil society continue to demand formal apology and legal reparations.',
          zh: '日本帝国主义通过欺骗与暴力手段，有组织地强征朝鲜半岛及亚洲年轻女性充当“慰安妇”（性奴隶），严重侵犯人权。受害者一贯要求日本政府承担法律责任并进行官方谢罪与赔偿。',
          ko: '일본 제국주의는 조선 반도의 젊은 여성들을 기만과 폭력으로 조직적으로 동원하여 성노예(위안부)로 삼아 심각한 인권 침해를 자행했습니다. 피해자의 명예 회복과 일본 정부의 공식 사죄 및 법적 배상을 일관되게 요구하고 있습니다.',
        },
      },
      {
        countryCode: 'japan',
        countryName: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
        flag: '🇯🇵',
        excerpt: {
          ja: '戦地に設けられた慰安施設には朝鮮半島等から女性が集められました。日本政府は河野談話でお詫びを表明し、アジア女性基金や日韓合意を通じて対応を行っており、請求権協定により法的には解決済みとの立場です。',
          en: 'Women from Korea and elsewhere were gathered at wartime comfort facilities. The Japanese government expressed apologies in the 1993 Kono Statement and addressed the issue through funds and bilateral agreements, maintaining legal claims were settled.',
          zh: '战地设立的慰安设施中招募了来自朝鲜半岛等地的女性。日本政府通过河野谈话表达了道歉与反省，并通过亚洲女性基金与日韩协议进行应对，同时主张该问题在法律上已通过日韩请求权协定解决。',
          ko: '전지에 설치된 위안시설에는 조선반도 등에서 여성들이 모였습니다. 일본 정부는 고노 담화를 통해 사죄를 표명하고 아시아여성기금 및 한일 합의를 통해 대응해 왔으며, 청구권 협정으로 법적으로는 해결되었다는 입장입니다.',
        },
      },
      {
        countryCode: 'china',
        countryName: { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
        flag: '🇨🇳',
        excerpt: {
          ja: '日本軍は占領地域に慰安所を設置し、20万人以上の中国人女性を含むアジア各地の女性に組織的な性暴力を加えました。軍国主義の重大な人道犯罪として位置づけられています。',
          en: 'The Japanese military established comfort stations across occupied territories, subjecting over 200,000 Chinese and Asian women to organized sexual violence as a severe humanitarian crime.',
          zh: '日军在各占领区设立慰安所，强迫包括20万名以上中国妇女在内的亚洲各国女性充当慰安妇，实施有组织的性暴力，是日本军国主义犯下的严重反人类罪行。',
          ko: '일본군은 점령지역에 위안소를 설치하고 20만 명 이상의 중국인 여성을 포함한 아시아 각국의 여성들에게 조직적인 성폭력을 가했습니다. 군국주의의 중대한 반인도적 범죄로 규정하고 있습니다.',
        },
      },
    ],
  },
  {
    id: 'senkaku',
    title: {
      ja: '尖閣諸島（釣魚島）領有権問題',
      en: 'Senkaku / Diaoyu Islands Dispute',
      zh: '钓鱼岛及其附属岛屿主权问题',
      ko: '센카쿠 열도 (댜오위다오) 영유권 분쟁',
    },
    year: '1885-Present',
    divergenceSummary: {
      ja: '【対立の焦点】編入の合法性（日本: 1895年無主地先占・固有の領土 vs 中国/台湾: 明清代からの固有領土・日清戦争末期の不法盗取）。',
      en: '【Core Divergence】Legitimacy of incorporation (Japan: terra nullius terra occupation in 1895 vs China/Taiwan: historical territory since Ming dynasty illegally annexed).',
      zh: '【争议焦点】领土归属与编入合法性（日本：1895年无主地先占·固有领土 vs 中国/台湾：明清以来固有领土·甲午战末非法窃取）。',
      ko: '【핵심 쟁점】편입의 합법성(일본: 1895년 무주지 선점·고유 영토 vs 중국/대만: 명·청대 이래 고유 영토·청일전쟁 말기 불법 찬탈).',
    },
    defaultLeft: 'japan',
    defaultRight: 'china',
    perspectives: [
      {
        countryCode: 'japan',
        countryName: { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
        flag: '🇯🇵',
        excerpt: {
          ja: '1895年に現地調査を行い清国の支配が及んでいない無主地であることを確認の上、閣議決定により正式に沖縄県に編入しました。歴史的にも国際法上も日本固有の領土であり、現在有効に支配しており解決すべき領有権問題は存在しません。',
          en: 'In 1895, after thorough surveys confirming the islands were terra nullius, Japan officially incorporated them by Cabinet decision. Japan maintains the islands are an inherent part of its territory with no territorial dispute to be resolved.',
          zh: '1895年经过实地调查确认这些岛屿为无主地后，日本通过内阁决议正式编入冲绳县。无论在历史上还是国际法上均属日本固有领土，目前处于有效支配下，不存在需要解决的领有权问题。',
          ko: '1895년 현지 조사를 거쳐 청나라의 지배가 미치지 않는 무주지임을 확인한 후, 각의 결정을 통해 정식으로 오키나와현에 편입했습니다. 역사적으로나 국제법상으로도 일본 고유의 영토이며 해결해야 할 영유권 문제는 존재하지 않는다는 입장입니다.',
        },
      },
      {
        countryCode: 'china',
        countryName: { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
        flag: '🇨🇳',
        excerpt: {
          ja: '釣魚島とその附属島嶼は明・清代より中国固有の領土です。1895年に日本が日清戦争末期に不法に盗取したものであり、カイロ宣言に基づき返還されるべき正当な主権を有しています。',
          en: 'Diaoyu Dao and its affiliated islands have been China’s inherent territory since the Ming and Qing dynasties. Japan illegally seized them in 1895 during the First Sino-Japanese War, and sovereignty must be restored under the Cairo Declaration.',
          zh: '钓鱼岛及其附属岛屿自明清以来就是中国的固有领土。1895年日本在甲午战争末期非法窃取该岛屿，根据《开罗宣言》等战后国际文件，中国对钓鱼岛拥有无可争辩的完全主权。',
          ko: '댜오위다오와 그 부속 도서는 명·청 시대부터 중국 고유의 영토입니다. 1895년 일본이 청일전쟁 말기에 불법으로 찬탈한 것이며, 카이로 선언에 따라 반환되어야 할 정당한 주권을 보유하고 있습니다.',
        },
      },
      {
        countryCode: 'usa',
        countryName: { ja: 'アメリカ合衆国', en: 'United States', zh: '美国', ko: '미국' },
        flag: '🇺🇸',
        excerpt: {
          ja: '戦後、米国の施政権下に置かれた後、1972年に日本へ施政権が返還されました。米国は最終主権について中立の立場をとる一方、日米安全保障条約第5条が適用される領域であることを確認しています。',
          en: 'Administered under US jurisdiction post-WWII, administrative rights were returned to Japan in 1972. The US takes no position on ultimate sovereignty while affirming that Article 5 of the US-Japan Security Treaty applies to the islands.',
          zh: '战后由美国行使施政权，后于1972年将施政权归还日本。美国对最终主权归属保持中立立场，但重申《美日安保条约》第5条适用于该群岛。',
          ko: '전후 미국의 시정권 하에 놓였다가 1972년 일본에 시정권이 반환되었습니다. 미국은 최종 주권에 대해 중립을 유지하면서도 미일 안전보장조약 제5조가 적용되는 영역임을 재확인하고 있습니다.',
        },
      },
    ],
  },
];

export default function MiniDiffDemo({ lang }: MiniDiffDemoProps) {
  const activeLang = (lang as Language) in translations ? (lang as Language) : 'en';
  const t = translations[activeLang] || translations.en;

  const [selectedEventId, setSelectedEventId] = useState<string>('nanjing-massacre');
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);

  const currentEvent = useMemo(
    () => DEMO_EVENTS.find((e) => e.id === selectedEventId) || DEMO_EVENTS[0]!,
    [selectedEventId]
  );

  // Set country perspective selections based on event
  const [leftCountry, setLeftCountry] = useState<string>(() => {
    // Follow perspective rule: prefer Japan if ja, otherwise defaultLeft
    if (activeLang === 'ja' && currentEvent.perspectives.some((p) => p.countryCode === 'japan')) {
      return 'japan';
    }
    return currentEvent.defaultLeft;
  });

  const [rightCountry, setRightCountry] = useState<string>(() => {
    if (activeLang === 'ja' && currentEvent.defaultLeft === 'japan') {
      return currentEvent.defaultRight;
    }
    return currentEvent.defaultRight;
  });

  // When switching event tab, adjust countries safely
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveKeyword(null);
    const targetEvent = DEMO_EVENTS.find((e) => e.id === eventId) || DEMO_EVENTS[0]!;
    
    // Choose appropriate default sides
    if (activeLang === 'ja' && targetEvent.perspectives.some((p) => p.countryCode === 'japan')) {
      setLeftCountry('japan');
      const other = targetEvent.perspectives.find((p) => p.countryCode !== 'japan')?.countryCode || targetEvent.defaultRight;
      setRightCountry(other);
    } else {
      setLeftCountry(targetEvent.defaultLeft);
      setRightCountry(targetEvent.defaultRight);
    }
  };

  const handleSwap = () => {
    setLeftCountry(rightCountry);
    setRightCountry(leftCountry);
    setActiveKeyword(null);
  };

  const leftPerspective = useMemo(
    () => currentEvent.perspectives.find((p) => p.countryCode === leftCountry) || currentEvent.perspectives[0]!,
    [currentEvent, leftCountry]
  );

  const rightPerspective = useMemo(
    () => currentEvent.perspectives.find((p) => p.countryCode === rightCountry) || currentEvent.perspectives[1] || currentEvent.perspectives[0]!,
    [currentEvent, rightCountry]
  );

  const leftText = (leftPerspective.excerpt[activeLang] ?? leftPerspective.excerpt.en);
  const rightText = (rightPerspective.excerpt[activeLang] ?? rightPerspective.excerpt.en);

  // Compute controversy analysis (exclusive words and terminology contrasts)
  const analysis = useMemo(() => {
    return analyzeControversyDiff(leftText, rightText, activeLang);
  }, [leftText, rightText, activeLang]);

  const contrastTerms = useMemo(() => {
    return analysis.contrasts.flatMap((c) => [c.oldTerm, c.newTerm]);
  }, [analysis]);

  const leftCountryName = (leftPerspective.countryName[activeLang] ?? leftPerspective.countryName.en);
  const rightCountryName = (rightPerspective.countryName[activeLang] ?? rightPerspective.countryName.en);

  const leftTitle = `${leftPerspective.flag} ${leftCountryName}`;
  const rightTitle = `${rightPerspective.flag} ${rightCountryName}`;

  const eventLink = activeLang === 'en' ? `/events/${currentEvent.id}` : `/${activeLang}/events/${currentEvent.id}`;

  return (
    <section className="mini-demo-wrapper glass">
      {/* Header with live badge */}
      <div className="mini-demo-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span className="live-demo-badge">
            <span className="live-dot" />
            {t.miniDemoBadge}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {currentEvent.year}
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
          {t.miniDemoTitle}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {t.miniDemoSubtitle}
        </p>
      </div>

      {/* Event Case Selector Pills */}
      <div className="mini-demo-event-pills">
        {DEMO_EVENTS.map((event) => {
          const isSelected = event.id === selectedEventId;
          const eventTitle = (event.title[activeLang] ?? event.title.en);
          return (
            <button
              key={event.id}
              onClick={() => handleSelectEvent(event.id)}
              className={`mini-demo-tab ${isSelected ? 'active' : ''}`}
            >
              <span className="tab-year">{event.year}</span>
              <span className="tab-title">{eventTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Select Left vs Right Country & Swap */}
      <div className="mini-demo-controls">
        <div className="country-select-box">
          <span className="side-label">{t.sourcePerspective}</span>
          <div className="select-pill-group">
            {currentEvent.perspectives.map((p) => {
              const isActive = p.countryCode === leftCountry;
              const isOtherActive = p.countryCode === rightCountry;
              return (
                <button
                  key={`left-${p.countryCode}`}
                  disabled={isOtherActive}
                  onClick={() => {
                    setLeftCountry(p.countryCode);
                    setActiveKeyword(null);
                  }}
                  className={`country-pill left-pill ${isActive ? 'active' : ''} ${isOtherActive ? 'disabled' : ''}`}
                >
                  <span>{p.flag}</span>
                  <span>{p.countryName[activeLang] ?? p.countryName.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="swap-button"
          title={t.swap}
          aria-label={t.swap}
        >
          ⇄
        </button>

        <div className="country-select-box">
          <span className="side-label">{t.targetPerspective}</span>
          <div className="select-pill-group">
            {currentEvent.perspectives.map((p) => {
              const isActive = p.countryCode === rightCountry;
              const isOtherActive = p.countryCode === leftCountry;
              return (
                <button
                  key={`right-${p.countryCode}`}
                  disabled={isOtherActive}
                  onClick={() => {
                    setRightCountry(p.countryCode);
                    setActiveKeyword(null);
                  }}
                  className={`country-pill right-pill ${isActive ? 'active' : ''} ${isOtherActive ? 'disabled' : ''}`}
                >
                  <span>{p.flag}</span>
                  <span>{p.countryName[activeLang] ?? p.countryName.en}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Core Divergence Summary */}
      <div className="divergence-banner">
        <span>{(currentEvent.divergenceSummary[activeLang] ?? currentEvent.divergenceSummary.en)}</span>
      </div>

      {/* ── Controversy Keywords Analysis Panel (Automatic Extraction) ── */}
      <ControversyKeywords
        analysis={analysis}
        oldCountry={leftCountryName}
        newCountry={rightCountryName}
        lang={activeLang}
        activeKeyword={activeKeyword}
        onKeywordClick={(word) => {
          setActiveKeyword((prev) => (prev === word ? null : word));
        }}
      />

      {/* ── Enhanced Git Diff Viewer Area ── */}
      <div style={{ marginTop: '1.25rem' }}>
        <DiffView
          oldValue={leftText}
          newValue={rightText}
          oldTitle={leftTitle}
          newTitle={rightTitle}
          lang={activeLang}
          highlightKeyword={activeKeyword}
          contrastTerms={contrastTerms}
        />
      </div>

      {/* Action Footer */}
      <div className="mini-demo-footer">
        <Link href={eventLink} className="mini-demo-cta">
          <span>{t.viewFullComparison}</span>
        </Link>
      </div>
    </section>
  );
}
