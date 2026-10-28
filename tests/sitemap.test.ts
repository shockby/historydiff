import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sitemap, { SITE_URL, LANGUAGES } from '../src/app/sitemap.ts';
import { getAllEvents } from '../src/lib/markdown.ts';

describe('sitemap', () => {
  const entries = sitemap();
  const events = getAllEvents();

  it('generates all expected pages for all languages', () => {
    // 4 top pages + 4 archive pages + 4 guide pages + (events.length * 4) event pages
    const expectedCount = 4 + 4 + 4 + events.length * 4;
    assert.equal(entries.length, expectedCount);
  });

  it('includes top pages for all supported languages', () => {
    assert.ok(entries.some((e) => e.url === SITE_URL));
    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;
      assert.ok(entries.some((e) => e.url === `${SITE_URL}/${lang}`));
    }
  });

  it('includes events archive pages for all supported languages', () => {
    assert.ok(entries.some((e) => e.url === `${SITE_URL}/events`));
    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;
      assert.ok(entries.some((e) => e.url === `${SITE_URL}/${lang}/events`));
    }
  });

  it('includes guide pages for all supported languages', () => {
    assert.ok(entries.some((e) => e.url === `${SITE_URL}/guide`));
    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;
      assert.ok(entries.some((e) => e.url === `${SITE_URL}/${lang}/guide`));
    }
  });

  it('includes event detail pages for every event in all languages', () => {
    for (const event of events) {
      assert.ok(entries.some((e) => e.url === `${SITE_URL}/events/${event.id}`));
      for (const lang of ['ja', 'zh', 'ko'] as const) {
        assert.ok(entries.some((e) => e.url === `${SITE_URL}/${lang}/events/${event.id}`));
      }
    }
  });

  it('ensures every entry has valid alternates including x-default', () => {
    for (const entry of entries) {
      assert.ok(entry.alternates, `Missing alternates for ${entry.url}`);
      const langs = entry.alternates?.languages as Record<string, string>;
      assert.ok(langs.en, `Missing en alternate for ${entry.url}`);
      assert.ok(langs.ja, `Missing ja alternate for ${entry.url}`);
      assert.ok(langs.zh, `Missing zh alternate for ${entry.url}`);
      assert.ok(langs.ko, `Missing ko alternate for ${entry.url}`);
      assert.ok(langs['x-default'], `Missing x-default alternate for ${entry.url}`);
    }
  });

  it('ensures priority and changeFrequency are set appropriately', () => {
    const home = entries.find((e) => e.url === SITE_URL);
    assert.equal(home?.priority, 1.0);
    assert.equal(home?.changeFrequency, 'daily');

    const archive = entries.find((e) => e.url === `${SITE_URL}/events`);
    assert.equal(archive?.priority, 0.9);
    assert.equal(archive?.changeFrequency, 'daily');

    const guide = entries.find((e) => e.url === `${SITE_URL}/guide`);
    assert.equal(guide?.priority, 0.7);
    assert.equal(guide?.changeFrequency, 'monthly');
  });

  it('validates public/sitemap.xml file on disk', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const sitemapPath = path.resolve('public/sitemap.xml');

    assert.ok(fs.existsSync(sitemapPath), 'public/sitemap.xml must exist');
    const content = fs.readFileSync(sitemapPath, 'utf8');

    assert.ok(content.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Must have XML declaration');
    assert.ok(content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'Must have sitemap xmlns');
    assert.ok(content.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'Must have xhtml xmlns');
    assert.ok(content.includes('<loc>https://historydiff.solisart.com</loc>'), 'Must include home URL');
    assert.ok(content.includes('<loc>https://historydiff.solisart.com/events</loc>'), 'Must include archive URL');
    assert.ok(content.includes('<loc>https://historydiff.solisart.com/guide</loc>'), 'Must include guide URL');
    assert.ok(content.endsWith('</urlset>\n') || content.endsWith('</urlset>'), 'Must close urlset tag');
  });
});

