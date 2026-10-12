import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse: any = require('pdf-parse');
import mammoth from 'mammoth';

export interface DocumentParseResult {
  text: string;
  pageCount: number;
  wordCount: number;
  warnings: string[];
  metadata: {
    author?: string;
    title?: string;
    creationDate?: string;
  };
  isScannedOrEmpty: boolean;
}

export async function parsePdfBuffer(buffer: Buffer): Promise<DocumentParseResult> {
  const warnings: string[] = [];
  try {
    const data = await pdfParse(buffer);
    const rawText = data.text || '';
    const cleanedText = cleanText(rawText);
    const pageCount = data.numpages || 1;
    const words = countWords(cleanedText);

    if (!cleanedText || cleanedText.trim().length < 50) {
      warnings.push('The document contains very little or no extractable text. It may be a scanned image or protected PDF requiring OCR.');
      return {
        text: cleanedText,
        pageCount,
        wordCount: words,
        warnings,
        metadata: {
          title: data.info?.Title || undefined,
          author: data.info?.Author || undefined,
          creationDate: data.info?.CreationDate || undefined
        },
        isScannedOrEmpty: true
      };
    }

    if (words < 300) {
      warnings.push('Document text is unusually brief for a complete academic manuscript (fewer than 300 words). Assessment may be limited.');
    }

    return {
      text: cleanedText,
      pageCount,
      wordCount: words,
      warnings,
      metadata: {
        title: data.info?.Title || undefined,
        author: data.info?.Author || undefined,
        creationDate: data.info?.CreationDate || undefined
      },
      isScannedOrEmpty: false
    };
  } catch (err: any) {
    throw new Error(`Failed to extract text from PDF: ${err.message || 'Corrupted or unreadable PDF file'}`);
  }
}

export async function parseDocxBuffer(buffer: Buffer): Promise<DocumentParseResult> {
  const warnings: string[] = [];
  try {
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value || '';
    const cleanedText = cleanText(rawText);
    const words = countWords(cleanedText);

    if (result.messages && result.messages.length > 0) {
      result.messages.forEach(msg => {
        if (msg.type === 'warning') warnings.push(`DOCX Parser: ${msg.message}`);
      });
    }

    if (!cleanedText || cleanedText.trim().length < 50) {
      warnings.push('DOCX document does not contain readable text.');
      return {
        text: cleanedText,
        pageCount: 1,
        wordCount: words,
        warnings,
        metadata: {},
        isScannedOrEmpty: true
      };
    }

    // Rough page count estimation for DOCX (approx 450 words per academic formatted page)
    const estimatedPages = Math.max(1, Math.ceil(words / 450));

    return {
      text: cleanedText,
      pageCount: estimatedPages,
      wordCount: words,
      warnings,
      metadata: {},
      isScannedOrEmpty: false
    };
  } catch (err: any) {
    throw new Error(`Failed to extract text from DOCX: ${err.message || 'Corrupted or invalid DOCX file'}`);
  }
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    // Fix hyphenated line breaks in academic text e.g. "experi-\nment" -> "experiment"
    .replace(/(\w+)-\n(\w+)/g, '$1$2')
    .trim();
}

export function countWords(text: string): number {
  if (!text) return 0;
  const tokens = text.trim().split(/\s+/);
  return tokens.filter(t => t.length > 0).length;
}
