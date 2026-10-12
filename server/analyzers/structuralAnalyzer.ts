import { Finding, ExtractedSection } from '../types';

export interface StructuralAnalysisResult {
  findings: Finding[];
  structureScore: number;       // out of 15
  problemObjectivesScore: number; // out of 10
  literatureReviewScore: number;  // out of 15
  methodologyScore: number;     // out of 15
  resultsDiscussionScore: number; // out of 15
  strengths: string[];
}

export function analyzeStructureAndContent(
  analysisId: string,
  sections: Record<string, ExtractedSection>,
  manuscriptType: 'imrad' | 'ieee' | 'acm' | 'custom'
): StructuralAnalysisResult {
  const findings: Finding[] = [];
  const strengths: string[] = [];

  // ==========================================
  // 1. STRUCTURE AND COMPLETENESS (Weight: 15)
  // ==========================================
  let structureScore = 15;
  const missingCoreSections: string[] = [];

  const requiredSectionsMap: Record<string, string[]> = {
    imrad: ['Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'],
    ieee: ['Introduction', 'Methodology', 'Results', 'Conclusion', 'References'],
    acm: ['Introduction', 'Methodology', 'Results', 'Conclusion', 'References'],
    custom: ['Introduction', 'Methodology', 'Conclusion', 'References']
  };

  const expectedList = requiredSectionsMap[manuscriptType] || requiredSectionsMap.imrad;

  expectedList.forEach(name => {
    const sec = sections[name];
    if (!sec || sec.confidence === 'missing') {
      missingCoreSections.push(name);
    }
  });

  if (missingCoreSections.length > 0) {
    const deduction = Math.min(10, missingCoreSections.length * 3);
    structureScore = Math.max(3, structureScore - deduction);

    findings.push({
      id: `F-STR-${findings.length + 1}`,
      analysisId,
      category: 'Structure and Completeness',
      severity: missingCoreSections.length > 1 ? 'high' : 'medium',
      title: `Missing standard manuscript section(s): ${missingCoreSections.join(', ')}`,
      location: 'Manuscript Outline',
      evidence: `Target format (${manuscriptType.toUpperCase()}) expected: ${missingCoreSections.join(', ')}`,
      explanation: `Peer reviewers expect a conventional structural flow. Missing standard sections like ${missingCoreSections[0]} make evaluating the paper difficult.`,
      recommendation: `Include dedicated headings for ${missingCoreSections.join(', ')} or explicitly state how they are integrated.`,
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    strengths.push(`Complete macro-structural framework adhering to ${manuscriptType.toUpperCase()} publishing norms.`);
  }

  // =======================================================
  // 2. RESEARCH PROBLEM AND OBJECTIVES (Weight: 10)
  // =======================================================
  let problemObjectivesScore = 10;
  const introSec = sections['Introduction'];
  const introText = introSec?.content || '';

  if (!introText || introText.length < 100) {
    problemObjectivesScore = 2;
    findings.push({
      id: `F-PRB-${findings.length + 1}`,
      analysisId,
      category: 'Research Problem and Objectives',
      severity: 'high',
      title: 'Introduction section is missing or critically brief',
      location: 'Introduction',
      evidence: introText ? `Length: ${introText.length} characters` : 'Section absent',
      explanation: 'The introduction must establish the scientific background, articulate the problem, and present research objectives.',
      recommendation: 'Provide an introduction of at least 400-800 words covering background, problem statement, and claimed contributions.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    const lowerIntro = introText.toLowerCase();

    // Check for problem statement cues
    const hasProblemCue = /(problem|challenge|limitation|deficiency|bottleneck|vulnerability|gap in current|remains difficult)/.test(lowerIntro);
    // Check for research objective / question cues
    const hasObjectiveCue = /(objective|we aim to|the primary goal|research question|hypothesize|we investigate|we propose|in this paper)/.test(lowerIntro);
    // Check for contribution statement cues
    const hasContributionCue = /(our contributions?|contributions of this paper|key contributions|we make the following contributions)/.test(lowerIntro);

    if (!hasProblemCue) {
      problemObjectivesScore -= 2.5;
      findings.push({
        id: `F-PRB-${findings.length + 1}`,
        analysisId,
        category: 'Research Problem and Objectives',
        severity: 'medium',
        title: 'Research problem is not prominently articulated in Introduction',
        location: 'Introduction',
        evidence: 'Absence of explicit problem framing markers in extracted introduction',
        explanation: 'Readers need to know what specific technical or conceptual challenge motivates this research.',
        recommendation: 'Explicitly state the exact research problem or technical hurdle your work addresses in the first two paragraphs.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    }

    if (!hasObjectiveCue) {
      problemObjectivesScore -= 2.5;
      findings.push({
        id: `F-PRB-${findings.length + 1}`,
        analysisId,
        category: 'Research Problem and Objectives',
        severity: 'medium',
        title: 'Clear statement of research objectives or aims is difficult to discern',
        location: 'Introduction',
        evidence: 'No explicit "objective", "aim", or "research question" markers identified',
        explanation: 'Reviewers look for clear, bounded objectives to judge whether the results fulfill the paper’s promises.',
        recommendation: 'Formulate 2-3 concise research questions or an explicit bulleted objective statement.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    }

    if (hasContributionCue) {
      strengths.push('Explicit enumeration of claimed contributions identified in the Introduction.');
    } else {
      problemObjectivesScore -= 1;
      findings.push({
        id: `F-PRB-${findings.length + 1}`,
        analysisId,
        category: 'Research Problem and Objectives',
        severity: 'low',
        title: 'Introduction lacks a distinct bulleted or enumerated contribution list',
        location: 'Introduction',
        evidence: 'No "contributions of this paper are..." pattern detected',
        explanation: 'Top IEEE/ACM venues heavily favor explicit contribution bullet points at the end of the Introduction.',
        recommendation: 'Add an enumerated summary of primary contributions (e.g., "The main contributions are: 1) ... 2) ... 3) ...").',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: true,
        humanVerificationRequired: false
      });
    }
  }

  // ============================================================
  // 3. LITERATURE REVIEW AND RESEARCH GAP (Weight: 15)
  // ============================================================
  let literatureReviewScore = 15;
  const relSec = sections['Related Work'];
  const relText = relSec?.content || '';

  if (!relText || relText.length < 150) {
    literatureReviewScore = 5;
    findings.push({
      id: `F-LIT-${findings.length + 1}`,
      analysisId,
      category: 'Literature Review and Research Gap',
      severity: 'high',
      title: 'Related Work or Literature Review section is absent or minimal',
      location: 'Related Work / Literature Review',
      evidence: relText ? `Length: ${relText.length} characters` : 'Section absent',
      explanation: 'Without a dedicated review of prior literature, the novelty and context of the research cannot be evaluated.',
      recommendation: 'Add a comprehensive Literature Review comparing relevant recent works (last 3-5 years) with the proposed method.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    const lowerRel = relText.toLowerCase();

    // Check for comparative synthesis vs simple listing
    const hasGapMarker = /(however|in contrast|unlike|differ from|to the best of our knowledge|limitation of prior|existing work fails|remains unexplored)/.test(lowerRel);
    const hasComparativeTable = /(table|comparison|taxonomy|summary of related)/.test(lowerRel);

    if (!hasGapMarker) {
      literatureReviewScore -= 4;
      findings.push({
        id: `F-LIT-${findings.length + 1}`,
        analysisId,
        category: 'Literature Review and Research Gap',
        severity: 'medium',
        title: 'Literature review appears descriptive rather than critical/comparative',
        location: 'Related Work',
        evidence: 'Lack of explicit contrastive transition markers ("however", "in contrast", "unexplored")',
        explanation: 'A strong literature review must identify the limitations of prior work to motivate why the new work is needed.',
        recommendation: 'Explicitly synthesize the gap: explain what prior studies achieved and what specific challenge remained unaddressed.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    } else {
      strengths.push('Critical discussion of prior literature includes explicit gap identification.');
    }

    if (hasComparativeTable) {
      strengths.push('Includes comparative discussion or tabular synthesis of related work.');
    }
  }

  // ============================================================
  // 4. METHODOLOGY REPORTING (Weight: 15)
  // ============================================================
  let methodologyScore = 15;
  const methSec = sections['Methodology'];
  const methText = methSec?.content || '';

  if (!methText || methText.length < 150) {
    methodologyScore = 4;
    findings.push({
      id: `F-MTH-${findings.length + 1}`,
      analysisId,
      category: 'Methodology Reporting',
      severity: 'high',
      title: 'Methodology section is missing or has insufficient detail',
      location: 'Methodology',
      evidence: methText ? `Length: ${methText.length} characters` : 'Section absent',
      explanation: 'Scholarly reproducibility requires sufficient methodological detail for independent replication.',
      recommendation: 'Describe your experimental design, mathematical models, algorithms, or system architecture in detail.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    const lowerMeth = methText.toLowerCase();

    // Check for datasets / materials
    const hasData = /(dataset|data collection|sample size|participants|corpus|benchmark|hardware|parameters)/.test(lowerMeth);
    // Check for algorithms / formulation
    const hasAlgorithmOrMath = /(algorithm|equation|formula|architecture|pipeline|flowchart|pseudocode|model architecture)/.test(lowerMeth);
    // Check for evaluation metrics
    const hasMetrics = /(metrics|accuracy|precision|recall|f1-score|f1 score|rmse|mae|loss|latency|throughput|p-value)/.test(lowerMeth);

    if (!hasData) {
      methodologyScore -= 2.5;
      findings.push({
        id: `F-MTH-${findings.length + 1}`,
        analysisId,
        category: 'Methodology Reporting',
        severity: 'medium',
        title: 'Dataset or experimental parameters are not clearly detailed',
        location: 'Methodology',
        evidence: 'No mentions of dataset size, collection procedure, or hardware parameters detected',
        explanation: 'Reproducibility hinges on clearly specifying data origins, splits (train/val/test), and configuration settings.',
        recommendation: 'Add a dedicated subsection on dataset characteristics, preprocessing steps, and test environment.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    }

    if (!hasMetrics) {
      methodologyScore -= 2.5;
      findings.push({
        id: `F-MTH-${findings.length + 1}`,
        analysisId,
        category: 'Methodology Reporting',
        severity: 'medium',
        title: 'Evaluation metrics not explicitly defined in methodology',
        location: 'Methodology',
        evidence: 'No standard metric definitions (e.g. Accuracy, F1, RMSE, Latency) found',
        explanation: 'Defining evaluation metrics before presenting results avoids ambiguity in experimental claims.',
        recommendation: 'Specify the exact formulas and statistical measures used to evaluate performance.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    }

    if (hasAlgorithmOrMath) {
      strengths.push('Presents algorithmic, architectural, or formal technical formulation in Methodology.');
    }
  }

  // ============================================================
  // 5. RESULTS, DISCUSSION, AND CONCLUSION (Weight: 15)
  // ============================================================
  let resultsDiscussionScore = 15;
  const resSec = sections['Results'];
  const resText = resSec?.content || '';
  const concSec = sections['Conclusion'];
  const concText = concSec?.content || '';

  if (!resText || resText.length < 100) {
    resultsDiscussionScore -= 5;
    findings.push({
      id: `F-RDC-${findings.length + 1}`,
      analysisId,
      category: 'Results, Discussion, and Conclusion',
      severity: 'high',
      title: 'Results section is absent or sparsely reported',
      location: 'Results',
      evidence: resText ? `Length: ${resText.length} characters` : 'Section absent',
      explanation: 'Empirical research requires detailed presentation of experimental findings.',
      recommendation: 'Provide quantitative experimental results with tables, graphs, or statistical analyses.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    // Check for quantitative cues
    const hasNumbers = /\b\d+(?:\.\d+)?%\b|\b\d+\.\d+\b/.test(resText);
    const hasComparison = /(baseline|compared to|outperformed|improvement over|state-of-the-art|sota)/i.test(resText);

    if (!hasComparison) {
      resultsDiscussionScore -= 2.5;
      findings.push({
        id: `F-RDC-${findings.length + 1}`,
        analysisId,
        category: 'Results, Discussion, and Conclusion',
        severity: 'medium',
        title: 'Results lack direct comparative baseline benchmarks',
        location: 'Results',
        evidence: 'No explicit baseline comparison markers ("compared to", "baseline", "outperforms") found',
        explanation: 'Claiming performance benefits requires comparing against established baseline models or existing solutions.',
        recommendation: 'Include a comparative analysis against at least 1-2 standard baselines.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    } else {
      strengths.push('Results include comparative evaluation against benchmark methods.');
    }
  }

  if (!concText || concText.length < 80) {
    resultsDiscussionScore -= 3.5;
    findings.push({
      id: `F-RDC-${findings.length + 1}`,
      analysisId,
      category: 'Results, Discussion, and Conclusion',
      severity: 'medium',
      title: 'Conclusion is absent or unusually brief',
      location: 'Conclusion',
      evidence: concText ? `Length: ${concText.length} characters` : 'Section absent',
      explanation: 'The conclusion should summarize the principal findings, state limitations, and outline future directions.',
      recommendation: 'Draft a comprehensive conclusion of 150-300 words addressing stated objectives and future research paths.',
      assessmentType: 'rule_based',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  } else {
    const lowerConc = concText.toLowerCase();
    const hasFutureWork = /(future work|future directions|limitations?|remains to be investigated|in the future)/.test(lowerConc);
    if (!hasFutureWork) {
      resultsDiscussionScore -= 1;
      findings.push({
        id: `F-RDC-${findings.length + 1}`,
        analysisId,
        category: 'Results, Discussion, and Conclusion',
        severity: 'low',
        title: 'Conclusion lacks explicit discussion of limitations or future work',
        location: 'Conclusion',
        evidence: 'No markers for future directions or limitations found in Conclusion',
        explanation: 'Reviewers look favorably on candid discussions of study boundaries and concrete next steps.',
        recommendation: 'Add a short paragraph outlining limitations and high-value future research trajectories.',
        assessmentType: 'heuristic',
        isObjectivelyVerifiable: false,
        humanVerificationRequired: true
      });
    } else {
      strengths.push('Conclusion appropriately discusses limitations and future research avenues.');
    }
  }

  return {
    findings,
    structureScore: Math.max(0, Math.round(structureScore * 10) / 10),
    problemObjectivesScore: Math.max(0, Math.round(problemObjectivesScore * 10) / 10),
    literatureReviewScore: Math.max(0, Math.round(literatureReviewScore * 10) / 10),
    methodologyScore: Math.max(0, Math.round(methodologyScore * 10) / 10),
    resultsDiscussionScore: Math.max(0, Math.round(resultsDiscussionScore * 10) / 10),
    strengths
  };
}
