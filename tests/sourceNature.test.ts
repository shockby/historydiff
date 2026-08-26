import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getSourceNatureTags } from '../src/lib/sourceNature.ts';

describe('getSourceNatureTags', () => {
  test('detects government authorized textbook and original language for Japanese', () => {
    const perspective = {
      source: '文部科学省検定済 教科書「最新日本史」',
      country: '日本',
    };

    const tags = getSourceNatureTags(perspective, 'ja');
    assert.strictEqual(tags.length, 2);

    const natureTag = tags.find(t => t.kind === 'nature');
    const langTag = tags.find(t => t.kind === 'language');

    assert.strictEqual(natureTag?.type, 'government_textbook');
    assert.strictEqual(langTag?.type, 'original');
  });

  test('detects government statement and translation for non-native language', () => {
    const perspective = {
      source: 'Ministry of Foreign Affairs of Japan / Official Statement',
      country: 'Japan',
    };

    // Browsing in Korean
    const tags = getSourceNatureTags(perspective, 'ko');
    const natureTag = tags.find(t => t.kind === 'nature');
    const langTag = tags.find(t => t.kind === 'language');

    assert.strictEqual(natureTag?.type, 'official_statement');
    assert.strictEqual(langTag?.type, 'translation');
  });

  test('detects academic research sources', () => {
    const perspective = {
      source: 'Nature Academic Journal & Harvard Research Institute',
      country: 'USA',
    };

    const tags = getSourceNatureTags(perspective, 'en');
    const natureTag = tags.find(t => t.kind === 'nature');
    assert.strictEqual(natureTag?.type, 'academic_research');
  });

  test('detects international organization reports', () => {
    const perspective = {
      source: 'United Nations / UNESCO Official Report',
      country: 'International',
    };

    const tags = getSourceNatureTags(perspective, 'en');
    const natureTag = tags.find(t => t.kind === 'nature');
    assert.strictEqual(natureTag?.type, 'international_report');
  });
});
