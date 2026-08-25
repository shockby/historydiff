/**
 * SEO & Discovery Keywords Mapping
 * Maps event IDs to high-search-volume keywords, synonyms, alternative names across languages.
 */

export interface EventKeywordSet {
  common: string[];
  en: string[];
  ja: string[];
  zh: string[];
  ko: string[];
}

export const EVENT_SEO_KEYWORDS: Record<string, EventKeywordSet> = {
  'senkaku': {
    common: ['Senkaku Islands', 'Diaoyu Islands', 'Diaoyutai', 'Tiaoyutai', 'Pinnacle Islands'],
    en: ['Senkaku Islands dispute', 'Diaoyu Islands sovereignty', 'East China Sea territory', 'Japan China island dispute', 'U.S. Japan security treaty Senkaku', 'UNCLOS continental shelf'],
    ja: ['尖閣諸島', '尖閣諸島問題', '釣魚島', '魚釣島', '領有権問題', '日中領土問題', '無主地先占', 'サンフランシスコ平和条約', '南西諸島'],
    zh: ['钓鱼岛', '钓鱼岛及其附属岛屿', '钓鱼台', '中日领土争端', '东海大陆架', '固有领土', '甲午战争', '马关条约'],
    ko: ['센카쿠 열도', '댜오위다오', '조어도', '중일 영토 분쟁', '동중국해 대륙붕', '무주지 선점'],
  },
  'nanjing-massacre': {
    common: ['Nanjing Massacre', 'Nanking Massacre', 'Rape of Nanking', 'Nanjing Incident'],
    en: ['Nanjing Massacre death toll', '1937 Nanjing Atrocity', 'Second Sino-Japanese War', 'John Rabe safety zone', 'Tokyo Trial Nanjing', '300000 victims'],
    ja: ['南京事件', '南京大虐殺', '南京虐殺事件', '南京攻略戦', '東京裁判', '極東国際軍事裁判', '松井石根', '犠牲者数論争', '教科書記述'],
    zh: ['南京大屠杀', '南京保卫战', '侵华日军南京大屠杀', '遇难者30万', '国家公祭日', '东京审判', '约翰拉贝', '不忘国耻'],
    ko: ['난징 대학살', '난징 사건', '1937년 난징', '중일전쟁', '도쿄 재판', '희생자 수 논쟁'],
  },
  'nanjing-death-toll': {
    common: ['Nanjing Massacre Death Toll', 'Nanjing casualty estimates'],
    en: ['Nanjing death toll controversy', '300000 victims debate', 'Tokyo Trial casualty figures', 'Smythe report'],
    ja: ['南京事件犠牲者数', '30万人説', '南京虐殺犠牲者論争', '実数検証', '東京裁判認定'],
    zh: ['南京大屠杀遇难人数', '30万人遇难人数争论', '远东国际军事法庭认定', '南京军事法庭'],
    ko: ['난징 대학살 희생자 수', '30만 명 설', '난징 사건 사상자 논쟁'],
  },
  'nanjing-tribunal': {
    common: ['Nanjing War Crimes Tribunal', 'International Military Tribunal for the Far East Nanjing'],
    en: ['Tokyo Trial Nanjing verdict', 'Iwane Matsui trial', 'Nanjing War Crimes Tribunal 1946', 'Tani Hisao'],
    ja: ['南京軍事法廷', '東京裁判南京', '松井石根処刑', '谷寿夫', '極東国際軍事裁判'],
    zh: ['南京军事法庭', '谷寿夫审判', '东京审判松井石根', '战犯审判'],
    ko: ['난징 군사재판', '도쿄 재판 난징', '마쓰이 이와네'],
  },
  'comfort-women': {
    common: ['Comfort Women', 'Military Comfort Women', 'Ianfu'],
    en: ['Comfort women issue', 'Japanese military sexual slavery', 'Kono Statement 1993', 'Japan Korea 2015 agreement', 'comfort women statues', 'Asian Women\'s Fund'],
    ja: ['慰安婦問題', '従軍慰安婦', '河野談話', '日韓合意', '少女像', '教科書記述', '強制連行論争', 'アジア女性基金'],
    zh: ['慰安妇', '日军慰安妇制度', '河野谈话', '性奴隶', '中韩受害者', '慰安妇少女像'],
    ko: ['일본군 위안부', '위안부 문제', '고노 담화', '2015년 한일합의', '평화의 소녀상', '강제연행', '수요집회'],
  },
  'takeshima': {
    common: ['Takeshima', 'Dokdo', 'Liancourt Rocks'],
    en: ['Takeshima Dokdo dispute', 'Sea of Japan island dispute', 'Japan Korea territorial conflict', '1905 Shimane notice', 'Rhee Line'],
    ja: ['竹島', '独島', '竹島問題', '島根県隠岐の島町', '李承晩ライン', 'サンフランシスコ平和条約竹島', '固有の領土'],
    zh: ['独岛', '竹岛', '韩日独岛争议', '独岛竹岛领土争端', '李承晚线'],
    ko: ['독도', '다케시마', '독도 영유권', '독도는 우리 땅', '이승만 라인', '세종실록지리지', '시마네현 고시'],
  },
  'unit731': {
    common: ['Unit 731', 'Unit 731 Biological Warfare', 'Unit 731 Harbin'],
    en: ['Unit 731 atrocities', 'Shiro Ishii', 'biological and chemical warfare WWII', 'Khabarovsk War Crime Trials', 'Pingfan Harbin'],
    ja: ['731部隊', '関東軍防疫給水部', '石井四郎', '細菌戦', '人体実験', 'ハルビン平房', 'ハバロフスク裁判'],
    zh: ['侵华日军第七三一部队', '731部队', '石井四郎', '细菌战', '人体实验', '哈尔滨平房区', '伯力审判'],
    ko: ['731부대', '이시이 시로', '생체실험', '세균전', '하얼빈', '관동군 방역급수부'],
  },
  'ukraine-invasion': {
    common: ['Ukraine War', 'Russian invasion of Ukraine', 'Russo-Ukrainian War'],
    en: ['Russia Ukraine conflict', 'Special military operation narrative', 'Donbas war', 'Crimea annexation', 'NATO expansion debate', 'Bucha massacre'],
    ja: ['ウクライナ侵攻', 'ロシア・ウクライナ戦争', '特別軍事作戦', 'クリミア併合', 'NATO東方拡大', 'ドンバス紛争', 'ブチャの虐殺'],
    zh: ['乌克兰危机', '俄乌冲突', '俄罗斯对乌克兰特别军事行动', '克里米亚危机', '北约东扩', '顿巴斯战争'],
    ko: ['우크라이나 침공', '러시아 우크라이나 전쟁', '특별군사작전', '크림반도 병합', '나토 동진', '돈바스 분쟁'],
  },
  'tiananmen-1989': {
    common: ['1989 Tiananmen Square protests', 'June 4th Incident', 'Tiananmen 1989'],
    en: ['Tiananmen Square crackdown', 'June 4 incident', 'Beijing democracy movement 1989', 'Tank Man', 'Zhao Ziyang'],
    ja: ['天安門事件', '六四天安門事件', '1989年天安門', '民主化運動', '戦車男', '趙紫陽', '教科書記述'],
    zh: ['六四事件', '1989年北京政治风波', '八九民运', '天安门事件', '天安门政治风波', '坦克人'],
    ko: ['천안문 사태', '6·4 톈안먼 사건', '1989년 톈안먼 민주화 운동', '탱크맨', '자오쯔양'],
  },
  'fukushima-treated-water': {
    common: ['Fukushima treated water release', 'ALPS treated water', 'Fukushima nuclear wastewater'],
    en: ['Fukushima wastewater discharge', 'ALPS treated water IAEA report', 'tritium water Pacific', 'Japan seafood ban China'],
    ja: ['福島第一原発処理水', 'ALPS処理水海洋放出', 'トリチウム水', 'IAEA包括報告書', '風評被害', '水産物輸入停止'],
    zh: ['福岛核污染水排海', '福岛核污水', '日本核污水排放', '多核素去除设备ALPS', 'IAEA报告', '水产品进口禁令'],
    ko: ['후쿠시마 오염수 방류', '후쿠시마 처리수', 'ALPS 다핵종제거설비', '삼중수소', 'IAEA 보고서', '수산물 수입 금지'],
  },
  'kanto-massacre': {
    common: ['1923 Kanto Earthquake Korean Massacre', 'Kanto Massacre'],
    en: ['Great Kanto Earthquake Korean killings', '1923 Tokyo vigilantism', 'Kanto massacre commemoration', 'poison well rumor'],
    ja: ['関東大震災朝鮮人虐殺', '関東大震災虐殺事件', '自警団暴行', '毒入れ流言蜚語', '追悼式典', '教科書記述'],
    zh: ['关东大地震屠杀朝鲜人事件', '1923年关东大地震', '自警团屠杀', '井水投毒谣言'],
    ko: ['관동대지진 조선인 학살', '간토 대학살', '1923년 관동대지진', '자경단 학살', '우물에 독을 탔다는 유언비어', '추모제'],
  },
  'forced-labor': {
    common: ['Wartime Forced Labor', 'Hashima Island Forced Labor', 'Sado Gold Mine'],
    en: ['Korean wartime forced labor', 'Battleship Island Hashima', 'Sado gold mine UNESCO', 'Nippon Steel compensation', '1965 treaty'],
    ja: ['強制連行・徴用工問題', '元徴用工問題', '軍艦島（端島）', '佐渡金山', '日韓請求権協定1965', '国民徴用令'],
    zh: ['强征劳工', '二战强征中国劳工', '军舰岛强征劳工', '佐渡金山申遗', '1965年韩日请求权协定'],
    ko: ['일제 강제동원', '강제징용 피해자', '군함도 하시마', '사도 광산 유네스코', '1965년 한일청구권협정', '대법원 배상 판결'],
  },
  'korea-colonization': {
    common: ['Japan-Korea Annexation 1910', 'Japanese colonial rule in Korea'],
    en: ['1910 Japan Korea Treaty', 'Japanese occupation of Korea', 'Governor-General of Korea', 'March 1st Movement', 'validity of annexation treaty'],
    ja: ['韓国併合', '日韓併合条約1910', '朝鮮総督府', '三・一独立運動', '武断政治', '同化政策', '条約の合法性論争'],
    zh: ['日韩合并', '日韩合并条约', '日本殖民统治朝鲜半岛', '三一运动', '朝鲜总督府'],
    ko: ['한일강제병합', '경술국치', '일제강점기', '조선총독부', '3·1 운동', '을사늑약', '조약 원천무효론'],
  },
  'sea-of-japan-naming': {
    common: ['Sea of Japan naming dispute', 'East Sea naming controversy'],
    en: ['Sea of Japan vs East Sea', 'IHO naming standard', 'International Hydrographic Organization S-23', 'dual naming proposal'],
    ja: ['日本海呼称問題', '東海併記論争', '国際水路機関IHO', '国連地名標準化会議', '日本海の単独呼称'],
    zh: ['日本海东海命名争议', '日本海称呼问题', '国际航道测量组织IHO'],
    ko: ['동해 표기 문제', '동해 일본해 병기', '일본해 명칭 논쟁', '국제수로기구 IHO', '동해 단독 표기'],
  },
  'northern-territories': {
    common: ['Northern Territories dispute', 'Kuril Islands dispute'],
    en: ['Kuril Islands conflict', 'Northern Territories Japan Russia', '1855 Treaty of Shimoda', '1956 Soviet-Japanese Joint Declaration', 'Etorofu Kunashiri Shikotan Habomai'],
    ja: ['北方領土問題', '北方四島', '択捉島', '国後島', '色丹島', '歯舞群島', '日露通好条約1855', '日ソ共同宣言1956', '固有の領土'],
    zh: ['北方四岛争端', '南千岛群岛', '择捉岛国后岛色丹岛齿舞群岛', '日俄领土争议', '日苏共同宣言'],
    ko: ['북방 영토 문제', '쿠릴 열도 분쟁', '에토로후 구나시리 시코탄 하보마이', '러일 영토 분쟁'],
  },
  'taiwan-un-resolution': {
    common: ['UN General Assembly Resolution 2758', 'Taiwan UN representation'],
    en: ['UN Resolution 2758', 'Taiwan sovereignty debate', 'One China principle vs One China policy', 'Republic of China UN status'],
    ja: ['国連総会決議2758号', 'アルバニア決議', '台湾の国連代表権', '一つの中国原則', '台湾海峡の平和と安定'],
    zh: ['联合国大会第2758号决议', '一个中国原则', '恢复中华人民共和国合法席位', '台湾地位未定论批判'],
    ko: ['유엔 총회 결의 제2758호', '대만 유엔 대표권', '하나의 중국 원칙', '양안 관계'],
  },
};

/**
 * Returns an array of keywords tailored for SEO meta tags and schema markup.
 */
export function getSeoKeywords(eventId: string, lang: string = 'en'): string[] {
  const specific = EVENT_SEO_KEYWORDS[eventId];
  const generalKeywords: Record<string, string[]> = {
    en: ['HistoryDiff', 'history textbook comparison', 'historical perspective diff', 'textbook discrepancies', 'multilateral historical analysis', 'controversy diff'],
    ja: ['HistoryDiff', '歴史教科書比較', '各国の歴史記述差分', '歴史認識の違い', '教科書対比', 'テキスト差分検証'],
    zh: ['HistoryDiff', '历史教科书对比', '各国历史记述差异', '历史视角对比', '文本差异分析', '历史争议'],
    ko: ['HistoryDiff', '역사 교과서 비교', '각국 역사 서술 차이', '역사 인식 차이', '텍스트 디프 비교', '역사 논쟁 검증'],
  };

  const baseKeywords = generalKeywords[lang] || generalKeywords.en;

  if (!specific) {
    return [eventId, ...baseKeywords];
  }

  const langSpecific = (specific[lang as keyof EventKeywordSet] as string[]) || [];
  const common = specific.common || [];
  const en = lang !== 'en' ? specific.en.slice(0, 3) : [];

  // Deduplicate and combine
  const combined = Array.from(new Set([...langSpecific, ...common, ...en, ...baseKeywords]));
  return combined;
}
