import { Language } from './translations';
import { EventPerspective } from './markdown';

export interface LocalizedString {
  ja: string;
  en: string;
  zh: string;
  ko: string;
}

export interface QuizItem {
  id: string;
  eventId: string;
  eventTitle: LocalizedString;
  excerpt: LocalizedString;
  country: LocalizedString;
  options: LocalizedString[];
  explanation: LocalizedString;
  clue: LocalizedString;
}

export const curatedQuizList: QuizItem[] = [
  {
    id: 'quiz-nanjing-1',
    eventId: 'nanjing-massacre',
    eventTitle: {
      ja: '南京事件（1937年）',
      en: 'Nanjing Incident (1937)',
      zh: '南京大屠杀（1937年）',
      ko: '난징 사건 (1937년)',
    },
    excerpt: {
      ja: '「日本軍は南京を占領し、その過程で多数の中国軍捕虜や一般市民を殺害した。死者数については数万人から数十万人まで諸説があり、歴史研究において議論が続いている。」',
      en: '"The Japanese military captured Nanjing, killing many Chinese prisoners of war and civilians in the process. Estimates for the death toll vary from tens of thousands to hundreds of thousands, and debate continues among historical researchers."',
      zh: '“日军占领南京，在此过程中杀害了大量中国战俘和平民。关于遇难人数，从数万人到数十万人存在多种说法，历史学界对此仍在进行探讨。”',
      ko: '"일본군은 난징을 점령하고 그 과정에서 다수의 중국군 포로와 일반 시민을 살해했다. 사망자 수에 대해서는 수만 명에서 수십만 명까지 여러 설이 있어 역사 연구에서 논쟁이 계속되고 있다."',
    },
    country: {
      ja: '日本',
      en: 'Japan',
      zh: '日本',
      ko: '일본',
    },
    options: [
      { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
      { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
      { ja: 'アメリカ', en: 'United States', zh: '美国', ko: '미국' },
      { ja: 'イギリス', en: 'United Kingdom', zh: '英国', ko: '영국' },
    ],
    clue: {
      ja: '死者数について「30万人」と断定せず「諸説があり議論が続いている」と慎重に併記する記述',
      en: 'Describes death toll with academic plurality ("estimates vary") rather than fixing at 300,000.',
      zh: '未直接定论“30万人”，而是表述为“存在多种说法，学界仍在探讨”。',
      ko: '사망자 수를 30만 명으로 단정하지 않고 "여러 설이 있어 논쟁 중"이라며 신중하게 기술함.',
    },
    explanation: {
      ja: '日本の教科書では、軍の不法行為を認めつつも、犠牲者数については公認の確定数を定めず「諸説ある」と併記する傾向があります。一方、中国の教科書では「30万人以上の同胞が虐殺された」と明記されます。',
      en: 'Japanese textbooks acknowledge unlawful military conduct but consistently mention that estimates vary across researchers. In contrast, Chinese textbooks explicitly state that over 300,000 compatriots were massacred.',
      zh: '日本教科书在承认军方不法行为的同时，往往不设定官方确切数字，而是并列“存在多种学说”。而中国教科书则明确记述“30万同胞惨遭杀害”。',
      ko: '일본 교과서는 군의 불법 행위를 인정하면서도 희생자 수에 대해서는 확정 수치를 정하지 않고 "여러 설이 있다"고 병기하는 경향이 있습니다. 반면 중국 교과서는 "30만 명 이상 학살"로 명기합니다.',
    },
  },
  {
    id: 'quiz-comfort-women-1',
    eventId: 'comfort-women',
    eventTitle: {
      ja: '慰安婦問題',
      en: 'Comfort Women Issue',
      zh: '慰安妇问题',
      ko: '위안부 문제',
    },
    excerpt: {
      ja: '「日中戦争から太平洋戦争にかけて、多くの女性が戦地へ送られ、尊厳と自由を著しく奪われた。軍の関与や強制性については河野談話等で謝罪と反省が表明されているが、補償に関する法的解釈を巡り今なお二国間で対立がある。」',
      en: '"From the Second Sino-Japanese War through the Pacific War, many women were sent to the frontlines and deprived of dignity and freedom. The government expressed remorse through the Kono Statement, but legal interpretations of compensation remain contested between both nations."',
      zh: '“从中日战争到太平洋战争期间，许多女性被送往战区，尊严与自由受到严重剥夺。虽然通过河野谈话等表达了道歉与反省，但在关于赔偿的法律解释上两国至今仍存争议。”',
      ko: '"중일전쟁부터 태평양전쟁에 걸쳐 많은 여성이 전지로 보내져 존엄과 자유를 심각하게 박탈당했다. 군의 관여와 강제성에 대해서는 고노 담화 등으로 사죄와 반성이 표명되었으나, 보상에 관한 법적 해석을 둘러싸고 여전히 양국 간 대립이 있다."',
    },
    country: {
      ja: '日本',
      en: 'Japan',
      zh: '日本',
      ko: '일본',
    },
    options: [
      { ja: '韓国', en: 'South Korea', zh: '韩国', ko: '한국' },
      { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
      { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
      { ja: '台湾', en: 'Taiwan', zh: '台湾', ko: '대만' },
    ],
    clue: {
      ja: '「河野談話での反省」と「日韓請求権協定による法的解決」の文脈に触れる記述',
      en: 'References the historical Kono Statement alongside the legal debate over claims agreements.',
      zh: '提及“河野谈话的反省”以及两国在赔偿法律解释上的分歧。',
      ko: '고노 담화에 따른 반성 표명과 청구권 등 법적 해석의 양국 간 대립을 함께 언급함.',
    },
    explanation: {
      ja: '日本の記述では河野談話や歴代内閣の見解に触れつつ、1965年の日韓請求権協定による法的解決の立場を併記します。韓国の教科書では「日本軍による組織的・強制的な性奴隷制」として国家の直接責任を強調します。',
      en: 'Japanese narratives cite the Kono Statement while noting the legal resolution under the 1965 treaty. South Korean textbooks focus on the institutionalized, coercive nature of military sexual slavery.',
      zh: '日本记述在提及河野谈话等历届政府立场的同​​时，往往强调1965年请求权协定等法律框架；而韩国教科书则强调“日军有组织的强制性奴隶制度”与国家直接责任。',
      ko: '일본 서술은 고노 담화를 언급하면서도 1965년 청구권 협정에 따른 법적 해결 입장을 병기합니다. 반면 한국 교과서는 "일본군에 의한 조직적·강제적 성노예제"로서 국가의 직접 책임을 강조합니다.',
    },
  },
  {
    id: 'quiz-korea-colonization-1',
    eventId: 'korea-colonization',
    eventTitle: {
      ja: '韓国併合（1910年）',
      en: 'Annexation of Korea (1910)',
      zh: '日韩合并（1910年）',
      ko: '한국 병합 / 국권 피탈 (1910년)',
    },
    excerpt: {
      ja: '「日露戦争後、ロシアの脅威を防ぎ東アジアの安定を図るため、大韓帝国との間で条約を締結し併合を行った。近代的なインフラ整備や教育制度の導入が進められた一方、民族的抵抗運動も起きた。」',
      en: '"Following the Russo-Japanese War, a treaty was signed with the Korean Empire to secure stability in East Asia against Russian expansion. Modern infrastructure and educational systems were introduced, while national resistance movements also emerged."',
      zh: '“日俄战争后，为防范俄罗斯威胁并维持东亚稳定，与大韩帝国签订条约实现合并。在推进近代基础设施建设与教育制度的同时，也引发了民族抵抗运动。”',
      ko: '"러일전쟁 후 러시아의 위협을 방지하고 동아시아의 안정을 도모하기 위해 대한제국과 조약을 체결하고 병합을 단행했다. 근대적인 인프라 정비와 교육 제도 도입이 추진된 한편, 민족적 저항 운동도 일어났다."',
    },
    country: {
      ja: '日本',
      en: 'Japan',
      zh: '日本',
      ko: '일본',
    },
    options: [
      { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
      { ja: '韓国', en: 'South Korea', zh: '韩国', ko: '한국' },
      { ja: 'ロシア', en: 'Russia', zh: '俄罗斯', ko: '러시아' },
      { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
    ],
    clue: {
      ja: '「条約に基づく併合」「近代化インフラの導入」という統治側の法的位置づけと開発の文脈',
      en: 'Frames the annexation as a treaty-based arrangement for regional security alongside modernization.',
      zh: '将合并定性为“基于条约”的合法程序，并强调近代化基础设施建设与东亚稳定。',
      ko: '조약에 기반한 병합과 근대화 인프라 도입 등 통치 측의 법적 명분과 개발 관점을 서술함.',
    },
    explanation: {
      ja: '日本の教科書では当時の国際情勢や条約締結の手続き、インフラ整備に触れる記述が多く見られます。韓国の教科書では「国権被奪」「強制併合」と位置づけ、条約の無効性や徹底した主権強奪・皇民化政策の抑圧を強調します。',
      en: 'Japanese accounts often focus on geopolitical context and institutional changes. South Korean textbooks term this "Forced Annexation" (Guk-gwon Pi-tal), declaring treaties invalid and highlighting violent colonial subjugation.',
      zh: '日本教科书多从国际局势、条约程序及近代化建设展开；韩国教科书则定性为“强占”与“国权被夺”，强调条约非法性及殖民同化政策的压迫。',
      ko: '일본 교과서는 당시 국제정세와 조약 체결 절차, 인프라 정비를 언급하는 반면, 한국 교과서는 "국권 피탈", "강제 병합"으로 규정하여 조약의 불법 무효성과 가혹한 식민지 억압을 강조합니다.',
    },
  },
  {
    id: 'quiz-afghanistan-1',
    eventId: 'afghanistan-conflict',
    eventTitle: {
      ja: 'アフガニスタン紛争',
      en: 'Afghanistan Conflict',
      zh: '阿富汗冲突',
      ko: '아프가니스탄 분쟁',
    },
    excerpt: {
      ja: '「20年にわたる不当な外国占領と傀儡政権を排し、イスラムの法と民族の誇りを守る聖戦（ジハード）によって完全なる独立を回復した。」',
      en: '"Ending 20 years of illegitimate foreign occupation and puppet rule, our holy struggle (Jihad) restored full national sovereignty under Islamic law."',
      zh: '“结束了长达20年的非法外国侵略与傀儡政权统治，通过维护伊斯兰律法与民族尊严的圣战，恢复了完全的国家独立。”',
      ko: '"20년에 걸친 부당한 외국 점령과 괴뢰 정권을 몰아내고, 이슬람 율법과 민족의 긍지를 지키는 성전(지하드)을 통해 완전한 독립을 회복했다."',
    },
    country: {
      ja: 'タリバン（アフガニスタン）',
      en: 'Taliban (Afghanistan)',
      zh: '塔利班（阿富汗）',
      ko: '탈레반 (아프가니스탄)',
    },
    options: [
      { ja: 'タリバン（アフガニスタン）', en: 'Taliban (Afghanistan)', zh: '塔利班（阿富汗）', ko: '탈레반 (아프가니스탄)' },
      { ja: 'アメリカ', en: 'United States', zh: '美国', ko: '미국' },
      { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
      { ja: 'ロシア', en: 'Russia', zh: '俄罗斯', ko: '러시아' },
    ],
    clue: {
      ja: '「傀儡政権を排し」「イスラムの法を守る聖戦」「完全なる独立回復」という語彙',
      en: 'Key ideological terms: "holy struggle (Jihad)", "puppet regime", and "restoration of sovereignty".',
      zh: '使用“傀儡政权”、“圣战”以及“恢复完全独立”等高度意识形态化的表述。',
      ko: '"괴뢰 정권", "이슬람 율법 수호 성전", "완전한 독립 회복"이라는 용어 사용.',
    },
    explanation: {
      ja: 'タリバン政権の公式言説では、米軍の駐留を「外国による不当な侵略・占領」とし、自らの政権奪還を「神の導きによる解放と勝利」と位置付けています。米国側は「対テロ自衛戦争」と位置づけています。',
      en: 'Taliban accounts frame US presence as illegal occupation and their 2021 return as a righteous liberation. The US frames the operation as self-defense and counterterrorism following 9/11.',
      zh: '塔利班官方话语将美军进驻定性为“外国非法侵略”，将夺取政权视为“正义的解放与胜利”；而美国则定性为9/11事件后的“反恐自卫战争”。',
      ko: '탈레반 공식 서술은 미군 주둔을 "부당한 외세 침략"으로, 2021년 정권 재장악을 "해방과 승리"로 규정합니다. 반면 미국은 9/11 테러에 대한 "자위적 대테러 전쟁"으로 기술합니다.',
    },
  },
  {
    id: 'quiz-ukraine-1',
    eventId: 'ukraine-invasion',
    eventTitle: {
      ja: 'ウクライナ情勢（2022年〜）',
      en: 'Ukraine Crisis (2022-)',
      zh: '乌克兰危机（2022年起）',
      ko: '우크라이나 사태 (2022년~)',
    },
    excerpt: {
      ja: '「NATOの東方拡大という安全保障上の脅威に対処し、ドンバス地方のロシア系住民を保護するため、非軍事化・非ナチ化を目的とした特別軍事作戦を開始した。」',
      en: '"To counter the security threat posed by NATO eastward expansion and protect Russian-speaking residents of Donbas, a Special Military Operation was launched for demilitarization and denazification."',
      zh: '“为应对北约东扩对国家安全构成的根本威胁，保护顿巴斯地区的讲俄语居民，启动了以非军事化和去纳粹化为目标的特别军事行动。”',
      ko: '"NATO의 동진이라는 안보 위협에 대처하고 돈바스 지역의 러시아계 주민을 보호하기 위해, 비군사화 및 비나치화를 목표로 한 특별군사작전을 개시했다."',
    },
    country: {
      ja: 'ロシア',
      en: 'Russia',
      zh: '俄罗斯',
      ko: '러시아',
    },
    options: [
      { ja: 'ロシア', en: 'Russia', zh: '俄罗斯', ko: '러시아' },
      { ja: 'ウクライナ', en: 'Ukraine', zh: '乌克兰', ko: '우크라이나' },
      { ja: 'アメリカ', en: 'United States', zh: '美国', ko: '미국' },
      { ja: 'ドイツ', en: 'Germany', zh: '德国', ko: '독일' },
    ],
    clue: {
      ja: '「特別軍事作戦」「非軍事化・非ナチ化」「NATO東方拡大の脅威」という公式フレーミング',
      en: 'Uses official terms: "Special Military Operation", "demilitarization", and "denazification".',
      zh: '使用“特别军事行动”、“去军事化与去纳粹化”、“应对北约东扩”等官方定性用语。',
      ko: '"특별군사작전", "비군사화·비나치화", "NATO 동진 위협"이라는 공식 용어 사용.',
    },
    explanation: {
      ja: 'ロシアの公式教科書・国定見解では「特別軍事作戦」と呼び、侵略ではなく祖国防衛とドンバス救済として説明します。一方、ウクライナや国際社会は「国連憲章に違反する全面的な不法侵略戦争」と強く非難しています。',
      en: 'Russian state textbooks term this a "Special Military Operation" for homeland security. Ukraine and international consensus classify it as an unprovoked, illegal war of aggression violating the UN Charter.',
      zh: '俄罗斯官方教科书将其称为“特别军事行动”，定性为保卫祖国安全；而乌克兰与国际主流社会则严厉谴责其为“公然违反联合国宪章的非法全面侵略战争”。',
      ko: '러시아 국정 교과서는 이를 "특별군사작전"으로 부르며 조국 방위와 동포 구원으로 기술합니다. 반면 우크라이나와 국제사회는 "유엔 헌장을 위반한 불법 침략 전쟁"으로 규정합니다.',
    },
  },
  {
    id: 'quiz-pacific-war-1',
    eventId: 'pacific-war-end',
    eventTitle: {
      ja: '太平洋戦争の終結と原爆投下',
      en: 'End of Pacific War & Atomic Bombings',
      zh: '太平洋战争结束与原子弹投放',
      ko: '태평양전쟁 종결과 원자폭탄 투하',
    },
    excerpt: {
      ja: '「日本本土への上陸作戦（ダウンフォール作戦）に伴う数十万人の米軍および日本人の犠牲を回避し、戦争を早期に終結させるために原子爆弾の使用が決断された。」',
      en: '"The atomic bomb was deployed to force an immediate surrender and prevent Operation Downfall, thereby saving hundreds of thousands of American and Japanese lives."',
      zh: '“为避免因登陆日本本土（没落行动）而导致数十万美军及日本平民的伤亡，并尽早结束战争，最终做出了使用原子弹的决断。”',
      ko: '"일본 본토 상륙작전(다운폴 작전)에 수반될 수십만 명의 미군 및 일본인 희생을 방지하고 전쟁을 조기에 종결시키기 위해 원자폭탄 사용이 결정되었다."',
    },
    country: {
      ja: 'アメリカ',
      en: 'United States',
      zh: '美国',
      ko: '미국',
    },
    options: [
      { ja: 'アメリカ', en: 'United States', zh: '美国', ko: '미국' },
      { ja: '日本', en: 'Japan', zh: '日本', ko: '일본' },
      { ja: 'ロシア', en: 'Russia', zh: '俄罗斯', ko: '러시아' },
      { ja: '中国', en: 'China', zh: '中国', ko: '중국' },
    ],
    clue: {
      ja: '「数百万の命を救い戦争を早期終結させた」という戦術的・人道的正当化ロジック',
      en: 'The classic military justification: shortening the war and saving lives from a bloody mainland invasion.',
      zh: '以“缩短战争、挽救大量美日士兵平民生命”作为使用原子武器的正当化理由。',
      ko: '"본토 상륙작전의 막대한 희생을 막고 전쟁을 조기 종결시켰다"는 미국식 정당화 논리.',
    },
    explanation: {
      ja: '米国の歴史教育では「本土侵攻による膨大な死傷者を防ぎ戦争を終わらせた」という正当化論が長年主流です。一方、日本の教科書は広島・長崎の非人道的な民間被害や被爆の実相に重きを置いて叙述します。',
      en: 'US textbooks historically emphasize that the bomb shortened the war and saved countless invasion casualties. Japanese textbooks emphasize catastrophic humanitarian devastation and civilian suffering in Hiroshima and Nagasaki.',
      zh: '美国教科书长期强调投弹“促成迅速投降、挽救了双方可能在本土登陆战中付出的巨大伤亡”；日本教科书则着重强调广岛与长崎遭受的非人道核灾难及平民惨烈牺牲。',
      ko: '미국 교과서는 "본토 상륙에 따른 막대한 사상자를 막고 전쟁을 끝냈다"는 정당화론을 강조하는 반면, 일본 교과서는 히로시마·나가사키의 비인도적 민간 피해와 피폭 실상을 중심으로 서술합니다.',
    },
  },
];

export function getQuizForEvent(eventId: string, perspectives: EventPerspective[], _lang?: Language): QuizItem | null {
  const curated = curatedQuizList.find((q) => q.eventId === eventId);
  if (curated) return curated;

  if (!perspectives || perspectives.length < 2) return null;

  // Generate dynamic quiz from event perspectives
  const targetPerspective = perspectives[0];
  const options = perspectives.map((p) => ({
    ja: p.country,
    en: p.country,
    zh: p.country,
    ko: p.country,
  }));

  const excerptText = targetPerspective.content.trim().split('\n')[0].slice(0, 160) + '...';

  return {
    id: `auto-${eventId}`,
    eventId,
    eventTitle: {
      ja: targetPerspective.title,
      en: targetPerspective.title,
      zh: targetPerspective.title,
      ko: targetPerspective.title,
    },
    excerpt: {
      ja: excerptText,
      en: excerptText,
      zh: excerptText,
      ko: excerptText,
    },
    country: {
      ja: targetPerspective.country,
      en: targetPerspective.country,
      zh: targetPerspective.country,
      ko: targetPerspective.country,
    },
    options,
    clue: {
      ja: `${targetPerspective.country}の視点に特有の表現や強調点`,
      en: `Phrasing characteristic of ${targetPerspective.country}'s perspective`,
      zh: `体现${targetPerspective.country}视角立场的表述`,
      ko: `${targetPerspective.country}의 관점을 반영한 특징적 서술`,
    },
    explanation: {
      ja: `この記述は${targetPerspective.country}の教科書（${targetPerspective.source}）からの引用です。`,
      en: `This excerpt is from ${targetPerspective.country}'s textbook (${targetPerspective.source}).`,
      zh: `该段记述引自${targetPerspective.country}的教科书（${targetPerspective.source}）。`,
      ko: `이 서술은 ${targetPerspective.country} 교과서(${targetPerspective.source})에서 인용한 것입니다.`,
    },
  };
}
