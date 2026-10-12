import { CategoryAssessment } from '../types';

export interface RubricScoreInput {
  structureScore: number;         // max 15
  titleAbstractScore: number;     // max 15 (title 5 + abstract 7 + keywords 3)
  problemObjectivesScore: number; // max 10
  literatureReviewScore: number;  // max 15
  methodologyScore: number;       // max 15
  resultsDiscussionScore: number; // max 15
  citationScore: number;          // max 10
  writingScore: number;           // max 5
  enabledCategories?: string[];   // if user deselected any categories
}

export interface RubricScoreOutput {
  overallScore: number;
  scoreStatusLabel: 'Strong rubric compliance' | 'Promising with improvements' | 'Needs revision' | 'Needs substantial revision';
  normalizedCalculationFormula: string;
  categoryAssessments: CategoryAssessment[];
}

export function calculateRubricScore(input: RubricScoreInput): RubricScoreOutput {
  const isEnabled = (cat: string) => {
    if (!input.enabledCategories || input.enabledCategories.length === 0) return true;
    return input.enabledCategories.includes(cat);
  };

  const categories: CategoryAssessment[] = [
    {
      id: 'CAT-STR',
      category: 'Structure and completeness',
      earnedScore: Math.min(15, Math.max(0, input.structureScore)),
      maxScore: 15,
      weight: 15,
      applicable: isEnabled('Structure and completeness'),
      assessmentType: 'rule_based',
      confidence: 'high',
      humanVerificationRecommended: false,
      explanation: 'Evaluates manuscript sections against target publishing standards (IMRaD, IEEE, ACM).'
    },
    {
      id: 'CAT-TAK',
      category: 'Title, abstract, and keywords',
      earnedScore: Math.min(15, Math.max(0, input.titleAbstractScore)),
      maxScore: 15,
      weight: 15,
      applicable: isEnabled('Title, abstract, and keywords'),
      assessmentType: 'heuristic',
      confidence: 'high',
      humanVerificationRecommended: true,
      explanation: 'Assesses title clarity, 5 core abstract components (problem, goal, method, result, conclusion), and indexing keywords.'
    },
    {
      id: 'CAT-PRB',
      category: 'Research problem and objectives',
      earnedScore: Math.min(10, Math.max(0, input.problemObjectivesScore)),
      maxScore: 10,
      weight: 10,
      applicable: isEnabled('Research problem and objectives'),
      assessmentType: 'heuristic',
      confidence: 'medium',
      humanVerificationRecommended: true,
      explanation: 'Checks for explicit articulation of the scientific problem, clear aims or research questions, and contributions.'
    },
    {
      id: 'CAT-LIT',
      category: 'Literature review and research gap',
      earnedScore: Math.min(15, Math.max(0, input.literatureReviewScore)),
      maxScore: 15,
      weight: 15,
      applicable: isEnabled('Literature review and research gap'),
      assessmentType: 'heuristic',
      confidence: 'medium',
      humanVerificationRecommended: true,
      explanation: 'Evaluates prior art synthesis, critical analysis, and explicit identification of the research gap.'
    },
    {
      id: 'CAT-MTH',
      category: 'Methodology reporting',
      earnedScore: Math.min(15, Math.max(0, input.methodologyScore)),
      maxScore: 15,
      weight: 15,
      applicable: isEnabled('Methodology reporting'),
      assessmentType: 'heuristic',
      confidence: 'medium',
      humanVerificationRecommended: true,
      explanation: 'Examines experimental design clarity, dataset disclosure, model formulations, and evaluation metrics.'
    },
    {
      id: 'CAT-RDC',
      category: 'Results, discussion, and conclusion',
      earnedScore: Math.min(15, Math.max(0, input.resultsDiscussionScore)),
      maxScore: 15,
      weight: 15,
      applicable: isEnabled('Results, discussion, and conclusion'),
      assessmentType: 'heuristic',
      confidence: 'medium',
      humanVerificationRecommended: true,
      explanation: 'Assesses empirical findings reporting, benchmark baselines, critical discussion, limitations, and future work.'
    },
    {
      id: 'CAT-CIT',
      category: 'Citation and reference consistency',
      earnedScore: Math.min(10, Math.max(0, input.citationScore)),
      maxScore: 10,
      weight: 10,
      applicable: isEnabled('Citation and reference consistency'),
      assessmentType: 'rule_based',
      confidence: 'high',
      humanVerificationRecommended: false,
      explanation: 'Deterministic cross-verification between in-text citations and bibliography entries, flagging uncited and missing items.'
    },
    {
      id: 'CAT-WRT',
      category: 'Writing clarity and organization',
      earnedScore: Math.min(5, Math.max(0, input.writingScore)),
      maxScore: 5,
      weight: 5,
      applicable: isEnabled('Writing clarity and organization'),
      assessmentType: 'heuristic',
      confidence: 'high',
      humanVerificationRecommended: false,
      explanation: 'Readability metrics, sentence length variance, passive voice density, and organizational flow indicators.'
    }
  ];

  // Calculate normalized overall score
  const applicableCategories = categories.filter(c => c.applicable);
  const earnedSum = applicableCategories.reduce((acc, curr) => acc + curr.earnedScore, 0);
  const maxSum = applicableCategories.reduce((acc, curr) => acc + curr.maxScore, 0);

  let overallScore = 0;
  let formula = '';

  if (maxSum > 0) {
    overallScore = Math.round((earnedSum / maxSum) * 100);
    if (maxSum === 100) {
      formula = `Direct Sum: ${earnedSum.toFixed(1)} / 100.0 pts = ${overallScore}/100`;
    } else {
      formula = `Normalized: (${earnedSum.toFixed(1)} earned / ${maxSum} max applicable pts) × 100 = ${overallScore}/100`;
    }
  } else {
    overallScore = 0;
    formula = 'No applicable categories selected';
  }

  // Determine rubric compliance status label
  let scoreStatusLabel: 'Strong rubric compliance' | 'Promising with improvements' | 'Needs revision' | 'Needs substantial revision';
  if (overallScore >= 85) {
    scoreStatusLabel = 'Strong rubric compliance';
  } else if (overallScore >= 70) {
    scoreStatusLabel = 'Promising with improvements';
  } else if (overallScore >= 50) {
    scoreStatusLabel = 'Needs revision';
  } else {
    scoreStatusLabel = 'Needs substantial revision';
  }

  return {
    overallScore,
    scoreStatusLabel,
    normalizedCalculationFormula: formula,
    categoryAssessments: categories
  };
}
