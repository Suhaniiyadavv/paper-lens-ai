import { ExtractedSection } from '../types';

interface SectionDefinition {
  canonicalName: string;
  patterns: RegExp[];
  priority: number;
}

const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    canonicalName: 'Abstract',
    patterns: [
      /^(\s*(?:[I|1]\.?\s*)?abstract[:\s]*)/im,
      /\n\s*(?:(?:[I|1]\.?\s*)?abstract[:\s]*)/im
    ],
    priority: 1
  },
  {
    canonicalName: 'Keywords',
    patterns: [
      /(?:keywords|index terms|key words)[:\s—–-]/im
    ],
    priority: 2
  },
  {
    canonicalName: 'Introduction',
    patterns: [
      /(?:\n|^)\s*(?:(?:1|I)\.?\s+)?introduction(?:\s*[:\n]|\s*$)/im,
      /(?:\n|^)\s*(?:(?:1|I)\.?\s+)?background and introduction(?:\s*[:\n]|\s*$)/im
    ],
    priority: 3
  },
  {
    canonicalName: 'Related Work',
    patterns: [
      /(?:\n|^)\s*(?:(?:\d+|[IVX]+)\.?\s+)?(?:related works?|literature review|state of the art|prior work)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 4
  },
  {
    canonicalName: 'Methodology',
    patterns: [
      /(?:\n|^)\s*(?:(?:\d+|[IVX]+)\.?\s+)?(?:methodology|materials and methods|methods|proposed methodology|proposed framework|proposed system|system architecture|experimental design|experimental setup)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 5
  },
  {
    canonicalName: 'Results',
    patterns: [
      /(?:\n|^)\s*(?:(?:\d+|[IVX]+)\.?\s+)?(?:results and discussion|experimental results|results and analysis|empirical evaluation|results)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 6
  },
  {
    canonicalName: 'Discussion',
    patterns: [
      /(?:\n|^)\s*(?:(?:\d+|[IVX]+)\.?\s+)?(?:discussion|comparative analysis|limitations and discussion)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 7
  },
  {
    canonicalName: 'Conclusion',
    patterns: [
      /(?:\n|^)\s*(?:(?:\d+|[IVX]+)\.?\s+)?(?:conclusions?|conclusion and future work|concluding remarks|summary and conclusion)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 8
  },
  {
    canonicalName: 'Acknowledgements',
    patterns: [
      /(?:\n|^)\s*(?:acknowledgements?|acknowledgments?)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 9
  },
  {
    canonicalName: 'References',
    patterns: [
      /(?:\n|^)\s*(?:references|bibliography|works cited|literature cited)(?:\s*[:\n]|\s*$)/im
    ],
    priority: 10
  }
];

export interface DetectedHeadingLocation {
  canonicalName: string;
  matchedText: string;
  index: number;
}

export function detectSections(fullText: string): Record<string, ExtractedSection> {
  const headings: DetectedHeadingLocation[] = [];

  // Search for candidate section headers
  for (const def of SECTION_DEFINITIONS) {
    for (const pattern of def.patterns) {
      const match = pattern.exec(fullText);
      if (match && match.index !== undefined) {
        headings.push({
          canonicalName: def.canonicalName,
          matchedText: match[0].trim(),
          index: match.index
        });
        break; // matched best pattern for this definition
      }
    }
  }

  // Sort matched headings by text offset
  headings.sort((a, b) => a.index - b.index);

  const sections: Record<string, ExtractedSection> = {};

  // Extract Title (text before Abstract or Introduction)
  let titleContent = '';
  if (headings.length > 0) {
    const firstHeader = headings[0];
    const preText = fullText.slice(0, firstHeader.index).trim();
    // Usually the title is the first 1-3 lines before authors
    const lines = preText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      // Pick first non-empty line or join first 2 lines if short
      titleContent = lines[0];
      if (lines.length > 1 && titleContent.length < 50 && !/^(by|author|abstract)/i.test(lines[1])) {
        titleContent += ' ' + lines[1];
      }
    }
  }

  sections['Title'] = {
    name: 'Title',
    detectedHeading: 'Document Header',
    content: titleContent,
    wordCount: titleContent ? titleContent.split(/\s+/).length : 0,
    confidence: titleContent ? 'detected' : 'inferred'
  };

  // Slice content for each detected section
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    const next = headings[i + 1];

    const startIndex = current.index + current.matchedText.length;
    const endIndex = next ? next.index : fullText.length;

    let content = fullText.slice(startIndex, endIndex).trim();
    
    // Remove leading punctuation/colon
    content = content.replace(/^[:\s—–-]+/, '').trim();

    sections[current.canonicalName] = {
      name: current.canonicalName,
      detectedHeading: current.matchedText,
      content,
      wordCount: content ? content.split(/\s+/).filter(Boolean).length : 0,
      confidence: 'detected'
    };
  }

  // Check for expected canonical sections that were missing
  const allCanonical = [
    'Abstract',
    'Keywords',
    'Introduction',
    'Related Work',
    'Methodology',
    'Results',
    'Discussion',
    'Conclusion',
    'References'
  ];

  for (const name of allCanonical) {
    if (!sections[name]) {
      // If "Results and Discussion" was captured together under Results or Discussion
      if (name === 'Discussion' && sections['Results'] && /results and discussion/i.test(sections['Results'].detectedHeading)) {
        sections['Discussion'] = {
          name: 'Discussion',
          detectedHeading: 'Combined (Results and Discussion)',
          content: '(Combined with Results section)',
          wordCount: 0,
          confidence: 'inferred'
        };
      } else {
        sections[name] = {
          name,
          detectedHeading: 'None',
          content: '',
          wordCount: 0,
          confidence: 'missing'
        };
      }
    }
  }

  return sections;
}
