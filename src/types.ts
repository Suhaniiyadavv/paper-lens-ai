export type Severity = 'high' | 'medium' | 'low';
export type AssessmentType = 'rule_based' | 'heuristic' | 'ai_assisted';
export type VerificationStatus = 'unverified' | 'author_verified' | 'requires_expert_check';
export type AnalysisStatus = 'processing' | 'completed' | 'failed';

export interface CategoryAssessment {
  id: string;
  category: string;
  earnedScore: number;
  maxScore: number;
  weight: number;
  applicable: boolean;
  assessmentType: AssessmentType;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  humanVerificationRecommended: boolean;
}

export interface Finding {
  id: string;
  analysisId: string;
  category: string;
  severity: Severity;
  title: string;
  location: string;
  evidence: string;
  explanation: string;
  recommendation: string;
  assessmentType: AssessmentType;
  isObjectivelyVerifiable: boolean;
  humanVerificationRequired: boolean;
  resolved?: boolean;
}

export interface ActionItem {
  id: string;
  findingId: string;
  title: string;
  category: string;
  priority: Severity;
  completed: boolean;
  location: string;
  updatedAt: string;
}

export interface ExtractedSection {
  name: string;
  detectedHeading: string;
  content: string;
  wordCount: number;
  confidence: 'detected' | 'inferred' | 'missing';
}

export interface CitationReferenceMatch {
  citationKey: string;
  occurrencesCount: number;
  hasMatchingReference: boolean;
  matchedReferenceText?: string;
  citationLocations: string[];
}

export interface ReferenceEntry {
  raw: string;
  index: number;
  key?: string;
  year?: string;
  hasDoi: boolean;
  doi?: string;
  hasUrl: boolean;
  url?: string;
  isCitedInText: boolean;
}

export interface ReadabilityMetrics {
  totalWords: number;
  totalSentences: number;
  averageSentenceLength: number;
  longSentencesCount: number;
  fleschReadingEase: number;
  fleschKincaidGradeLevel: number;
  automatedReadabilityIndex: number;
  passiveVoiceEstimatedPercentage: number;
  readingEaseDescription: string;
}

export interface AnalysisRecord {
  id: string;
  documentName: string;
  fileType: 'pdf' | 'docx' | 'demo';
  fileSize: number;
  pageCount: number;
  wordCount: number;
  createdAt: string;
  completedAt: string;
  status: AnalysisStatus;
  rubricVersion: string;
  manuscriptType: 'imrad' | 'ieee' | 'acm' | 'custom';
  targetStyle: string;
  researchDomain: string;
  authorTitleInput?: string;
  overallScore: number;
  scoreStatusLabel: 'Strong rubric compliance' | 'Promising with improvements' | 'Needs revision' | 'Needs substantial revision';
  normalizedCalculationFormula: string;
  extractionWarnings: string[];
  aiAvailabilityStatus: 'enabled' | 'offline_fallback' | 'disabled';
  aiModelUsed?: string;
  categoryAssessments: CategoryAssessment[];
  findings: Finding[];
  actionItems: ActionItem[];
  strengths: string[];
  sections: Record<string, ExtractedSection>;
  citationAudit: {
    totalCitationsFound: number;
    totalReferencesInBibliography: number;
    uncitedReferencesCount: number;
    missingReferenceCitationsCount: number;
    duplicateReferencesCount: number;
    citationMatches: CitationReferenceMatch[];
    bibliographyEntries: ReferenceEntry[];
  };
  readability: ReadabilityMetrics;
  abstractComponentsDetected: {
    background: boolean;
    objective: boolean;
    methodology: boolean;
    results: boolean;
    conclusion: boolean;
  };
}

export interface SystemSettingsStatus {
  aiService: {
    provider: string;
    model: string;
    configured: boolean;
    status: 'online' | 'offline_fallback';
    modeDescription: string;
  };
  storage: {
    type: string;
    totalAnalyses: number;
    avgScore: number;
    topIssueCategory: string;
    totalUnresolvedRecommendations: number;
  };
  rubric: {
    version: string;
    maxPoints: number;
    totalCategories: number;
  };
}

export interface EvaluationBenchmarkSample {
  id: string;
  title: string;
  category: string;
  groundTruthIssuesCount: number;
  detectedIssuesCount: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  humanRatingScore: number;
  predictedScore: number;
  absoluteError: number;
}

export interface EvaluationBenchmarkResult {
  evaluationDate: string;
  evaluator: string;
  totalManuscriptsTested: number;
  totalGroundTruthIssues: number;
  totalDetectedIssues: number;
  aggregatePrecision: number;
  aggregateRecall: number;
  aggregateF1Score: number;
  meanAbsoluteError: number;
  ruleBasedF1: number;
  heuristicF1: number;
  aiAssistedF1: number;
  samples: EvaluationBenchmarkSample[];
}
