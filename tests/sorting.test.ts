import { test, describe } from 'node:test';
import assert from 'node:assert';
import { extractStartYear } from '../src/lib/sorting.ts';

describe('extractStartYear utility', () => {
  test('extracts starting year from 4-digit years', () => {
    assert.strictEqual(extractStartYear('1945年-現在'), 1945);
    assert.strictEqual(extractStartYear('1937年〜1945年'), 1937);
    assert.strictEqual(extractStartYear('2023-present'), 2023);
  });

  test('extracts year from decades', () => {
    assert.strictEqual(extractStartYear('1930年代-1945年'), 1930);
    assert.strictEqual(extractStartYear('1980s'), 1980);
  });

  test('extracts year from Century format', () => {
    assert.strictEqual(extractStartYear('14世紀-現在'), 1300);
    assert.strictEqual(extractStartYear('17th Century'), 1600);
    assert.strictEqual(extractStartYear('21st Century'), 2000);
  });

  test('handles BC / 紀元前 years correctly as negative numbers', () => {
    assert.strictEqual(extractStartYear('紀元前37年〜668年'), -37);
    assert.strictEqual(extractStartYear('BC 500 - AD 200'), -500);
    assert.strictEqual(extractStartYear('3rd Century BC'), -200);
  });

  test('handles Ancient / 古代 notations', () => {
    assert.strictEqual(extractStartYear('古代-現在'), -1000);
    assert.strictEqual(extractStartYear('Ancient - Present'), -1000);
  });

  test('returns 9999 for empty or unparseable input', () => {
    assert.strictEqual(extractStartYear(''), 9999);
    assert.strictEqual(extractStartYear('Unknown Era'), 9999);
  });
});
