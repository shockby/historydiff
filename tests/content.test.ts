import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getAllEvents, getEventPerspectives, getEventNotes } from '../src/lib/markdown.ts';

describe('historical content & database integrity', () => {
  const events = getAllEvents();

  test('events directory contains historical events', () => {
    assert.ok(events.length > 0, 'Should load at least one event');
  });

  test('each event has valid perspectives with required frontmatter fields', () => {
    for (const event of events) {
      const perspectives = getEventPerspectives(event.id, 'ja');
      assert.ok(perspectives.length > 0, `Event "${event.id}" should have Japanese perspectives`);

      for (const p of perspectives) {
        assert.ok(p.title && p.title.trim().length > 0, `Perspective in event "${event.id}" must have title`);
        assert.ok(p.country && p.country.trim().length > 0, `Perspective in event "${event.id}" must have country`);
        assert.ok(typeof p.source === 'string', `Perspective in event "${event.id}" must have source string`);
        assert.ok(p.content && p.content.trim().length > 0, `Perspective "${p.title}" in event "${event.id}" must have content`);
      }
    }
  });

  test('notes.json parsing is valid for events with notes', () => {
    for (const event of events) {
      const notes = getEventNotes(event.id, 'ja');
      if (notes) {
        assert.ok(notes.eventId, `Event notes for "${event.id}" must have eventId`);
        assert.ok(Array.isArray(notes.notes), `Event notes for "${event.id}" must have notes array`);
        for (const note of notes.notes) {
          assert.ok(note.id !== undefined, `Note in event "${event.id}" must have id`);
          assert.ok(note.claim, `Note in event "${event.id}" must have claim`);
          assert.ok(note.verdict, `Note in event "${event.id}" must have verdict`);
          assert.ok(Array.isArray(note.sources), `Note in event "${event.id}" must have sources array`);
        }
      }
    }
  });

  test('perspective titles do not contain redundant country perspective labels across all languages', () => {
    const langs = ['ja', 'en', 'zh', 'ko'] as const;
    const forbiddenPatterns: Record<string, RegExp> = {
      ja: /(日本の視点|日本の立場|アメリカの視点|米国の視点|中国の視点)/,
      en: /(Japan's Perspective|US Perspective|U\.S\. Perspective|China's Perspective)/i,
      zh: /(中国视角|美国视角|日本视角)/,
      ko: /(중국의 시각|미국의 시각|일본의 시각)/,
    };

    for (const event of events) {
      for (const lang of langs) {
        const perspectives = getEventPerspectives(event.id, lang);
        for (const p of perspectives) {
          const pattern = forbiddenPatterns[lang];
          assert.strictEqual(
            pattern.test(p.title),
            false,
            `Event "${event.id}" [${lang}] title "${p.title}" should not contain country perspective labels`
          );
        }
      }
    }
  });
});

