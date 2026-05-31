# feat: Add Korean (ko) localization support for Korea-related events

This PR adds Korean (`ko`) language support to the HistoryDiff platform.
Following the user global settings and standard practice, it uses the ISO 639-1 language code `ko`.

## Changes

### 1. Code Integration
- **UI Translation**:
  - Updated `src/lib/translations.ts` to include the `'ko'` language type and added all 44 UI key translations.
  - Updated `src/app/components/Footer.tsx` with a Korean translation string.
- **Routing & Static Rendering**:
  - Updated `src/app/[lang]/page.tsx` and `src/app/[lang]/events/[id]/page.tsx` to include `ko` in `generateStaticParams()` to enable static path generation for Korean routes.
  - Updated `src/app/components/LanguageSelector.tsx` to include `한국어` (Korean) option, path matching, and seamless locale switching to `/ko`.
- **Content Loading**:
  - Modified `src/lib/markdown.ts` to support reading `-ko.md` event perspective files and `notes-ko.json` community notes files.

### 2. Content Generation
We analyzed all 28 events in the repository and identified those that contain a Korean perspective (`korea-ja.md`). We then generated automated translations (using translation scripts) to produce `-ko.md` and `notes-ko.json` only for those events.
The following **10 events** now have full Korean support:
1. `comfort-women` (위안부)
2. `forced-labor` (강제동원)
3. `takeshima` (독도/다케시마)
4. `sea-of-japan-naming` (동해/일본해 명칭 문제)
5. `goguryeo-controversy` (고구려 역사 논쟁)
6. `kimchi-origin-controversy` (김치 기원 논쟁)
7. `textbook-controversy` (역사교과서 문제)
8. `fukushima-treated-water` (후쿠시마 오염수 방류)
9. `pacific-war-end` (태평양 전쟁 종전)
10. `ww2-asia` (제2차 세계대전 아시아 전선)

*Note: For the remaining 18 events that do not have a Korean perspective, no Korean translation files were generated as requested.*

## Verification
- Run `npm run build` locally, and verified that Next.js successfully compiles and generates static files under the `/ko` locales.
