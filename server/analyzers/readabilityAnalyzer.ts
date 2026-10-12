import { Finding, ReadabilityMetrics } from '../types';

export interface ReadabilityAnalysisResult {
  metrics: ReadabilityMetrics;
  findings: Finding[];
  writingScore: number; // out of 5
}

export function analyzeReadability(
  analysisId: string,
  fullText: string
): ReadabilityAnalysisResult {
  const findings: Finding[] = [];

  // Segment sentences
  const rawSentences = fullText
    .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const totalSentences = Math.max(1, rawSentences.length);
  const words = fullText.split(/\s+/).filter(w => w.length > 0);
  const totalWords = Math.max(1, words.length);

  // Long sentences (> 35 words)
  let longSentencesCount = 0;
  const longSentenceExamples: string[] = [];
  rawSentences.forEach(s => {
    const sWords = s.split(/\s+/).filter(Boolean);
    if (sWords.length > 35) {
      longSentencesCount++;
      if (longSentenceExamples.length < 2) {
        longSentenceExamples.push(s.slice(0, 110) + '...');
      }
    }
  });

  const averageSentenceLength = Math.round((totalWords / totalSentences) * 10) / 10;

  // Syllables estimation
  let totalSyllables = 0;
  words.forEach(w => {
    totalSyllables += countSyllables(w);
  });

  // Characters without whitespace
  const totalCharacters = fullText.replace(/\s+/g, '').length;

  // Flesch Reading Ease
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const wordsPerSentence = totalWords / totalSentences;
  const syllablesPerWord = totalSyllables / totalWords;
  let fre = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
  fre = Math.max(0, Math.min(100, Math.round(fre * 10) / 10));

  // Flesch-Kincaid Grade Level
  // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  let fkgl = (0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59;
  fkgl = Math.max(1, Math.round(fkgl * 10) / 10);

  // Automated Readability Index
  // 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
  let ari = (4.71 * (totalCharacters / totalWords)) + (0.5 * wordsPerSentence) - 21.43;
  ari = Math.max(1, Math.round(ari * 10) / 10);

  // Passive voice estimation
  const passiveRegex = /\b(is|are|was|were|been|be|being)\s+([a-z]+ed|[a-z]+en)\b/gi;
  const passiveMatches = fullText.match(passiveRegex) || [];
  const passiveVoiceEstimatedPercentage = Math.min(100, Math.round((passiveMatches.length / totalSentences) * 100));

  let readingEaseDescription = 'Standard academic difficulty';
  if (fre < 30) readingEaseDescription = 'Very complex / dense technical academic prose';
  else if (fre < 50) readingEaseDescription = 'Difficult academic prose (college graduate level)';
  else if (fre < 60) readingEaseDescription = 'Moderately challenging (undergraduate level)';
  else readingEaseDescription = 'Accessible scholarly writing';

  // 4. WRITING QUALITY SCORE & FINDINGS (out of 5)
  let writingScore = 5;

  if (averageSentenceLength > 28) {
    writingScore = Math.max(3, writingScore - 1);
    findings.push({
      id: `F-WRT-${findings.length + 1}`,
      analysisId,
      category: 'Writing Clarity and Organization',
      severity: 'medium',
      title: 'High average sentence length',
      location: 'Manuscript Body',
      evidence: `Average sentence length: ${averageSentenceLength} words/sentence (recommended target: 18-24 words)`,
      explanation: 'Unusually long sentences increase cognitive load on peer reviewers and risk syntactic ambiguity.',
      recommendation: 'Break complex compound sentences into two focused clauses to heighten readability.',
      assessmentType: 'heuristic',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: false
    });
  }

  if (longSentencesCount > 5) {
    writingScore = Math.max(3, writingScore - 0.8);
    findings.push({
      id: `F-WRT-${findings.length + 1}`,
      analysisId,
      category: 'Writing Clarity and Organization',
      severity: 'low',
      title: `Multiple unusually lengthy sentences detected (${longSentencesCount} sentences > 35 words)`,
      location: 'Manuscript Body',
      evidence: longSentenceExamples.join(' | '),
      explanation: 'Sentences exceeding 35 words frequently contain multiple subordinate clauses that obscure the core finding.',
      recommendation: 'Review lengthy sentences and separate methodological clauses from resulting conclusions.',
      assessmentType: 'heuristic',
      isObjectivelyVerifiable: true,
      humanVerificationRequired: true
    });
  }

  if (passiveVoiceEstimatedPercentage > 45) {
    findings.push({
      id: `F-WRT-${findings.length + 1}`,
      analysisId,
      category: 'Writing Clarity and Organization',
      severity: 'low',
      title: 'Heavy reliance on passive voice constructs',
      location: 'Manuscript Body',
      evidence: `Estimated ~${passiveVoiceEstimatedPercentage}% of sentences use passive verb constructs`,
      explanation: 'While passive voice is traditional in academic methodology, modern style guides (IEEE, Nature, ACM) prefer active voice for clarity.',
      recommendation: 'Use active voice for author actions (e.g., "We evaluated..." instead of "It was evaluated by us...").',
      assessmentType: 'heuristic',
      isObjectivelyVerifiable: false,
      humanVerificationRequired: true
    });
  }

  return {
    metrics: {
      totalWords,
      totalSentences,
      averageSentenceLength,
      longSentencesCount,
      fleschReadingEase: fre,
      fleschKincaidGradeLevel: fkgl,
      automatedReadabilityIndex: ari,
      passiveVoiceEstimatedPercentage,
      readingEaseDescription
    },
    findings,
    writingScore: Math.round(writingScore * 10) / 10
  };
}

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean || clean.length <= 3) return 1;
  const vowels = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '').match(/[aeiouy]{1,2}/g);
  return vowels ? vowels.length : 1;
}
