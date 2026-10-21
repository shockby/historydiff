import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeJsonLdStringify } from '../src/lib/schema.ts';

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
