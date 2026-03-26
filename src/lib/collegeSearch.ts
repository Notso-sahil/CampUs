/**
 * Matches colleges by acronym/abbreviation
 * e.g., "vips" matches "Vivekananda Institute of Professional Studies"
 * e.g., "V I P S" (with spaces) also matches
 */
export function matchByAcronym(query: string, collegeName: string): boolean {
  const cleanQuery = query.replace(/\s+/g, '').toLowerCase();
  if (cleanQuery.length === 0) return false;
  
  // Extract first letter of each word from college name
  const words = collegeName.split(/\s+/);
  const acronym = words
    .map(word => word[0])
    .join('')
    .toLowerCase();
  
  // Check if acronym starts with the query
  return acronym.startsWith(cleanQuery);
}

/**
 * Filter colleges with acronym matching
 * Merges API results with acronym-matched results and deduplicates
 */
export function filterCollegesWithAcronym(
  apiResults: string[],
  allColleges: string[],
  query: string
): string[] {
  if (!query.trim()) return apiResults;
  
  // Find colleges that match by acronym
  const acronymMatches = allColleges.filter(college => 
    matchByAcronym(query, college)
  );
  
  // Merge and deduplicate
  const combined = [...apiResults, ...acronymMatches];
  return Array.from(new Set(combined));
}
