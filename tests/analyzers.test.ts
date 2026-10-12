import { describe, it, expect } from 'vitest';
import { detectSections } from '../server/analyzers/sectionDetector';
import { analyzeTitleAbstract } from '../server/analyzers/titleAbstractAnalyzer';
import { analyzeCitationsAndReferences } from '../server/analyzers/citationAnalyzer';
import { analyzeReadability } from '../server/analyzers/readabilityAnalyzer';
import { calculateRubricScore } from '../server/analyzers/rubricScorer';
import { DEMO_SYNTHETIC_MANUSCRIPT } from '../server/demoData';

describe('PaperLens AI Assessment Engine', () => {
  it('should segment canonical manuscript sections', () => {
    const sections = detectSections(DEMO_SYNTHETIC_MANUSCRIPT);
    expect(sections['Title']).toBeDefined();
    expect(sections['Abstract']).toBeDefined();
    expect(sections['Introduction']).toBeDefined();
    expect(sections['Related Work']).toBeDefined();
    expect(sections['Methodology']).toBeDefined();
    expect(sections['Results']).toBeDefined();
    expect(sections['Conclusion']).toBeDefined();
    expect(sections['References']).toBeDefined();
    expect(sections['Abstract'].content.length).toBeGreaterThan(50);
  });

  it('should detect title heuristics and filler words', () => {
    const sections = detectSections(DEMO_SYNTHETIC_MANUSCRIPT);
    const result = analyzeTitleAbstract(
      'TEST-01',
      sections['Title'].content,
      sections['Abstract'].content,
      sections['Keywords'].content
    );

    expect(result.titleScore).toBeGreaterThanOrEqual(1);
    expect(result.abstractScore).toBeGreaterThanOrEqual(1);
    expect(result.abstractComponents).toBeDefined();

    // The demo paper has "A Novel..." in title
    const hasNovelFinding = result.findings.some(f => f.title.includes('filler') || f.title.includes('Novel'));
    expect(hasNovelFinding).toBe(true);
  });

  it('should detect in-text citations and mismatch with bibliography', () => {
    const sections = detectSections(DEMO_SYNTHETIC_MANUSCRIPT);
    const result = analyzeCitationsAndReferences(
      'TEST-01',
      DEMO_SYNTHETIC_MANUSCRIPT,
      sections['References'].content
    );

    expect(result.totalCitationsFound).toBeGreaterThan(0);
    expect(result.totalReferencesInBibliography).toBeGreaterThan(0);
    // In demo paper, [15] is cited in text but missing from bibliography
    expect(result.missingReferenceCitationsCount).toBeGreaterThanOrEqual(1);
    // [12] is in bibliography but never cited in text
    expect(result.uncitedReferencesCount).toBeGreaterThanOrEqual(1);
    // [3] is a duplicate reference entry
    expect(result.duplicateReferencesCount).toBeGreaterThanOrEqual(1);
  });

  it('should calculate readability metrics and Flesch Reading Ease', () => {
    const result = analyzeReadability('TEST-01', DEMO_SYNTHETIC_MANUSCRIPT);
    expect(result.metrics.totalWords).toBeGreaterThan(100);
    expect(result.metrics.totalSentences).toBeGreaterThan(5);
    expect(result.metrics.fleschReadingEase).toBeGreaterThan(0);
    expect(result.metrics.averageSentenceLength).toBeGreaterThan(10);
  });

  it('should compute rubric score and normalize when categories are omitted', () => {
    const fullScore = calculateRubricScore({
      structureScore: 15,
      titleAbstractScore: 15,
      problemObjectivesScore: 10,
      literatureReviewScore: 15,
      methodologyScore: 15,
      resultsDiscussionScore: 15,
      citationScore: 10,
      writingScore: 5
    });
    expect(fullScore.overallScore).toBe(100);
    expect(fullScore.scoreStatusLabel).toBe('Strong rubric compliance');

    // Partial with omitted category
    const normalized = calculateRubricScore({
      structureScore: 15,
      titleAbstractScore: 15,
      problemObjectivesScore: 10,
      literatureReviewScore: 15,
      methodologyScore: 15,
      resultsDiscussionScore: 15,
      citationScore: 10,
      writingScore: 0,
      enabledCategories: [
        'Structure and completeness',
        'Title, abstract, and keywords',
        'Research problem and objectives',
        'Literature review and research gap',
        'Methodology reporting',
        'Results, discussion, and conclusion',
        'Citation and reference consistency'
      ]
    });
    // 95 out of 95 applicable points -> 100 normalized
    expect(normalized.overallScore).toBe(100);
  });
});
