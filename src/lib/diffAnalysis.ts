import type { Language } from './translations.ts';

export interface KeywordItem {
  word: string;
  count: number;
  score: number;
  sampleContext?: string;
}

export interface ContrastPair {
  oldTerm: string;
  newTerm: string;
  topic?: string;
  description?: string;
}

export interface ControversyAnalysis {
  exclusiveOld: KeywordItem[];
  exclusiveNew: KeywordItem[];
  contrasts: ContrastPair[];
  stats: {
    oldWordCount: number;
    newWordCount: number;
    exclusiveOldCount: number;
    exclusiveNewCount: number;
    divergenceRate: number; // 0 - 100%
  };
}

// Common stop words across languages to ignore during keyword extraction
const STOP_WORDS_JA = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
  'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や',
  'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう',
  'また', 'もの', 'という', 'あり', 'これ', 'により', 'おける', 'によって',
  'おり', 'について', 'され', 'だ', 'への', 'における', 'に対する', '受け',
  'および', 'または', 'さらに', 'なお', 'おいて', 'における', 'とともに',
]);

const STOP_WORDS_EN = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d',
  'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'also', 'many', 'general',
]);

const STOP_WORDS_ZH = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
  '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有',
  '看', '好', '自己', '这', '他', '它', '被', '从', '而', '与', '及', '以',
  '等', '为', '对', '于', '中', '其', '后', '该', '所', '进行', '表示', '由于',
]);

const STOP_WORDS_KO = new Set([
  '의', '가', '이', '은', '는', '들', '는', '좀', '잘', '걍', '과', '도',
  '를', '으로', '자', '에', '와', '한', '하다', '에서', '로', '있', '되',
  '수', '것', '등', '대해', '대한', '통해', '위해', '따라', '밝혔', '있었',
]);

// Known contrasting pairs across controversial history themes
const KNOWN_CONTRAST_PAIRS: { pair: [string[], string[]]; topicJa: string; topicEn: string }[] = [
  // Nanjing Massacre
  {
    pair: [['南京事件', '事件'], ['南京大屠殺', '南京大虐殺', '大屠殺', '大虐殺', 'Rape of Nanking']],
    topicJa: '事件の呼称（事件 vs 大虐殺）',
    topicEn: 'Naming of the event (Incident vs Massacre)',
  },
  {
    pair: [['多数の殺害', '多数の', 'さまざまな見解', '諸説あり', '議論が続いて'], ['30万人以上', '30万人', '300,000', 'over 300,000']],
    topicJa: '犠牲者数の規模（諸説・多数 vs 30万人以上）',
    topicEn: 'Death toll scale (Disputed/numerous vs 300,000+)',
  },
  {
    pair: [['日本軍', '日本軍は'], ['日本侵略軍', '侵略軍', '侵略者', 'invading army']],
    topicJa: '軍の性質規定（日本軍 vs 日本侵略軍）',
    topicEn: 'Characterization of military (Army vs Invading army)',
  },
  {
    pair: [['戦線拡大', '占領'], ['残虐な蛮行', '滅絶人性', '惨絶人寰', '蛮行', 'atrocities']],
    topicJa: '行為の形容（占領・戦線拡大 vs 残虐な蛮行）',
    topicEn: 'Characterization of actions (Occupation vs Brutal atrocities)',
  },

  // Comfort Women
  {
    pair: [['集められた', '女性が集められた', '募集', '商業的'], ['性的奴隷', '性奴隷', '性暴力システム', '強制連行', '連行され', 'sexual slavery', 'sexual violence']],
    topicJa: '強制性と実態（募集・集められた vs 性的奴隷・強制連行）',
    topicEn: 'Nature of mobilization (Recruited vs Sexual slavery / Coercion)',
  },
  {
    pair: [['日韓請求権協定', '法的に解決済み', '解決済み', '10億円', 'アジア女性基金', '償い金'], ['公式謝罪', '法的賠償', '国家責任', '賠償請求権は消滅していない', '法的責任']],
    topicJa: '法的責任と賠償（解決済み・償い金 vs 公式謝罪・法的賠償の未解決）',
    topicEn: 'Legal status & reparations (Settled/funds vs State legal responsibility & reparations)',
  },
  {
    pair: [['慰安施設', '慰安所'], ['性的奴隷制度', '人道犯罪', '反人道的不法行為', '挺身隊']],
    topicJa: '制度の本質規定（慰安施設 vs 性的奴隷制度・人道犯罪）',
    topicEn: 'Institutional definition (Comfort stations vs Crimes against humanity)',
  },

  // Senkaku / Diaoyu
  {
    pair: [['無主地', '無主地先占', '現地調査', '閣議決定', '有効に支配', '固有の領土', '領有権問題は存在しない'], ['釣魚島', '明・清代', '不法に盗取', '不法盗取', '甲午戦争', 'カイロ宣言', '固有領土']],
    topicJa: '領有の正当性（1895年無主地編入・実効支配 vs 明清代からの主権・不法盗取）',
    topicEn: 'Legitimacy of sovereignty (1895 terra nullius vs Ming/Qing historical claim & illegal seizure)',
  },

  // Takeshima / Dokdo
  {
    pair: [['竹島', '1905年', '島根県告示', '閣議決定', '不法占拠'], ['독도', '獨島', 'ドクト', '512年', '于山国', '勅令第41号', '固有領土', '不法強奪']],
    topicJa: '領有の起源（1905年島根県編入 vs 512年于山国以来の固有領土）',
    topicEn: 'Origin of territory (1905 incorporation vs Ancient Korean sovereignty since 512)',
  },

  // Northern Territories / Kuril Islands
  {
    pair: [['北方領土', '北方四島', '固有の領土', '不法占拠', 'サンフランシスコ平和条約'], ['クリル諸島', '千島列島', '第二次世界大戦の結果', '正当な領有', 'ヤルタ協定']],
    topicJa: '領土の法的根拠（不法占拠・固有の領土 vs 第二次大戦の正当な結果）',
    topicEn: 'Legal grounds (Illegal occupation vs Legitimate WWII outcome)',
  },

  // General wording contrasts
  {
    pair: [['進出', '進出軍'], ['侵略', '侵略軍', 'invasion', 'aggression']],
    topicJa: '進出 vs 侵略（教科書検定の焦点）',
    topicEn: 'Advancement vs Invasion / Aggression',
  },
  {
    pair: [['併合', '日韓併合', '統治'], ['強占', '植民地支配', '日帝強占期', '不法統治']],
    topicJa: '統治の捉え方（併合・統治 vs 植民地強占・不法支配）',
    topicEn: 'Annexation vs Colonial subjugation',
  },
];

// High-priority political, emotional, or statistical keywords for weighted scoring
const HIGH_PRIORITY_PATTERNS = [
  /\d+(?:万|億|千)?(?:人|名|円|ドル)?(?:以上|規模|余り)?/g, // Numbers / figures (e.g. 30万人以上, 10億円)
  /大?虐殺|大屠殺|屠殺|虐殺|蛮行|暴行|殺害|殺戮|強姦|放火|略奪|処刑|生き埋め|斬首/g,
  /性的奴隷|性奴隷|慰安婦|挺身隊|性暴力|強制連行|強制動員|人道犯罪|反人道/g,
  /無主地|先占|閣議決定|実効支配|固有の領土|領有権|施政権/g,
  /侵略|進出|併合|植民地|強占|盗取|不法|正当|主権/g,
  /河野談話|村山談話|日韓合意|請求権協定|サンフランシスコ|カイロ宣言|ポツダム宣言/g,
  /公式謝罪|賠償|償い金|法的責任|解決済み|不可逆的/g,
  /国家公祭日|平和の少女像|水曜デモ|記念館/g,
];

/**
 * Tokenize text into candidate keywords and phrases
 */
function extractPhrases(text: string): { phrase: string; context: string }[] {
  const clean = text.replace(/---[\s\S]*?---/, '').replace(/#+\s/g, '').replace(/\[.*?\]\(.*?\)/g, '');
  const sentences = clean.split(/[。\n.!?！？\r]+/).filter(s => s.trim().length > 0);

  const results: { phrase: string; context: string }[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // 1. High priority pattern extraction (Regex)
    for (const pattern of HIGH_PRIORITY_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(trimmed)) !== null) {
        if (match[0] && match[0].length >= 2) {
          results.push({ phrase: match[0], context: trimmed });
        }
      }
    }

    // 2. Bracketed/Quoted terms (e.g., 「南京事件」, "The Rape of Nanking", 『河野談話』)
    const quotes = trimmed.match(/[「『"“]([^」』"”]+)[」』"”]/g);
    if (quotes) {
      for (const q of quotes) {
        const inner = q.replace(/[「『"“」』"”]/g, '').trim();
        if (inner.length >= 2 && inner.length <= 25) {
          results.push({ phrase: inner, context: trimmed });
        }
      }
    }

    // 3. Bold marked terms (**term**)
    const bolds = trimmed.match(/\*\*([^*]+)\*\*/g);
    if (bolds) {
      for (const b of bolds) {
        const inner = b.replace(/\*\*/g, '').trim();
        if (inner.length >= 2 && inner.length <= 30) {
          results.push({ phrase: inner, context: trimmed });
        }
      }
    }

    // 4. Kanji compound words & meaningful phrases (CJK N-grams)
    const cjkMatches = trimmed.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]{2,12}/g);
    if (cjkMatches) {
      for (const m of cjkMatches) {
        // Strip common sentence endings & helper verb suffixes
        let cleaned = m.replace(/(?:ています|ていた|でした|である|であり|ました|となり|について|における|に対する|によって|などの|された|される|させる|させた|として|といえ|られる|られた|による|となって)$/, '').trim();
        // Also strip leading particles if any
        cleaned = cleaned.replace(/^(?:および|または|さらに|なお|また|そして|しかし|この|その|あの|どの|への|での|との|より)/, '').trim();

        if (cleaned.length >= 2 && cleaned.length <= 10) {
          // Check stop words
          if (!STOP_WORDS_JA.has(cleaned) && !STOP_WORDS_ZH.has(cleaned) && !STOP_WORDS_KO.has(cleaned)) {
            // Avoid purely numerical or empty strings
            if (!/^[0-9\s]+$/.test(cleaned)) {
              results.push({ phrase: cleaned, context: trimmed });
            }
          }
        }
      }
    }

    // 5. English words & 2-3 word phrases
    const enWords = trimmed.match(/[A-Za-z0-9'-]+/g);
    if (enWords && enWords.length > 0) {
      for (let i = 0; i < enWords.length; i++) {
        const w = enWords[i].toLowerCase();
        if (w.length >= 3 && !STOP_WORDS_EN.has(w)) {
          results.push({ phrase: enWords[i], context: trimmed });
        }
        // 2-word phrase
        if (i < enWords.length - 1) {
          const w2 = enWords[i + 1].toLowerCase();
          if (!STOP_WORDS_EN.has(w) && !STOP_WORDS_EN.has(w2)) {
            results.push({ phrase: `${enWords[i]} ${enWords[i + 1]}`, context: trimmed });
          }
        }
      }
    }
  }

  return results;
}

/**
 * Score a keyword by its length, frequency, and historical importance
 */
function scoreKeyword(word: string, count: number): number {
  let score = count * 2 + word.length * 0.5;

  // Bonus for numbers / statistics
  if (/\d+/.test(word)) score += 5;

  // Bonus for high impact controversial terms
  const hotWords = [
    '虐殺', '大屠殺', '事件', '性的奴隷', '性奴隷', '挺身隊', '慰安婦', '無主地',
    '領有権', '固有', '侵略', '進出', '併合', '強占', '河野談話', '請求権', '合意',
    '30万', '20万', '10億', '賠償', '謝罪', '蛮行', '人権', '不法', '主権',
    'massacre', 'atrocities', 'slavery', 'dispute', 'sovereignty', 'annexation',
  ];

  for (const hot of hotWords) {
    if (word.toLowerCase().includes(hot.toLowerCase())) {
      score += 8;
      break;
    }
  }

  return score;
}

/**
 * Find exclusive keywords and contrasts between two texts
 */
export function analyzeControversyDiff(
  oldText: string,
  newText: string,
  lang: Language = 'ja'
): ControversyAnalysis {
  const oldPhrases = extractPhrases(oldText);
  const newPhrases = extractPhrases(newText);

  const cleanOld = oldText.toLowerCase();
  const cleanNew = newText.toLowerCase();

  // Aggregate frequencies
  const oldMap = new Map<string, { count: number; context: string }>();
  for (const item of oldPhrases) {
    const key = item.phrase.trim();
    if (!key || key.length < 2) continue;
    const existing = oldMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      oldMap.set(key, { count: 1, context: item.context });
    }
  }

  const newMap = new Map<string, { count: number; context: string }>();
  for (const item of newPhrases) {
    const key = item.phrase.trim();
    if (!key || key.length < 2) continue;
    const existing = newMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      newMap.set(key, { count: 1, context: item.context });
    }
  }

  // Filter exclusive keywords
  // Exclusive in Old: appears in oldText, NOT in newText
  const exclusiveOldList: KeywordItem[] = [];
  oldMap.forEach(({ count, context }, word) => {
    const lower = word.toLowerCase();
    // Verify it is completely absent in newText
    if (!cleanNew.includes(lower)) {
      exclusiveOldList.push({
        word,
        count,
        score: scoreKeyword(word, count),
        sampleContext: context,
      });
    }
  });

  // Exclusive in New: appears in newText, NOT in oldText
  const exclusiveNewList: KeywordItem[] = [];
  newMap.forEach(({ count, context }, word) => {
    const lower = word.toLowerCase();
    // Verify it is completely absent in oldText
    if (!cleanOld.includes(lower)) {
      exclusiveNewList.push({
        word,
        count,
        score: scoreKeyword(word, count),
        sampleContext: context,
      });
    }
  });

  // Sort by score descending and deduplicate substrings
  const sortAndDedupe = (list: KeywordItem[]): KeywordItem[] => {
    const sorted = list.sort((a, b) => b.score - a.score);
    const result: KeywordItem[] = [];

    for (const item of sorted) {
      // Avoid adding very close sub-strings if longer one is already present with same frequency
      const isSub = result.some(
        (existing) => existing.word.includes(item.word) && existing.count === item.count
      );
      if (!isSub) {
        result.push(item);
      }
      if (result.length >= 8) break; // Top 8 most meaningful exclusive keywords
    }
    return result;
  };

  const finalExclusiveOld = sortAndDedupe(exclusiveOldList);
  const finalExclusiveNew = sortAndDedupe(exclusiveNewList);

  // Detect Terminology Contrasts
  const detectedContrasts: ContrastPair[] = [];

  for (const { pair, topicJa, topicEn } of KNOWN_CONTRAST_PAIRS) {
    const [sideA, sideB] = pair;

    const matchedInOld = sideA.find((term) => cleanOld.includes(term.toLowerCase()));
    const matchedInNew = sideB.find((term) => cleanNew.includes(term.toLowerCase()));

    if (matchedInOld && matchedInNew && matchedInOld !== matchedInNew) {
      detectedContrasts.push({
        oldTerm: matchedInOld,
        newTerm: matchedInNew,
        topic: lang === 'ja' ? topicJa : topicEn,
      });
    } else {
      // Try reverse check (if sideB is in old and sideA in new)
      const reverseInOld = sideB.find((term) => cleanOld.includes(term.toLowerCase()));
      const reverseInNew = sideA.find((term) => cleanNew.includes(term.toLowerCase()));
      if (reverseInOld && reverseInNew && reverseInOld !== reverseInNew) {
        detectedContrasts.push({
          oldTerm: reverseInOld,
          newTerm: reverseInNew,
          topic: lang === 'ja' ? topicJa : topicEn,
        });
      }
    }
  }

  // Calculate Divergence Rate
  const totalKeywords = oldMap.size + newMap.size;
  const totalExclusive = exclusiveOldList.length + exclusiveNewList.length;
  const divergenceRate = totalKeywords > 0 ? Math.min(100, Math.round((totalExclusive / totalKeywords) * 100)) : 50;

  return {
    exclusiveOld: finalExclusiveOld,
    exclusiveNew: finalExclusiveNew,
    contrasts: detectedContrasts,
    stats: {
      oldWordCount: oldText.length,
      newWordCount: newText.length,
      exclusiveOldCount: exclusiveOldList.length,
      exclusiveNewCount: exclusiveNewList.length,
      divergenceRate,
    },
  };
}
