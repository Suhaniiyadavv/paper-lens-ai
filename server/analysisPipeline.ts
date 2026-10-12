import { 
  AnalysisRecord, 
  ActionItem, 
  Finding, 
  AnalysisStatus 
} from './types';
import { parsePdfBuffer, parseDocxBuffer, DocumentParseResult } from './analyzers/documentParser';
import { detectSections } from './analyzers/sectionDetector';
import { analyzeTitleAbstract } from './analyzers/titleAbstractAnalyzer';
import { analyzeCitationsAndReferences } from './analyzers/citationAnalyzer';
import { analyzeReadability } from './analyzers/readabilityAnalyzer';
import { analyzeStructureAndContent } from './analyzers/structuralAnalyzer';
import { calculateRubricScore } from './analyzers/rubricScorer';
import { runAiAssistedFeedback } from './aiService';
import { storage } from './storage';

export interface RunAnalysisOptions {
  fileBuffer?: Buffer;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'demo';
  fileSize: number;
  rawText?: string;
  manuscriptType?: 'imrad' | 'ieee' | 'acm' | 'custom';
  targetStyle?: string;
  researchDomain?: string;
  authorTitleInput?: string;
  enabledCategories?: string[];
}

export async function executeManuscriptAnalysis(options: RunAnalysisOptions): Promise<AnalysisRecord> {
  const analysisId = 'PL-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const createdAt = new Date().toISOString();

  let text = '';
  let pageCount = 1;
  let wordCount = 0;
  const extractionWarnings: string[] = [];

  // Step 1: Text extraction
  if (options.fileType === 'pdf' && options.fileBuffer) {
    const parseResult: DocumentParseResult = await parsePdfBuffer(options.fileBuffer);
    text = parseResult.text;
    pageCount = parseResult.pageCount;
    wordCount = parseResult.wordCount;
    extractionWarnings.push(...parseResult.warnings);
  } else if (options.fileType === 'docx' && options.fileBuffer) {
    const parseResult: DocumentParseResult = await parseDocxBuffer(options.fileBuffer);
    text = parseResult.text;
    pageCount = parseResult.pageCount;
    wordCount = parseResult.wordCount;
    extractionWarnings.push(...parseResult.warnings);
  } else if (options.rawText) {
    text = options.rawText;
    wordCount = text.split(/\s+/).filter(Boolean).length;
    pageCount = Math.max(1, Math.ceil(wordCount / 500));
  } else {
    throw new Error('No valid document buffer or text provided for analysis.');
  }

  // Step 2: Section Detection
  const sections = detectSections(text);

  // Step 3: Run Deterministic & Heuristic Analyzers
  const titleText = sections['Title']?.content || '';
  const abstractText = sections['Abstract']?.content || '';
  const keywordsText = sections['Keywords']?.content || '';
  const referencesText = sections['References']?.content || '';

  // Title, Abstract & Keywords
  const titleAbstractResult = analyzeTitleAbstract(
    analysisId,
    titleText,
    abstractText,
    keywordsText,
    options.authorTitleInput
  );

  // Citations & References
  const citationResult = analyzeCitationsAndReferences(
    analysisId,
    text,
    referencesText
  );

  // Readability & Organization
  const readabilityResult = analyzeReadability(
    analysisId,
    text
  );

  // Structure & Content Flow
  const mType = options.manuscriptType || 'imrad';
  const structuralResult = analyzeStructureAndContent(
    analysisId,
    sections,
    mType
  );

  // Step 4: AI Qualitative Feedback (when enabled / fallback when offline)
  const sectionsSummaryForAi = Object.values(sections)
    .filter(s => s.content.length > 0)
    .map(s => ({
      name: s.name,
      excerpt: s.content.slice(0, 1000),
      wordCount: s.wordCount
    }));

  const effectiveTitle = options.authorTitleInput || titleText || options.fileName;
  const aiResult = await runAiAssistedFeedback(
    analysisId,
    effectiveTitle,
    sectionsSummaryForAi,
    options.targetStyle || 'IEEE / ACM Standard'
  );

  // Step 5: Merge Findings and Strengths
  const combinedFindings: Finding[] = [
    ...structuralResult.findings,
    ...titleAbstractResult.findings,
    ...citationResult.findings,
    ...readabilityResult.findings,
    ...aiResult.qualitativeFindings
  ];

  const combinedStrengths: string[] = [
    ...structuralResult.strengths,
    ...aiResult.qualitativeStrengths
  ];

  // Step 6: Rubric Scoring
  const rubricTotal = calculateRubricScore({
    structureScore: structuralResult.structureScore,
    titleAbstractScore: titleAbstractResult.titleScore + titleAbstractResult.abstractScore + titleAbstractResult.keywordsScore,
    problemObjectivesScore: structuralResult.problemObjectivesScore,
    literatureReviewScore: structuralResult.literatureReviewScore,
    methodologyScore: structuralResult.methodologyScore,
    resultsDiscussionScore: structuralResult.resultsDiscussionScore,
    citationScore: citationResult.citationScore,
    writingScore: readabilityResult.writingScore,
    enabledCategories: options.enabledCategories
  });

  // Step 7: Create Action Items from Findings
  const actionItems: ActionItem[] = combinedFindings.map(f => ({
    id: 'ACT-' + f.id.replace('F-', ''),
    findingId: f.id,
    title: f.title,
    category: f.category,
    priority: f.severity,
    completed: false,
    location: f.location,
    updatedAt: new Date().toISOString()
  }));

  const record: AnalysisRecord = {
    id: analysisId,
    documentName: options.fileName,
    fileType: options.fileType,
    fileSize: options.fileSize,
    pageCount,
    wordCount,
    createdAt,
    completedAt: new Date().toISOString(),
    status: 'completed',
    rubricVersion: '2026.1-Woxsen-MajorProject',
    manuscriptType: mType,
    targetStyle: options.targetStyle || 'IMRaD Scholarly Standard',
    researchDomain: options.researchDomain || 'Computer Science & Engineering',
    authorTitleInput: options.authorTitleInput,
    overallScore: rubricTotal.overallScore,
    scoreStatusLabel: rubricTotal.scoreStatusLabel,
    normalizedCalculationFormula: rubricTotal.normalizedCalculationFormula,
    extractionWarnings,
    aiAvailabilityStatus: aiResult.available ? 'enabled' : 'offline_fallback',
    aiModelUsed: aiResult.modelUsed,
    categoryAssessments: rubricTotal.categoryAssessments,
    findings: combinedFindings,
    actionItems,
    strengths: combinedStrengths,
    sections,
    citationAudit: {
      totalCitationsFound: citationResult.totalCitationsFound,
      totalReferencesInBibliography: citationResult.totalReferencesInBibliography,
      uncitedReferencesCount: citationResult.uncitedReferencesCount,
      missingReferenceCitationsCount: citationResult.missingReferenceCitationsCount,
      duplicateReferencesCount: citationResult.duplicateReferencesCount,
      citationMatches: citationResult.citationMatches,
      bibliographyEntries: citationResult.bibliographyEntries
    },
    readability: readabilityResult.metrics,
    abstractComponentsDetected: titleAbstractResult.abstractComponents
  };

  storage.save(record);
  return record;
}
