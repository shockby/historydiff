/**
 * Helper utility to parse the starting year of an event from a flexible date/era string.
 * This supports formats like:
 * - "古代-現在" -> -1000
 * - "紀元前37年〜668年" -> -37
 * - "14世紀-現在" -> 1300
 * - "1930年代-1945年" -> 1930
 * - "1945年-現在" -> 1945
 */
export function extractStartYear(yearStr: string): number {
  if (!yearStr) return 9999;

  const isBc = yearStr.includes('BC') || yearStr.includes('紀元前');

  // 1. Check for Century notation first (e.g., "14世紀", "17th Century")
  const centuryMatch = yearStr.match(/(\d+)(?:st|nd|rd|th)?\s*(?:Century|世紀)/i);
  if (centuryMatch) {
    const century = parseInt(centuryMatch[1], 10);
    const year = (century - 1) * 100;
    return isBc ? -year : year;
  }

  // 2. Extract first sequence of 1 to 4 digits (e.g., "1930年代", "1942年", "2023-現在")
  const digitMatch = yearStr.match(/(\d{1,4})/);
  if (digitMatch) {
    const year = parseInt(digitMatch[1], 10);
    return isBc ? -year : year;
  }

  // 3. Handle general "Ancient / 古代" labels
  if (yearStr.includes('古代') || yearStr.toLowerCase().includes('ancient')) {
    return -1000;
  }

  return 9999;
}
