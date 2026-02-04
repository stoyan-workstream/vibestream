// Simple synonym dictionary for demo
const synonyms: Record<string, string[]> = {
  employee: ['worker', 'staff', 'employee', 'personnel', 'team member', 'associate'],
  compensation: ['pay', 'salary', 'wage', 'compensation', 'earnings', 'payrate'],
  benefits: ['perks', 'benefits', 'insurance', '401k', 'retirement', 'health'],
  hiring: ['recruitment', 'hiring', 'onboarding', 'new hire', 'applicant'],
  termination: ['offboarding', 'termination', 'separation', 'departure', 'exit'],
  time: ['hours', 'time', 'attendance', 'schedule', 'shift'],
  payroll: ['payroll', 'payday', 'pay period', 'payment'],
  tax: ['taxes', 'tax', 'withholding', 'deduction'],
};

// Get all related terms for a search query
export function getRelatedTerms(query: string): string[] {
  const lowerQuery = query.toLowerCase().trim();
  const related = new Set<string>([lowerQuery]);
  
  // Find which synonym group contains this term
  Object.values(synonyms).forEach(group => {
    if (group.some(term => term.toLowerCase() === lowerQuery)) {
      group.forEach(term => related.add(term.toLowerCase()));
    }
  });
  
  return Array.from(related);
}

// Find matches in text with positions
export function findMatches(text: string, searchTerms: string[]): Array<{term: string, position: number}> {
  const matches: Array<{term: string, position: number}> = [];
  const lowerText = text.toLowerCase();
  
  searchTerms.forEach(term => {
    let pos = lowerText.indexOf(term);
    while (pos !== -1) {
      matches.push({ term, position: pos });
      pos = lowerText.indexOf(term, pos + 1);
    }
  });
  
  // Sort by position and remove overlaps
  return matches
    .sort((a, b) => a.position - b.position)
    .filter((match, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return match.position >= prev.position + prev.term.length;
    });
}

// Check if report matches search query
export function matchesSearch(report: any, query: string): boolean {
  if (!query.trim()) return true;
  
  const relatedTerms = getRelatedTerms(query);
  const searchText = [
    report.title,
    report.description,
    report.category,
    ...report.tabNames
  ].join(' ').toLowerCase();
  
  return relatedTerms.some(term => searchText.includes(term));
}

// Get matched terms for highlighting
export function getMatchedTerms(report: any, query: string): string[] {
  if (!query.trim()) return [];
  
  const relatedTerms = getRelatedTerms(query);
  const searchText = [
    report.title,
    report.description,
    report.category,
    ...report.tabNames
  ].join(' ').toLowerCase();
  
  return relatedTerms.filter(term => searchText.includes(term));
}
