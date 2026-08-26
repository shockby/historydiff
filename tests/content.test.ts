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
});
