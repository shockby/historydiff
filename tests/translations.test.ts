import { test, describe } from 'node:test';
import assert from 'node:assert';
import { translations, type Language } from '../src/lib/translations.ts';

describe('translations consistency', () => {
  const languages: Language[] = ['en', 'ja', 'zh', 'ko'];
  const baseKeys = Object.keys(translations.en).sort();

  test('all supported languages exist in translations object', () => {
    for (const lang of languages) {
      assert.ok(translations[lang], `Language "${lang}" should exist in translations dictionary`);
    }
  });

  test('all languages have identical key sets to base English keys', () => {
    for (const lang of languages) {
      const currentKeys = Object.keys(translations[lang]).sort();
      
      const missingKeys = baseKeys.filter(k => !(k in translations[lang]));
      const extraKeys = currentKeys.filter(k => !baseKeys.includes(k));

      assert.strictEqual(
        missingKeys.length,
        0,
        `Language "${lang}" is missing keys: ${missingKeys.join(', ')}`
      );
      assert.strictEqual(
        extraKeys.length,
        0,
        `Language "${lang}" has extraneous keys: ${extraKeys.join(', ')}`
      );
    }
  });

  test('guide and onboarding keys exist and are non-empty across all languages', () => {
    const requiredKeys: (keyof typeof translations.en)[] = [
      'guide',
      'guideBadge',
      'guideTitle',
      'guideSubtitle',
      'guideMissionTitle',
      'guideStepsTitle',
      'welcomeModalTitle',
      'welcomeModalStartBtn',
      'welcomeModalGuideBtn',
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
