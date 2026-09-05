import type { EventNote } from './markdown';

export interface DecadeInfo {
  key: string;
  label: string;
  sortKey: number;
}

/**
 * Extract all explicit 4-digit years from a given text (claims, contexts).
 * Excludes quantity measurements like 1000回, 1000人, 2000ドル, etc.
 */
export function extractYearsFromText(text: string): number[] {
  if (!text) return [];
  const years = new Set<number>();

  // 1. CJK year patterns: e.g. 1993年, 1990年代, 1993년
  const cjkYearRe = /(?:^|[^\d])(1[89]\d{2}|20[0-2]\d)\s*(?:年|年代|년)/g;
  let m: RegExpExecArray | null;
  while ((m = cjkYearRe.exec(text)) !== null) {
    years.add(parseInt(m[1], 10));
  }

  // 2. Dates like 1993-08-04, 1993/8/4, 1993.8.4
  const dateRe = /(?:^|[^\d])(1[89]\d{2}|20[0-2]\d)[-/.](?:0?[1-9]|1[0-2])(?:[-/.](?:0?[1-9]|[12]\d|3[01]))?(?!\d)/g;
  while ((m = dateRe.exec(text)) !== null) {
    years.add(parseInt(m[1], 10));
  }

  // 3. English patterns: in 1993, 1990s, (1993), since 1992
  const enRe = /(?:in|since|from|by|until|during|around|circa|between|\()\s*(1[89]\d{2}|20[0-2]\d)\b/gi;
  while ((m = enRe.exec(text)) !== null) {
    years.add(parseInt(m[1], 10));
  }

  // 4. English decade patterns: 1990s, 1930s
  const enDecadeRe = /\b(1[89]\d{2}|20[0-2]\d)s\b/g;
  while ((m = enDecadeRe.exec(text)) !== null) {
    years.add(parseInt(m[1], 10));
  }

  // 5. Date ranges: 1993-1995, 1980–1988
  const rangeRe = /\b(1[89]\d{2}|20[0-2]\d)\s*[-–—〜~]\s*(1[89]\d{2}|20[0-2]\d)?\b/g;
  while ((m = rangeRe.exec(text)) !== null) {
    years.add(parseInt(m[1], 10));
    if (m[2]) years.add(parseInt(m[2], 10));
  }

  // 6. Direct word boundary year (1800-2029) not followed by quantity units
  const boundaryRe = /\b(1[89]\d{2}|20[0-2]\d)\b(?!\s*(?:回|人|万|ドル|km|m|kg|円|名|%|percent|USD|meters|items|cases|copies))/g;
  while ((m = boundaryRe.exec(text)) !== null) {
    years.add(parseInt(m[1], 10));
  }

  return Array.from(years);
}

/**
 * Format a year into a decade key, label and sortKey.
 */
export function getDecadeFromYear(year: number): DecadeInfo {
  if (year < 0) {
    return { key: 'ancient', label: '古代 / BC', sortKey: -10000 };
  }
  if (year < 1800) {
    const century = Math.floor(year / 100) + 1;
    return {
      key: `${century}th-century`,
      label: `${century}世紀`,
      sortKey: (century - 1) * 100,
    };
  }
  const decadeStart = Math.floor(year / 10) * 10;
  return {
    key: `${decadeStart}s`,
    label: `${decadeStart}s`,
    sortKey: decadeStart,
  };
}

/**
 * Parse start and end years from event year strings.
 */
export function parseYearRange(yearStr: string): { startYear: number; endYear: number; isOngoing: boolean } {
  if (!yearStr) return { startYear: 9999, endYear: 9999, isOngoing: false };

  const isBc = yearStr.includes('BC') || yearStr.includes('紀元前');
  const isOngoing = /現在|present|至今|현재/.test(yearStr);

  // Century notation (e.g. "14世紀", "17th Century")
  const centuryMatch = yearStr.match(/(\d+)(?:st|nd|rd|th)?\s*(?:Century|世紀)/i);
  if (centuryMatch) {
    const century = parseInt(centuryMatch[1], 10);
    const year = (century - 1) * 100;
    return {
      startYear: isBc ? -year : year,
      endYear: isOngoing ? 2026 : (isBc ? -year : year + 99),
      isOngoing,
    };
  }

  if (yearStr.includes('古代') || yearStr.toLowerCase().includes('ancient')) {
    return { startYear: -1000, endYear: isOngoing ? 2026 : -100, isOngoing };
  }

  // Look for all 1-4 digit years
  const matches = [...yearStr.matchAll(/(\d{1,4})/g)].map((m) => parseInt(m[1], 10));
  if (matches.length === 0) {
    return { startYear: 9999, endYear: 9999, isOngoing };
  }

  let startYear = matches[0];
  if (isBc) startYear = -startYear;

  let endYear = startYear;
  if (isOngoing) {
    endYear = 2026;
  } else if (matches.length > 1) {
    endYear = matches[matches.length - 1];
  }

  return { startYear, endYear, isOngoing };
}

/**
 * Given an event and its notes, compute all decades where this event should appear.
 */
export function getEventDecades(
  yearStr: string,
  notes?: EventNote[]
): {
  primaryDecades: Set<string>;
  allDecades: DecadeInfo[];
  noteDecadesMap: Map<string, Set<string>>; // noteId -> Set of decade keys
} {
  const { startYear, endYear, isOngoing } = parseYearRange(yearStr);
  const primaryDecades = new Set<string>();
  const allDecadesMap = new Map<string, DecadeInfo>();
  const noteDecadesMap = new Map<string, Set<string>>();

  // 1. Compute primary decades from event duration
  if (startYear !== 9999) {
    if (startYear < 1800) {
      // Long history event
      const startDecade = getDecadeFromYear(startYear);
      primaryDecades.add(startDecade.key);
      allDecadesMap.set(startDecade.key, startDecade);

      if (isOngoing) {
        const currentDecade = getDecadeFromYear(2026);
        primaryDecades.add(currentDecade.key);
        allDecadesMap.set(currentDecade.key, currentDecade);
      }
    } else {
      // Modern event (>= 1800)
      const maxDecadeYear = isOngoing ? 2026 : Math.min(endYear, 2026);
      const startDecadeYear = Math.floor(startYear / 10) * 10;
      const endDecadeYear = Math.floor(maxDecadeYear / 10) * 10;

      for (let y = startDecadeYear; y <= endDecadeYear; y += 10) {
        const dec = getDecadeFromYear(y);
        primaryDecades.add(dec.key);
        allDecadesMap.set(dec.key, dec);
      }
    }
  }

  // 2. Map notes to decades and add those decades to allDecades
  if (notes && notes.length > 0) {
    for (const note of notes) {
      const text = `${note.claim} ${note.context}`;
      const years = extractYearsFromText(text);
      const noteDecades = new Set<string>();

      for (const y of years) {
        const dec = getDecadeFromYear(y);
        noteDecades.add(dec.key);
        allDecadesMap.set(dec.key, dec);
      }

      noteDecadesMap.set(note.id, noteDecades);
    }
  }

  const allDecades = Array.from(allDecadesMap.values()).sort((a, b) => a.sortKey - b.sortKey);

  return {
    primaryDecades,
    allDecades,
    noteDecadesMap,
  };
}

/**
 * Filter notes for a specific decade.
 * Rule: Only show notes relevant to that decade.
 * If a note mentions specific years, show it ONLY if one of those years falls in this decade.
 * If a note mentions NO specific years, show it ONLY in the event's primary duration decades.
 */
export function getRelevantNotesForDecade(
  notes: EventNote[] | undefined,
  decadeKey: string,
  isPrimaryDecade: boolean,
  noteDecadesMap: Map<string, Set<string>>
): EventNote[] {
  if (!notes || notes.length === 0) return [];

  return notes.filter((note) => {
    const decs = noteDecadesMap.get(note.id);
    if (decs && decs.size > 0) {
      return decs.has(decadeKey);
    }
    // Undated note: show only during the primary event period
    return isPrimaryDecade;
  });
}
