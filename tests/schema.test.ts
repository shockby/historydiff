import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeJsonLdStringify, generateEventArticleSchema } from '../src/lib/schema.ts';

describe('safeJsonLdStringify', () => {
  it('escapes < characters to prevent script tag breakout', () => {
    const maliciousPayload = {
      title: '</script><script>alert("xss")</script>',
    };
    const serialized = safeJsonLdStringify(maliciousPayload);

    assert.ok(!serialized.includes('<'));
    assert.ok(serialized.includes('\\u003c/script>'));
    assert.ok(serialized.includes('\\u003cscript>'));

    // Valid JSON after deserializing
    const parsed = JSON.parse(serialized);
    assert.equal(parsed.title, maliciousPayload.title);
  });

  it('serializes regular objects cleanly', () => {
    const data = { name: 'HistoryDiff', active: true, count: 42 };
    const serialized = safeJsonLdStringify(data);
    assert.deepEqual(JSON.parse(serialized), data);
  });
});

describe('generateEventArticleSchema', () => {
  it('generates Article schema with Thing as about and temporalCoverage instead of Event', () => {
    const schema = generateEventArticleSchema({
      eventId: 'battle-of-midway',
      lang: 'ja',
      title: 'ミッドウェー海戦',
      description: 'ミッドウェー海戦の教科書記述比較',
      ogImage: '/og/events/battle-of-midway-ja.png',
      category: '第二次世界大戦',
      year: '1942年',
      location: 'ミッドウェー諸島周辺',
    });

    assert.equal(schema['@type'], 'Article');
    assert.equal(schema.headline, 'ミッドウェー海戦');
    assert.equal(schema.temporalCoverage, '1942年');
    assert.deepEqual(schema.spatialCoverage, {
      '@type': 'Place',
      name: 'ミッドウェー諸島周辺',
    });

    // Ensure @type: 'Event' is NOT present to prevent Google Search Console event validation errors
    const serialized = JSON.stringify(schema);
    assert.ok(!serialized.includes('"@type":"Event"'), 'Schema must not include @type: Event');

    // Verify about property uses Thing
    assert.ok(Array.isArray(schema.about));
    assert.equal(schema.about[0]['@type'], 'Thing');
    assert.equal(schema.about[0].name, 'ミッドウェー海戦');
  });
});

