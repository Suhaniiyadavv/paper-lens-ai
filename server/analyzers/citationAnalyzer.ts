import { Finding, CitationReferenceMatch, ReferenceEntry } from '../types';

export interface CitationAnalysisResult {
  findings: Finding[];
  citationScore: number; // out of 10
  totalCitationsFound: number;
  totalReferencesInBibliography: number;
  uncitedReferencesCount: number;
  missingReferenceCitationsCount: number;
  duplicateReferencesCount: number;
  citationMatches: CitationReferenceMatch[];
  bibliographyEntries: ReferenceEntry[];
}

export function analyzeCitationsAndReferences(
  analysisId: string,
  bodyText: string,
  referencesText: string
): CitationAnalysisResult {
  const findings: Finding[] = [];
  const citationMatchesMap = new Map<string, { count: number; locations: string[] }>();
  const bibliographyEntries: ReferenceEntry[] = [];

  // 1. EXTRACT IN-TEXT CITATIONS
  // Numeric style: [1], [2, 3], [4-7], [1]–[3]
  const numericCitationRegex = /\[(\d+(?:[,\s–-]+\d+)*)\]/g;
  let match: RegExpExecArray | null;

  while ((match = numericCitationRegex.exec(bodyText)) !== null) {
    const rawInner = match[1];
    // Check if range like 1-3 or 1–3
    if (/^\d+[–-]\d+$/.test(rawInner.trim())) {
      const parts = rawInner.split(/[–-]/).map(p => parseInt(p.trim(), 10));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] <= parts[1] && parts[1] - parts[0] <= 20) {
        for (let num = parts[0]; num <= parts[1]; num++) {
          const key = `[${num}]`;
          const existing = citationMatchesMap.get(key) || { count: 0, locations: [] };
          existing.count += 1;
          const snippet = extractSnippet(bodyText, match.index);
          if (existing.locations.length < 3 && snippet) existing.locations.push(snippet);
          citationMatchesMap.set(key, existing);
        }
        continue;
      }
    }

    // Comma-separated list: [1, 2, 5]
    const numbers = rawInner.split(',').map(s => s.trim()).filter(Boolean);
    for (const numStr of numbers) {
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) {
        const key = `[${num}]`;
        const existing = citationMatchesMap.get(key) || { count: 0, locations: [] };
        existing.count += 1;
        const snippet = extractSnippet(bodyText, match.index);
        if (existing.locations.length < 3 && snippet) existing.locations.push(snippet);
        citationMatchesMap.set(key, existing);
      }
    }
  }

  // Author-year style: (Smith et al., 2020) or (Smith, 2019; Johnson, 2021)
  const authorYearRegex = /\(([A-Z][a-zA-Z\s.-]+(?:et al\.?)?,\s*(?:19|20)\d{2}[a-z]?)\)/g;
  while ((match = authorYearRegex.exec(bodyText)) !== null) {
    const key = match[1].trim();
    const existing = citationMatchesMap.get(key) || { count: 0, locations: [] };
    existing.count += 1;
    const snippet = extractSnippet(bodyText, match.index);
    if (existing.locations.length < 3 && snippet) existing.locations.push(snippet);
    citationMatchesMap.set(key, existing);
  }

  // 2. PARSE BIBLIOGRAPHY ENTRIES
  if (referencesText && referencesText.trim().length > 10) {
    const lines = referencesText.split('\n').map(l => l.trim()).filter(Boolean);
    let currentEntryRaw = '';
    let currentIndex = 0;

    const flushEntry = () => {
      if (currentEntryRaw.trim().length > 15) {
        currentIndex++;
        const parsed = parseBibliographyEntry(currentEntryRaw.trim(), currentIndex);
        bibliographyEntries.push(parsed);
        currentEntryRaw = '';
      }
    };

    for (const line of lines) {
      // Check if line begins a new reference: e.g. [1], 1., 1) or [Author]
      const isStart = /^(\[\d+\]|\d+\.|\d+\)|\([1-9]\d*\)|\[[A-Z][a-z]+)/.test(line);
      if (isStart && currentEntryRaw.length > 0) {
        flushEntry();
      }
      currentEntryRaw += (currentEntryRaw.length > 0 ? ' ' : '') + line;
    }
    flushEntry();
  }

  // 3. CROSS-REFERENCE AUDIT
  const totalCitationsFound = Array.from(citationMatchesMap.values()).reduce((a, b) => a + b.count, 0);
  const totalReferencesInBibliography = bibliographyEntries.length;

  const citationMatches: CitationReferenceMatch[] = [];
  let missingReferenceCitationsCount = 0;
  let uncitedReferencesCount = 0;
  let duplicateReferencesCount = 0;

  // Track bibliography keys and check duplicates
  const bibKeySet = new Set<string>();
  const duplicateSet = new Set<string>();

  bibliographyEntries.forEach(entry => {
    if (entry.key) {
      if (bibKeySet.has(entry.key.toLowerCase())) {
        duplicateSet.add(entry.key);
      } else {
        bibKeySet.add(entry.key.toLowerCase());
      }
    }
  });
  duplicateReferencesCount = duplicateSet.size;

  // Cross check in-text citations -> bibliography
  citationMatchesMap.forEach((meta, key) => {
    let matchedRef = bibliographyEntries.find(b => {
      if (b.key && b.key.toLowerCase() === key.toLowerCase()) return true;
      // Numeric matching: if key is "[3]", match entry with index 3
      const numMatch = key.match(/\[(\d+)\]/);
      if (numMatch && b.index === parseInt(numMatch[1], 10)) return true;
      // Author-year matching
      if (b.raw.toLowerCase().includes(key.toLowerCase().replace(/\(|\)/g, ''))) return true;
      return false;
    });

    const hasMatch = !!matchedRef;
    if (!hasMatch) {
      missingReferenceCitationsCount++;
    }

    if (matchedRef) {
      matchedRef.isCitedInText = true;
    }

    citationMatches.push({
      citationKey: key,
      occurrencesCount: meta.count,
      hasMatchingReference: hasMatch,
      matchedReferenceText: matchedRef ? matchedRef.raw.slice(0, 100) + '...' : undefined,
      citationLocations: meta.locations
    });
  });

  // Check uncited references (in bibliography but never cited in body)
  bibliographyEntries.forEach(entry => {
    if (!entry.isCitedInText) {
      uncitedReferencesCount++;
    }
  });

  // 4. SCORE CALCULATION & FINDINGS GENERATION (out of 10)
  let citationScore = 10;

  if (totalReferencesInBibliography === 0 && referencesText.trim().length === 0) {
    citationScore = 0;
    findings.push({
      id: `F-CIT-${findings.length + 1}`,
      analysisId,
      category: 'Citation and Reference Consistency',
      severity: 'high',
      title: 'References section is missing',
      location: 'References / Bibliography',
      evidence: 'No bibliography section detected in manuscript',
      explanation: 'Academic integrity requires explicit attribution of all foundational work in a bibliography.',
      recommendation: 'Add a comprehensive References section formatted according to target style (IEEE, ACM, APA).',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    // Missing references: citations in text without entry
    if (missingReferenceCitationsCount > 0) {
      const deduction = Math.min(4, missingReferenceCitationsCount * 1.5);
      citationScore = Math.max(2, citationScore - deduction);

      const missingSample = citationMatches
        .filter(c => !c.hasMatchingReference)
        .slice(0, 4)
        .map(c => c.citationKey)
        .join(', ');

      findings.push({
        id: `F-CIT-${findings.length + 1}`,
        analysisId,
        category: 'Citation and Reference Consistency',
        severity: 'high',
        title: `In-text citations lack matching bibliography entries (${missingReferenceCitationsCount} detected)`,
        location: 'Body Text & References',
        evidence: `Unmatched citations: ${missingSample}${missingReferenceCitationsCount > 4 ? ' and others' : ''}`,
        explanation: 'Readers and peer reviewers will be unable to trace the source of claims cited with these keys.',
        recommendation: 'Verify the bibliography and add complete citation entries for all cited sources.',
        assessmentType: 'rule_based',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }

    // Uncited references: in bibliography but never cited
    if (uncitedReferencesCount > 0) {
      const deduction = Math.min(2.5, uncitedReferencesCount * 0.5);
      citationScore = Math.max(3, citationScore - deduction);

      const uncitedSample = bibliographyEntries
        .filter(b => !b.isCitedInText)
        .slice(0, 3)
        .map(b => (b.key ? b.key : `Entry #${b.index}`))
        .join(', ');

      findings.push({
        id: `F-CIT-${findings.length + 1}`,
        analysisId,
        category: 'Citation and Reference Consistency',
        severity: 'medium',
        title: `Bibliography entries never cited in manuscript body (${uncitedReferencesCount} found)`,
        location: 'References',
        evidence: `Uncited entries: ${uncitedSample}`,
        explanation: 'In academic publishing (especially IEEE/ACM), every entry in the References section must be referenced in the body.',
        recommendation: 'Either incorporate relevant in-text citations or remove superfluous bibliography entries.',
        assessmentType: 'rule_based',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }

    // Duplicate references
    if (duplicateReferencesCount > 0) {
      citationScore = Math.max(3, citationScore - 1);
      findings.push({
        id: `F-CIT-${findings.length + 1}`,
        analysisId,
        category: 'Citation and Reference Consistency',
        severity: 'medium',
        title: `Duplicate reference entries detected (${duplicateReferencesCount} duplicates)`,
        location: 'References',
        evidence: `Repeated identifiers: ${Array.from(duplicateSet).slice(0, 3).join(', ')}`,
        explanation: 'Duplicate bibliography entries cause numbering confusion and redundant citations.',
        recommendation: 'Consolidate multiple entries into a single reference and update all in-text references.',
        assessmentType: 'rule_based',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }

    // Check for DOI formatting errors
    const malformedDois = bibliographyEntries.filter(b => b.hasDoi && b.doi && !b.doi.startsWith('10.'));
    if (malformedDois.length > 0) {
      findings.push({
        id: `F-CIT-${findings.length + 1}`,
        analysisId,
        category: 'Citation and Reference Consistency',
        severity: 'low',
        title: 'Potentially irregular DOI formatting in references',
        location: 'References',
        evidence: `Example: ${malformedDois[0].doi}`,
        explanation: 'Standard Digital Object Identifiers adhere to the prefix "10.XXXX/..." or standard URL resolver format "https://doi.org/10...."',
        recommendation: 'Format all DOIs using clean https://doi.org/10.xxxx syntax.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }
  }

  return {
    findings,
    citationScore: Math.round(citationScore * 10) / 10,
    totalCitationsFound,
    totalReferencesInBibliography,
    uncitedReferencesCount,
    missingReferenceCitationsCount,
    duplicateReferencesCount,
    citationMatches,
    bibliographyEntries
  };
}

function parseBibliographyEntry(raw: string, index: number): ReferenceEntry {
  // Extract key e.g. [1] or 1.
  let key: string | undefined;
  const numMatch = raw.match(/^(\[\d+\]|\d+\.|\d+\))/);
  if (numMatch) {
    key = numMatch[1].replace(/[.)]/, '');
    if (!key.startsWith('[')) key = `[${key}]`;
  }

  // Check DOI
  const doiMatch = raw.match(/\b(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)\b/i) || raw.match(/https?:\/\/doi\.org\/([^\s]+)/i);
  const doi = doiMatch ? doiMatch[1] : undefined;

  // Check URL
  const urlMatch = raw.match(/(https?:\/\/[^\s]+)/i);
  const url = urlMatch ? urlMatch[1] : undefined;

  // Check Year
  const yearMatch = raw.match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : undefined;

  return {
    raw,
    index,
    key,
    year,
    hasDoi: !!doi,
    doi,
    hasUrl: !!url,
    url,
    isCitedInText: false
  };
}

function extractSnippet(text: string, index: number): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + 60);
  return '...' + text.slice(start, end).replace(/\s+/g, ' ').trim() + '...';
}
