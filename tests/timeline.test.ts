import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYearsFromText,
  parseYearRange,
  getEventDecades,
  getRelevantNotesForDecade,
} from '../src/lib/timelineUtils.ts';
import type { EventNote } from '../src/lib/markdown.ts';

describe('timelineUtils', () => {
  describe('extractYearsFromText', () => {
    test('extracts 4-digit years from Japanese era strings', () => {
      const text = '1993年8月4日、河野洋平内閣官房長官が発表した談話。';
      const years = extractYearsFromText(text);
      assert.deepEqual(years, [1993]);
    });

    test('ignores non-year quantity numbers like 1000回 or 1000人', () => {
      const text = '2011年12月14日の1000回目のデモに合わせて像が設置された。';
      const years = extractYearsFromText(text);
      assert.deepEqual(years, [2011]);
    });

    test('extracts multiple years across text', () => {
      const text = '1995年設立、2007年解散。2015年の日韓合意。';
      const years = extractYearsFromText(text).sort();
      assert.deepEqual(years, [1995, 2007, 2015]);
    });
  });

  describe('parseYearRange', () => {
    test('parses simple start-end range', () => {
      const { startYear, endYear, isOngoing } = parseYearRange('1910年〜1945年');
      assert.equal(startYear, 1910);
      assert.equal(endYear, 1945);
      assert.equal(isOngoing, false);
    });

    test('parses ongoing event', () => {
      const { startYear, isOngoing } = parseYearRange('1947年〜現在');
      assert.equal(startYear, 1947);
      assert.equal(isOngoing, true);
    });

    test('parses decade string', () => {
      const { startYear, endYear } = parseYearRange('1930年代-1945年');
      assert.equal(startYear, 1930);
      assert.equal(endYear, 1945);
    });
  });

  describe('getEventDecades & getRelevantNotesForDecade', () => {
    test('expands event across duration decades and note decades', () => {
      const dummyNotes: EventNote[] = [
        {
          id: 'n1',
          claim: '1993年の談話',
          context: '1993年に発表',
          verdict: '公式記録あり',
          sources: [],
        },
        {
          id: 'n2',
          claim: '2015年の合意',
          context: '2015年12月に締結',
          verdict: '公式記録あり',
          sources: [],
        },
        {
          id: 'n3',
          claim: '被害者の人数は推定多数',
          context: '諸説ある',
          verdict: '議論あり',
          sources: [],
        },
      ];

      const { allDecades, primaryDecades, noteDecadesMap } = getEventDecades('1930年代-1945年', dummyNotes);
      const decadeKeys = allDecades.map((d) => d.key);

      // Primary decades: 1930s, 1940s
      assert.ok(primaryDecades.has('1930s'));
      assert.ok(primaryDecades.has('1940s'));
      // Note decades added: 1990s, 2010s
      assert.ok(decadeKeys.includes('1990s'));
      assert.ok(decadeKeys.includes('2010s'));

      // 1930s should have undated note n3, but NOT n1 or n2
      const notes1930 = getRelevantNotesForDecade(dummyNotes, '1930s', true, noteDecadesMap);
      assert.deepEqual(notes1930.map((n) => n.id), ['n3']);

      // 1990s should have n1, but NOT n2 or n3 (undated note only appears in primary decades)
      const notes1990 = getRelevantNotesForDecade(dummyNotes, '1990s', false, noteDecadesMap);
      assert.deepEqual(notes1990.map((n) => n.id), ['n1']);

      // 2010s should have n2 only
      const notes2010 = getRelevantNotesForDecade(dummyNotes, '2010s', false, noteDecadesMap);
      assert.deepEqual(notes2010.map((n) => n.id), ['n2']);
    });
  });
});
