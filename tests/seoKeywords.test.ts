import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildEventSeoMeta } from '../src/lib/seoKeywords.ts';

describe('buildEventSeoMeta', () => {
  const samplePerspectivesJa = [
    { title: '抗日戦争と南京大屠殺', country: '中国', category: '戦争', year: '1937', location: '南京' },
    { title: '日中戦争と南京事件', country: '日本', category: '戦争', year: '1937', location: '南京' },
    { title: 'The Rape of Nanking', country: 'アメリカ', category: '戦争', year: '1937', location: '南京' },
  ];

  it('orders preferred home country first and includes compared countries in Japanese SEO title without duplicate | HistoryDiff', () => {
    const result = buildEventSeoMeta({
      eventId: 'nanjing-massacre',
      lang: 'ja',
      eventTitle: '南京事件',
      perspectives: samplePerspectivesJa,
    });

    assert.equal(result.baseTitle, '南京事件');
    assert.deepEqual(result.countries, ['日本', '中国', 'アメリカ']);
    assert.equal(result.pageTitle, '南京事件（日本・中国・アメリカ）の歴史教科書・記述比較');
    assert.ok(!result.pageTitle.includes('| HistoryDiff'));
    assert.equal(result.fullTitle, '南京事件（日本・中国・アメリカ）の歴史教科書・記述比較 | HistoryDiff');
    assert.ok(result.description.includes('日本・中国・アメリカ'));
    assert.ok(result.description.includes('抗日戦争と南京大屠殺'));
    assert.ok(result.keywords.includes('南京事件 歴史教科書 比較'));
  });

  it('generates English SEO title with vs country comparison and no duplicate suffix', () => {
    const result = buildEventSeoMeta({
      eventId: 'opium-war',
      lang: 'en',
      eventTitle: 'First Opium War',
      perspectives: [
        { title: 'The First Opium War', country: 'China' },
        { title: 'Anglo-Chinese War', country: 'United Kingdom' },
      ],
    });

    assert.deepEqual(result.countries, ['United Kingdom', 'China']);
    assert.equal(result.pageTitle, 'First Opium War: United Kingdom vs China History Textbook Comparison');
    assert.equal(result.fullTitle, 'First Opium War: United Kingdom vs China History Textbook Comparison | HistoryDiff');
    assert.ok(result.description.includes('United Kingdom, China'));
  });

  it('generates Chinese and Korean SEO titles with local country priority', () => {
    const zhResult = buildEventSeoMeta({
      eventId: 'imjin-war',
      lang: 'zh',
      eventTitle: '壬辰倭乱 / 万历朝鲜之役',
      perspectives: [
        { title: '文禄・慶長の役', country: '日本' },
        { title: '万历朝鲜之役', country: '中国' },
        { title: '壬辰倭乱', country: '韩国' },
      ],
    });
    assert.equal(zhResult.countries[0], '中国');
    assert.ok(zhResult.pageTitle.includes('中国、日本、韩国'));

    const koResult = buildEventSeoMeta({
      eventId: 'imjin-war',
      lang: 'ko',
      eventTitle: '임진왜란',
      perspectives: [
        { title: '분로쿠·게이초의 역', country: '일본' },
        { title: '임진왜란', country: '한국' },
      ],
    });
    assert.equal(koResult.countries[0], '한국');
    assert.equal(koResult.pageTitle, '임진왜란 (한국·일본) 역사 교과서 기술 비교');
  });
});
