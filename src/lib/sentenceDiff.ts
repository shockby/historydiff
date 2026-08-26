/**
 * sentenceDiff.ts
 * 単語/文単位の差分計算モジュール
 * 外部MLモデル不使用。純粋LCS実装 + 言語別 N-gram トークナイズ。
 */

export interface DiffToken {
  text: string;
  added?: boolean;
  removed?: boolean;
  /** 対立語としてさらに強調するフラグ */
  isKeyTerm?: boolean;
}

export interface SentencePair {
  oldSentences: string[];
  newSentences: string[];
}

// ─── 文分割 ─────────────────────────────────────────────────────────────────

/** テキストを文単位に分割する（言語共通） */
function splitSentences(text: string): string[] {
  // フロントマター除去
  const cleaned = text.replace(/^---[\s\S]*?---\n?/, '').trim();
  // 文区切り: 。！？.!? の後ろで分割 + 空行で段落区切り
  return cleaned
    .split(/(?<=[。！？!?])\s*|\n{2,}/)
    .map(s => s.replace(/\n/g, ' ').trim())
    .filter(s => s.length > 5);
}

/**
 * キーワードを含む文を抽出する
 * @param text 全文テキスト
 * @param keywords 検索キーワード配列
 * @param maxSentences 最大返却文数
 */
export function extractSentencesContaining(
  text: string,
  keywords: string[],
  maxSentences = 3
): string[] {
  const sentences = splitSentences(text);
  const results: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (keywords.some(kw => kw && lower.includes(kw.toLowerCase()))) {
      results.push(sentence);
      if (results.length >= maxSentences) break;
    }
  }

  // キーワードで見つからない場合は最初の文を返す（フォールバック）
  if (results.length === 0 && sentences.length > 0) {
    return [sentences[0]];
  }

  return results;
}

// ─── 言語別トークナイズ ──────────────────────────────────────────────────────

/** 英語: スペース区切りでトークン化（空白も保持） */
function tokenizeEn(text: string): string[] {
  const tokens: string[] = [];
  const parts = text.split(/(\s+)/);
  for (const p of parts) {
    if (p) tokens.push(p);
  }
  return tokens;
}

/**
 * 日本語: Unicode ブロック境界で分割 + 句読点を独立トークンに
 * MeCab 不使用。漢字連続・かな連続をチャンク単位とする。
 */
function tokenizeJa(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    const code = char.codePointAt(0) ?? 0;

    // 句読点・記号は1文字単位で独立トークン
    if (/[。、！？!?,.，：；\s]/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // 漢字ブロック [CJK Unified Ideographs]
    if (code >= 0x4e00 && code <= 0x9fff) {
      let j = i + 1;
      while (j < text.length) {
        const c = text[j].codePointAt(0) ?? 0;
        if (c >= 0x4e00 && c <= 0x9fff) j++;
        else break;
      }
      // 漢字連続は最大3文字ずつのチャンクに分割
      const chunk = text.slice(i, j);
      for (let k = 0; k < chunk.length; k += 3) {
        tokens.push(chunk.slice(k, k + 3));
      }
      i = j;
      continue;
    }

    // ひらがな・カタカナ
    const isKana =
      (code >= 0x3040 && code <= 0x309f) ||
      (code >= 0x30a0 && code <= 0x30ff);
    if (isKana) {
      let j = i + 1;
      while (j < text.length) {
        const c = text[j].codePointAt(0) ?? 0;
        const isK =
          (c >= 0x3040 && c <= 0x309f) || (c >= 0x30a0 && c <= 0x30ff);
        if (isK) j++;
        else break;
      }
      // かなは2〜3文字チャンク
      const chunk = text.slice(i, j);
      for (let k = 0; k < chunk.length; k += 2) {
        tokens.push(chunk.slice(k, k + 2));
      }
      i = j;
      continue;
    }

    // ASCII英数字
    if (/[A-Za-z0-9]/.test(char)) {
      let j = i + 1;
      while (j < text.length && /[A-Za-z0-9'-]/.test(text[j])) j++;
      tokens.push(text.slice(i, j));
      i = j;
      continue;
    }

    // その他の文字は1文字
    tokens.push(char);
    i++;
  }
  return tokens.filter(t => t.length > 0);
}

/**
 * 中国語: 漢字は1文字単位でトークン化
 * jieba 不使用。
 */
function tokenizeZh(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    const code = char.codePointAt(0) ?? 0;

    if (/\s/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // 句読点
    if (/[。！？!?,.，。：；、]/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }

    // 中国語漢字: 1文字単位
    if (code >= 0x4e00 && code <= 0x9fff) {
      tokens.push(char);
      i++;
      continue;
    }

    // ASCII
    if (/[A-Za-z0-9]/.test(char)) {
      let j = i + 1;
      while (j < text.length && /[A-Za-z0-9'-]/.test(text[j])) j++;
      tokens.push(text.slice(i, j));
      i = j;
      continue;
    }

    tokens.push(char);
    i++;
  }
  return tokens.filter(t => t.trim().length > 0);
}

/** 韓国語: スペース + 句読点区切り */
function tokenizeKo(text: string): string[] {
  return text.split(/(\s+|(?<=[.!?！？]))/g).filter(t => t.length > 0);
}

/** 言語に応じたトークナイザーを選択 */
export function tokenize(text: string, lang: string): string[] {
  switch (lang) {
    case 'ja': return tokenizeJa(text);
    case 'zh': return tokenizeZh(text);
    case 'ko': return tokenizeKo(text);
    default: return tokenizeEn(text);
  }
}

// ─── LCS ベース差分計算（純粋実装） ─────────────────────────────────────────

/** 2つのトークン配列の LCS を使った差分を計算する */
function computeLCS(a: string[], b: string[]): [boolean[], boolean[]] {
  const m = a.length;
  const n = b.length;

  // 大きすぎる場合は先頭を切り取ってパフォーマンスを確保
  const maxLen = 300;
  const sliceA = a.slice(0, maxLen);
  const sliceB = b.slice(0, maxLen);
  const sm = sliceA.length;
  const sn = sliceB.length;

  // DPテーブル
  const dp: number[][] = Array.from({ length: sm + 1 }, () =>
    new Array(sn + 1).fill(0)
  );

  for (let i = 1; i <= sm; i++) {
    for (let j = 1; j <= sn; j++) {
      if (sliceA[i - 1] === sliceB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // バックトラック
  const commonA = new Array(m).fill(false);
  const commonB = new Array(n).fill(false);
  let i = sm, j = sn;
  while (i > 0 && j > 0) {
    if (sliceA[i - 1] === sliceB[j - 1]) {
      commonA[i - 1] = true;
      commonB[j - 1] = true;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return [commonA, commonB];
}

/**
 * 2テキストのトークンレベル差分を計算する
 * @returns [oldTokens, newTokens] それぞれ DiffToken 配列
 */
export function computeTokenDiff(
  oldText: string,
  newText: string,
  lang: string,
  highlightTerms: string[] = []
): [DiffToken[], DiffToken[]] {
  const oldTokens = tokenize(oldText, lang);
  const newTokens = tokenize(newText, lang);

  const [commonOld, commonNew] = computeLCS(oldTokens, newTokens);

  const isKeyTerm = (text: string): boolean =>
    highlightTerms.some(
      term => term && text.toLowerCase().includes(term.toLowerCase())
    );

  const oldResult: DiffToken[] = oldTokens.map((text, idx) => ({
    text,
    removed: !commonOld[idx],
    isKeyTerm: isKeyTerm(text),
  }));

  const newResult: DiffToken[] = newTokens.map((text, idx) => ({
    text,
    added: !commonNew[idx],
    isKeyTerm: isKeyTerm(text),
  }));

  return [oldResult, newResult];
}

/**
 * 対立ペアのキーワードから、両テキストの対応文ペアを抽出する
 */
export function extractClaimPair(
  oldText: string,
  newText: string,
  oldTerm: string,
  newTerm: string
): SentencePair {
  const oldSentences = extractSentencesContaining(oldText, [oldTerm, newTerm], 2);
  const newSentences = extractSentencesContaining(newText, [newTerm, oldTerm], 2);
  return { oldSentences, newSentences };
}
