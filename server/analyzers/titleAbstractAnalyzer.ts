import { Finding } from '../types';

export interface TitleAbstractAnalysisResult {
  findings: Finding[];
  titleScore: number;
  abstractScore: number;
  keywordsScore: number;
  abstractComponents: {
    background: boolean;
    objective: boolean;
    methodology: boolean;
    results: boolean;
    conclusion: boolean;
  };
  detectedKeywords: string[];
}

export function analyzeTitleAbstract(
  analysisId: string,
  rawTitle: string,
  abstractText: string,
  keywordsText: string,
  authorTitleInput?: string
): TitleAbstractAnalysisResult {
  const findings: Finding[] = [];
  const effectiveTitle = (authorTitleInput && authorTitleInput.trim().length > 0) 
    ? authorTitleInput.trim() 
    : rawTitle.trim();

  // 1. TITLE ASSESSMENT
  let titleScore = 5; // out of 5
  if (!effectiveTitle || effectiveTitle.length < 5) {
    titleScore = 1;
    findings.push({
      id: `F-TIT-${findings.length + 1}`,
      analysisId,
      category: 'Title, Abstract, and Keywords',
      severity: 'high',
      title: 'Missing or unidentifiable manuscript title',
      location: 'Header / Title',
      evidence: effectiveTitle ? `"${effectiveTitle}"` : 'No title extracted from header',
      explanation: 'A research paper must possess an explicit, unambiguous title that denotes the research topic.',
      recommendation: 'Provide a concise, declarative title capturing the research methodology and domain.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    const titleWords = effectiveTitle.split(/\s+/).filter(Boolean);
    const wordCount = titleWords.length;

    if (wordCount < 5) {
      titleScore = Math.max(2, titleScore - 2);
      findings.push({
        id: `F-TIT-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'medium',
        title: 'Title is unusually brief or underdeveloped',
        location: 'Title',
        evidence: `"${effectiveTitle}" (${wordCount} words)`,
        explanation: 'Titles shorter than 5 words often fail to convey the specific research context, methodology, and scope.',
        recommendation: 'Expand the title to mention both the core problem and the proposed method or context.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: true
      });
    } else if (wordCount > 25) {
      titleScore = Math.max(3, titleScore - 1.5);
      findings.push({
        id: `F-TIT-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'low',
        title: 'Title may be excessively verbose',
        location: 'Title',
        evidence: `"${effectiveTitle}" (${wordCount} words)`,
        explanation: 'Titles exceeding 25 words can be cumbersome to cite and digest in search databases.',
        recommendation: 'Consider pruning non-essential sub-clauses or moving methodological nuances to the abstract.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }

    // Check for generic or redundant title clichés
    const vaguePatterns = [
      { regex: /^A Study (On|Of)/i, phrase: 'A Study On' },
      { regex: /^An Investigation (Into|Of)/i, phrase: 'An Investigation Into' },
      { regex: /^Research On/i, phrase: 'Research On' },
      { regex: /\bNovel\b/i, phrase: 'Novel' },
      { regex: /\bA New Approach\b/i, phrase: 'A New Approach' }
    ];

    vaguePatterns.forEach(vp => {
      if (vp.regex.test(effectiveTitle)) {
        titleScore = Math.max(2.5, titleScore - 1);
        findings.push({
          id: `F-TIT-${findings.length + 1}`,
          analysisId,
          category: 'Title, Abstract, and Keywords',
          severity: 'low',
          title: `Potential filler phrase in title: "${vp.phrase}"`,
          location: 'Title',
          evidence: `"${effectiveTitle}"`,
          explanation: `Academic style guides generally discourage filler prefixes like "${vp.phrase}", as research papers inherently present studies or new work.`,
          recommendation: `Refactor the title to lead directly with the substantive subject matter or key technical contribution.`,
          assessmentType: 'heuristic',
          isObjectivelyVerifiable: true,
          humanVerificationRequired: true
        });
      }
    });
  }

  // 2. ABSTRACT ASSESSMENT
  let abstractScore = 7; // out of 7
  const abstractComponents = {
    background: false,
    objective: false,
    methodology: false,
    results: false,
    conclusion: false
  };

  if (!abstractText || abstractText.trim().length < 50) {
    abstractScore = 1;
    findings.push({
      id: `F-ABS-${findings.length + 1}`,
      analysisId,
      category: 'Title, Abstract, and Keywords',
      severity: 'high',
      title: 'Abstract section is missing or empty',
      location: 'Abstract',
      evidence: abstractText ? `Length: ${abstractText.length} characters` : 'Section absent',
      explanation: 'An abstract is mandatory across scholarly indexing platforms to summarize the study concisely.',
      recommendation: 'Draft an informative abstract of 150-250 words summarizing the problem, method, findings, and conclusion.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    const absWords = abstractText.split(/\s+/).filter(Boolean);
    const absWordCount = absWords.length;

    if (absWordCount < 80) {
      abstractScore = Math.max(3, abstractScore - 2.5);
      findings.push({
        id: `F-ABS-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'medium',
        title: 'Abstract is significantly shorter than standard convention',
        location: 'Abstract',
        evidence: `Word count: ${absWordCount} words (typical conference/journal minimum is 120-150 words)`,
        explanation: 'A very short abstract often omits experimental details, quantitative findings, or research motivation.',
        recommendation: 'Ensure all five canonical components (problem, goal, method, result, conclusion) are stated with sufficient detail.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    } else if (absWordCount > 350) {
      abstractScore = Math.max(4.5, abstractScore - 1);
      findings.push({
        id: `F-ABS-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'low',
        title: 'Abstract length exceeds common publication limit (300-350 words)',
        location: 'Abstract',
        evidence: `Word count: ${absWordCount} words`,
        explanation: 'Many IEEE, ACM, and Elsevier journals enforce strict 200 or 250-word abstract limits.',
        recommendation: 'Condense background sentences and remove peripheral details to stay within 200-250 words.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }

    // Heuristics for the 5 essential components
    const lowerAbs = abstractText.toLowerCase();

    // 1. Background / Problem
    if (/(challenge|problem|issue|demand|despite|however|traditional|rapidly|critical|gap|in recent years|growing need)/.test(lowerAbs)) {
      abstractComponents.background = true;
    }
    // 2. Objective / Proposal
    if (/(we propose|this paper|in this study|this work|we introduce|aims to|objective of|we present|we develop)/.test(lowerAbs)) {
      abstractComponents.objective = true;
    }
    // 3. Methodology
    if (/(using|method|framework|algorithm|model|architecture|experimental|dataset|evaluated|implemented|trained)/.test(lowerAbs)) {
      abstractComponents.methodology = true;
    }
    // 4. Results
    if (/(results show|demonstrates|achieves|outperforms|accuracy|improvement|reduces|findings reveal|experimentally)/.test(lowerAbs)) {
      abstractComponents.results = true;
    }
    // 5. Conclusion / Implication
    if (/(conclude|significance|provides|potential|future work|highlight|valuable|implication|demonstrating the viability)/.test(lowerAbs)) {
      abstractComponents.conclusion = true;
    }

    const missingComponents: string[] = [];
    if (!abstractComponents.background) missingComponents.push('Background/Problem statement');
    if (!abstractComponents.objective) missingComponents.push('Explicit research objective/proposal statement');
    if (!abstractComponents.methodology) missingComponents.push('Methodological description');
    if (!abstractComponents.results) missingComponents.push('Quantitative or qualitative findings statement');
    if (!abstractComponents.conclusion) missingComponents.push('Concluding implication/impact statement');

    if (missingComponents.length > 0) {
      abstractScore = Math.max(3, abstractScore - (missingComponents.length * 0.8));
      findings.push({
        id: `F-ABS-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: missingComponents.length > 2 ? 'medium' : 'low',
        title: `Abstract may lack core structural elements (${missingComponents.length} missing)`,
        location: 'Abstract',
        evidence: `Missing cues: ${missingComponents.join(', ')}`,
        explanation: 'Comprehensive research abstracts explicitly state the problem, objective, methodology, key results, and broader implications.',
        recommendation: `Revise the abstract to clearly present: ${missingComponents.join('; ')}.`,
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    }
  }

  // 3. KEYWORDS ASSESSMENT
  let keywordsScore = 3; // out of 3
  const detectedKeywords: string[] = [];

  if (keywordsText && keywordsText.trim().length > 0) {
    const rawTokens = keywordsText
      .replace(/^(keywords|index terms|key words)[:\s—–-]+/i, '')
      .split(/[,;•\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 1 && !/^(and|or)$/i.test(k));

    rawTokens.forEach(t => {
      if (!detectedKeywords.includes(t)) {
        detectedKeywords.push(t);
      }
    });
  }

  if (detectedKeywords.length === 0) {
    keywordsScore = 1;
    findings.push({
      id: `F-KEY-${findings.length + 1}`,
      analysisId,
      category: 'Title, Abstract, and Keywords',
      severity: 'medium',
      title: 'Keywords section not detected or empty',
      location: 'Keywords',
      evidence: keywordsText ? `Raw text: "${keywordsText.slice(0, 80)}"` : 'Keywords header absent',
      explanation: 'Scholarly databases require 4 to 6 indexed terms to facilitate discoverability and categorization.',
      recommendation: 'Provide 4 to 6 specific domain keywords separated by commas or semicolons.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    if (detectedKeywords.length < 3) {
      keywordsScore = Math.max(1.5, keywordsScore - 1);
      findings.push({
        id: `F-KEY-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'low',
        title: 'Few keywords provided',
        location: 'Keywords',
        evidence: `Only ${detectedKeywords.length} terms found: [${detectedKeywords.join(', ')}]`,
        explanation: 'Fewer than 3 keywords may limit search indexing in IEEE Xplore, ACM Digital Library, or Scopus.',
        recommendation: 'Add 2-3 additional relevant sub-domain or methodological keywords.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    } else if (detectedKeywords.length > 8) {
      keywordsScore = Math.max(2, keywordsScore - 0.5);
      findings.push({
        id: `F-KEY-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'low',
        title: 'High number of keywords',
        location: 'Keywords',
        evidence: `${detectedKeywords.length} terms: [${detectedKeywords.slice(0, 5).join(', ')}, ...]`,
        explanation: 'Most journals suggest keeping keyword lists to between 4 and 7 specific terms.',
        recommendation: 'Focus on the most salient 4-6 concepts.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }

    // Check title overlap
    const titleLower = effectiveTitle.toLowerCase();
    const overlappingKeywords = detectedKeywords.filter(k => titleLower.includes(k.toLowerCase()));
    if (detectedKeywords.length > 0 && overlappingKeywords.length === detectedKeywords.length) {
      findings.push({
        id: `F-KEY-${findings.length + 1}`,
        analysisId,
        category: 'Title, Abstract, and Keywords',
        severity: 'low',
        title: 'All keywords directly duplicate title terms',
        location: 'Keywords',
        evidence: `All ${detectedKeywords.length} keywords appear verbatim in the title`,
        explanation: 'Since search engines index the title by default, using identical keywords misses an opportunity to index related synonyms, parent domains, or techniques.',
        recommendation: 'Supplement with broader domain tags or methodological terminology not explicitly found in the title.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }
  }

  return {
    findings,
    titleScore: Math.round(titleScore * 10) / 10,
    abstractScore: Math.round(abstractScore * 10) / 10,
    keywordsScore: Math.round(keywordsScore * 10) / 10,
    abstractComponents,
    detectedKeywords
  };
}
