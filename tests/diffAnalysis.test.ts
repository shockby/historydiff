import { test, describe } from 'node:test';
import assert from 'node:assert';
import { analyzeControversyDiff } from '../src/lib/diffAnalysis.ts';

describe('analyzeControversyDiff', () => {
  test('identifies exclusive keywords in old and new texts', () => {
    const textJapan = `
      1937年12月、日本軍は南京を占領した。この際、多数の中国軍捕虜や一般市民が殺害された（南京事件）。
      犠牲者数については諸説があり、現在も議論が続いている。
    `;
    const textChina = `
      1937年12月13日，侵华日军攻占南京，开始了惨绝人寰的南京大屠杀。
      在长达6周的血腥屠杀中，超过30万无辜中国同胞惨遭杀害。
    `;

    const result = analyzeControversyDiff(textJapan, textChina, 'ja');

    assert.ok(result.stats.divergenceRate >= 0 && result.stats.divergenceRate <= 100);
    assert.ok(result.exclusiveOld.length > 0);
    assert.ok(result.exclusiveNew.length > 0);

    // Old text exclusive should contain Japanese specific terms
    const oldWords = result.exclusiveOld.map(k => k.word);
    assert.ok(oldWords.some(w => w.includes('南京事件') || w.includes('諸説') || w.includes('占領')));

    // New text exclusive should contain Chinese specific terms
    const newWords = result.exclusiveNew.map(k => k.word);
    assert.ok(newWords.some(w => w.includes('大屠杀') || w.includes('30万') || w.includes('侵华')));
  });

  test('detects known contrasting terminology pairs', () => {
    const textA = '日本軍は進出を行い、日韓併合により統治を開始した。';
    const textB = '日本侵略軍は侵略を行い、日帝強占期の不法統治を開始した。';

    const result = analyzeControversyDiff(textA, textB, 'ja');
    assert.ok(result.contrasts.length > 0);
  });

  test('handles identical texts with 0% or low divergence', () => {
    const text = '1945年に第二次世界大戦が終結した。国際連合が設立された。';
    const result = analyzeControversyDiff(text, text, 'ja');

    assert.strictEqual(result.exclusiveOld.length, 0);
    assert.strictEqual(result.exclusiveNew.length, 0);
    assert.strictEqual(result.contrasts.length, 0);
  });
});
