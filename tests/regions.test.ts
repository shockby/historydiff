import { test, describe } from 'node:test';
import assert from 'node:assert';
import { eventCoords, eventRegions, regionViewports, type RegionId, type SubRegionId } from '../src/lib/locationCoords.ts';
import { translations, type Language } from '../src/lib/translations.ts';

describe('region definitions and mappings', () => {
  const allEventIds = Object.keys(eventCoords);

  test('all 65 events with coordinates have a region defined', () => {
    assert.strictEqual(allEventIds.length, 65, 'Total event coords should be 65');
    for (const id of allEventIds) {
      const regionInfo = eventRegions[id];
      assert.ok(regionInfo, `Event "${id}" must have region info in eventRegions`);
      assert.ok(
        ['asia', 'europe', 'africa', 'north-america', 'south-america'].includes(regionInfo.region),
        `Event "${id}" has invalid region "${regionInfo.region}"`
      );
    }
  });

  test('all events in Asia have a valid sub-region assigned', () => {
    const validSubRegions: SubRegionId[] = [
      'all-asia',
      'east-asia',
      'southeast-asia',
      'south-central-asia',
      'middle-east',
    ];

    for (const [id, info] of Object.entries(eventRegions)) {
      if (info.region === 'asia') {
        assert.ok(info.subRegion, `Asia event "${id}" must have a subRegion defined`);
        assert.ok(
          validSubRegions.includes(info.subRegion),
          `Asia event "${id}" has invalid subRegion "${info.subRegion}"`
        );
      }
    }
  });

  test('region event counts match expected distribution', () => {
    const counts: Record<string, number> = {
      'east-asia': 0,
      'southeast-asia': 0,
      'south-central-asia': 0,
      'middle-east': 0,
      'europe': 0,
      'africa': 0,
      'south-america': 0,
    };

    for (const info of Object.values(eventRegions)) {
      if (info.region === 'asia' && info.subRegion) {
        counts[info.subRegion]++;
      } else {
        counts[info.region]++;
      }
    }

    assert.strictEqual(counts['east-asia'], 30, 'East Asia should have 30 events');
    assert.strictEqual(counts['middle-east'], 8, 'Middle East should have 8 events');
    assert.strictEqual(counts['southeast-asia'], 4, 'Southeast Asia should have 4 events');
    assert.strictEqual(counts['south-central-asia'], 4, 'South & Central Asia should have 4 events');
    assert.strictEqual(counts['europe'], 8, 'Europe should have 8 events');
    assert.strictEqual(counts['africa'], 8, 'Africa should have 8 events');
    assert.strictEqual(counts['south-america'], 3, 'South America should have 3 events');
  });

  test('regionViewports contains all major regions and sub-regions', () => {
    const requiredKeys = [
      'all',
      'asia',
      'asia:all-asia',
      'asia:east-asia',
      'asia:middle-east',
      'asia:southeast-asia',
      'asia:south-central-asia',
      'europe',
      'africa',
      'south-america',
      'north-america',
    ];

    for (const key of requiredKeys) {
      const vp = regionViewports[key];
      assert.ok(vp, `regionViewports must have key "${key}"`);
      assert.ok(typeof vp.scale === 'number' && vp.scale > 0, `scale for "${key}" must be > 0`);
      assert.ok(typeof vp.x === 'number', `x for "${key}" must be a number`);
      assert.ok(typeof vp.y === 'number', `y for "${key}" must be a number`);
    }
  });

  test('all 4 languages have complete region translation strings', () => {
    const languages: Language[] = ['en', 'ja', 'zh', 'ko'];
    const requiredKeys: (keyof typeof translations.en)[] = [
      'regionAll',
      'regionAsia',
      'regionAllAsia',
      'regionEastAsia',
      'regionSoutheastAsia',
      'regionSouthCentralAsia',
      'regionMiddleEast',
      'regionEurope',
      'regionAfrica',
      'regionNorthAmerica',
      'regionSouthAmerica',
      'regionFilterLabel',
      'subRegionFilterLabel',
    ];

    for (const lang of languages) {
      for (const key of requiredKeys) {
        const val = translations[lang][key];
        assert.ok(
          typeof val === 'string' && val.trim().length > 0,
          `Key "${key}" in language "${lang}" must be a non-empty string`
        );
      }
    }
  });
});
