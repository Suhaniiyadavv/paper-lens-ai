import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFDocument: any = require('pdfkit');
import { AnalysisRecord } from './types';

export function generatePdfReport(record: AnalysisRecord): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `PaperLens AI Assessment Report - ${record.documentName}`,
          Author: 'PaperLens AI (Suhani Yadav, Woxsen University)',
          Subject: 'Academic Manuscript Quality Evaluation'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: any) => reject(err));

      // Header Banner
      doc.rect(40, 40, 515, 65).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('PaperLens AI', 55, 52);
      doc.fontSize(10).font('Helvetica').text('Research Paper Quality Assessment & Feedback System', 55, 76);
      doc.fontSize(8).fillColor('#94a3b8').text('Major Project · Woxsen University · Academic Year 2026–2027', 55, 88);

      doc.moveDown(4);

      // Manuscript Metadata Box
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('1. MANUSCRIPT METADATA', 40, 120);
      doc.rect(40, 135, 515, 75).strokeColor('#cbd5e1').stroke();

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155');
      doc.text('Document Name:', 50, 145);
      doc.text('Target Style:', 50, 160);
      doc.text('Date Analyzed:', 50, 175);
      doc.text('Word & Page Count:', 50, 190);

      doc.font('Helvetica').fillColor('#0f172a');
      doc.text(record.documentName, 170, 145, { width: 370 });
      doc.text(record.targetStyle.toUpperCase(), 170, 160);
      doc.text(new Date(record.createdAt).toLocaleString(), 170, 175);
      doc.text(`${record.wordCount.toLocaleString()} words · ${record.pageCount} page(s)`, 170, 190);

      // Overall Assessment Score
      doc.moveDown(2);
      const scoreY = 225;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('2. OVERALL RUBRIC SCORE', 40, scoreY);
      
      doc.rect(40, scoreY + 15, 515, 60).fill('#f8fafc');
      doc.rect(40, scoreY + 15, 515, 60).strokeColor('#e2e8f0').stroke();

      doc.fontSize(28).font('Helvetica-Bold').fillColor('#1d4ed8').text(`${record.overallScore}/100`, 55, scoreY + 28);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text(record.scoreStatusLabel, 170, scoreY + 26);
      doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(record.normalizedCalculationFormula, 170, scoreY + 44);
      doc.text(`AI Qualitative Status: ${record.aiAvailabilityStatus.toUpperCase()} (${record.aiModelUsed || 'Rule-Based Engine'})`, 170, scoreY + 56);

      // Category Breakdown Table
      doc.moveDown(3);
      const tableY = 315;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('3. CATEGORY-WISE RUBRIC BREAKDOWN', 40, tableY);

      let currentY = tableY + 18;
      // Table Header
      doc.rect(40, currentY, 515, 18).fill('#e2e8f0');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#334155');
      doc.text('Category', 45, currentY + 5);
      doc.text('Score', 280, currentY + 5);
      doc.text('Max', 330, currentY + 5);
      doc.text('Weight', 370, currentY + 5);
      doc.text('Assessment Method', 430, currentY + 5);

      currentY += 18;

      record.categoryAssessments.forEach((cat, idx) => {
        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        doc.rect(40, currentY, 515, 16).fill(rowBg);
        doc.fontSize(8).font('Helvetica').fillColor('#1e293b');
        doc.text(cat.category, 45, currentY + 4, { width: 230 });
        doc.font('Helvetica-Bold').text(cat.earnedScore.toFixed(1), 280, currentY + 4);
        doc.font('Helvetica').text(cat.maxScore.toString(), 330, currentY + 4);
        doc.text(`${cat.weight}%`, 370, currentY + 4);
        doc.text(cat.assessmentType.replace('_', ' ').toUpperCase(), 430, currentY + 4);
        currentY += 16;
      });

      // Citation & Readability Audit Box
      doc.moveDown(2);
      const auditY = currentY + 15;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('4. CITATION & WRITING AUDIT SUMMARY', 40, auditY);

      doc.rect(40, auditY + 15, 515, 50).strokeColor('#cbd5e1').stroke();
      doc.fontSize(8).font('Helvetica').fillColor('#334155');
      doc.text(`Total In-Text Citations: ${record.citationAudit.totalCitationsFound}`, 50, auditY + 23);
      doc.text(`Bibliography References: ${record.citationAudit.totalReferencesInBibliography}`, 50, auditY + 35);
      doc.text(`Uncited References: ${record.citationAudit.uncitedReferencesCount}`, 50, auditY + 47);

      doc.text(`Flesch Reading Ease: ${record.readability.fleschReadingEase} (${record.readability.readingEaseDescription})`, 250, auditY + 23);
      doc.text(`Avg Sentence Length: ${record.readability.averageSentenceLength} words`, 250, auditY + 35);
      doc.text(`Sentences > 35 words: ${record.readability.longSentencesCount}`, 250, auditY + 47);

      // PAGE BREAK for Findings
      doc.addPage();

      doc.rect(40, 40, 515, 25).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('5. EVIDENCE-LINKED FINDINGS & RECOMMENDATIONS', 50, 48);

      let findY = 75;

      const priorityCounts = {
        high: record.findings.filter(f => f.severity === 'high').length,
        medium: record.findings.filter(f => f.severity === 'medium').length,
        low: record.findings.filter(f => f.severity === 'low').length
      };

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155');
      doc.text(`Total Findings: ${record.findings.length}  (High: ${priorityCounts.high} | Medium: ${priorityCounts.medium} | Low: ${priorityCounts.low})`, 40, findY);
      findY += 18;

      record.findings.forEach((f, idx) => {
        if (findY > 700) {
          doc.addPage();
          findY = 50;
        }

        const boxHeight = 70;
        const borderColor = f.severity === 'high' ? '#ef4444' : f.severity === 'medium' ? '#f59e0b' : '#3b82f6';

        doc.rect(40, findY, 515, boxHeight).strokeColor('#e2e8f0').stroke();
        doc.rect(40, findY, 4, boxHeight).fill(borderColor);

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a');
        doc.text(`[${f.id}] ${f.title}`, 50, findY + 6, { width: 380 });
        doc.fontSize(8).font('Helvetica-Bold').fillColor(borderColor);
        doc.text(f.severity.toUpperCase(), 480, findY + 6);

        doc.fontSize(8).font('Helvetica').fillColor('#475569');
        doc.text(`Location: ${f.location} · Category: ${f.category} · Method: ${f.assessmentType}`, 50, findY + 20);

        doc.fillColor('#334155').font('Helvetica-Oblique');
        doc.text(`Evidence: ${f.evidence.slice(0, 130)}`, 50, findY + 32, { width: 495 });

        doc.fillColor('#0f172a').font('Helvetica');
        doc.text(`Action: ${f.recommendation.slice(0, 140)}`, 50, findY + 48, { width: 495 });

        findY += boxHeight + 8;
      });

      // PAGE BREAK for Methodology, Action Items, & Academic Viva Disclaimer
      doc.addPage();

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('6. ACTIONABLE REVISION CHECKLIST', 40, 40);
      let actY = 60;
      record.actionItems.forEach(item => {
        const checkbox = item.completed ? '[X]' : '[ ]';
        doc.fontSize(8).font('Helvetica').fillColor(item.completed ? '#16a34a' : '#1e293b');
        doc.text(`${checkbox} [${item.priority.toUpperCase()}] ${item.title} (${item.location})`, 45, actY, { width: 500 });
        actY += 14;
      });

      actY += 15;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e293b').text('7. RESPONSIBLE AI & RESEARCH VALIDATION DISCLAIMER', 40, actY);
      actY += 18;

      doc.rect(40, actY, 515, 110).strokeColor('#cbd5e1').stroke();
      doc.fontSize(8).font('Helvetica').fillColor('#475569');
      const disclaimer = `This assessment was conducted by PaperLens AI (B.Tech CSE Major Project, Woxsen University).
PaperLens AI serves strictly as an academic decision-support tool to facilitate pre-submission manuscript quality auditing.
IMPORTANT LIMITATIONS:
1. Scoring represents rubric compliance with the project's explicit 100-point criteria, NOT peer review acceptance guarantees.
2. The system does not claim to evaluate deep domain mathematical correctness or experimental truthfulness.
3. Citation cross-matching checks structural consistency between in-text markers and bibliography items; it does not verify whether external sources support the scientific claim.
4. Authors must exercise scholarly judgment and verify all suggestions before submitting to indexed journals or conferences.
Student: Suhani Yadav · Programme: B.Tech CSE Semester VII · Academic Year: 2026–2027.`;

      doc.text(disclaimer, 50, actY + 10, { width: 495, lineGap: 3 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function exportFindingsCsv(record: AnalysisRecord): string {
  const headers = ['Finding ID', 'Severity', 'Category', 'Title', 'Location', 'Evidence', 'Explanation', 'Recommendation', 'Method', 'Resolved'];
  const rows = record.findings.map(f => [
    `"${f.id}"`,
    `"${f.severity}"`,
    `"${f.category.replace(/"/g, '""')}"`,
    `"${f.title.replace(/"/g, '""')}"`,
    `"${f.location.replace(/"/g, '""')}"`,
    `"${f.evidence.replace(/"/g, '""')}"`,
    `"${f.explanation.replace(/"/g, '""')}"`,
    `"${f.recommendation.replace(/"/g, '""')}"`,
    `"${f.assessmentType}"`,
    `"${f.resolved ? 'YES' : 'NO'}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
