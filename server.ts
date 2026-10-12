import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { storage } from './server/storage';
import { executeManuscriptAnalysis } from './server/analysisPipeline';
import { generatePdfReport, exportFindingsCsv } from './server/reportGenerator';
import { DEMO_SYNTHETIC_MANUSCRIPT } from './server/demoData';
import { runBenchmarkEvaluation } from './server/evaluationService';

dotenv.config();

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer memory storage configuration (Max 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Only PDF and DOCX files are supported.`));
    }
  }
});

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'PaperLens AI',
    version: '1.0.0-academic',
    academicContext: {
      student: 'Suhani Yadav',
      programme: 'B.Tech CSE Semester VII',
      course: 'Research Writing, IP and Scholarly Publishing',
      university: 'Woxsen University'
    },
    timestamp: new Date().toISOString()
  });
});

// 2. Settings & Engine Status
app.get('/api/settings/status', (_req: Request, res: Response) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  const stats = storage.getStats();

  res.json({
    aiService: {
      provider: 'Google Gemini via @google/genai',
      model: 'gemini-3.8-flash',
      configured: hasGeminiKey,
      status: hasGeminiKey ? 'online' : 'offline_fallback',
      modeDescription: hasGeminiKey
        ? 'Gemini 3.8 Flash qualitative review is active.'
        : 'Running in offline rule-based and heuristic mode. Deterministic analysis is 100% active.'
    },
    storage: {
      type: 'Persistent File-Backed JSON Store',
      totalAnalyses: stats.totalAnalyses,
      avgScore: stats.avgScore,
      topIssueCategory: stats.topIssueCategory,
      totalUnresolvedRecommendations: stats.totalUnresolvedRecommendations
    },
    rubric: {
      version: '2026.1-Woxsen-MajorProject',
      maxPoints: 100,
      totalCategories: 8
    }
  });
});

// 3. Demo paper text endpoint
app.get('/api/demo-paper', (_req: Request, res: Response) => {
  res.json({
    title: 'A Novel IoT and Edge Computing Framework for Smart Agriculture Monitoring: Performance Analysis and Field Evaluation',
    content: DEMO_SYNTHETIC_MANUSCRIPT,
    fileType: 'demo',
    fileName: 'sample_iot_agriculture_manuscript.txt',
    notes: 'Synthetic academic manuscript specifically crafted for B.Tech CSE Viva presentation. Contains realistic deliberate defects: filler title prefix, abstract missing explicit method sentence, citation mismatches [15] and [12], duplicate reference [3], and uncited entries.'
  });
});

// 4. Run Analysis (File upload or Demo text)
app.post('/api/analyze', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const isDemo = req.body.isDemo === 'true' || req.body.isDemo === true;
    const authorTitleInput = req.body.title || '';
    const manuscriptType = req.body.manuscriptType || 'imrad';
    const targetStyle = req.body.targetStyle || 'IEEE / ACM Standard';
    const researchDomain = req.body.researchDomain || 'Computer Science & Engineering';

    let enabledCategories: string[] = [];
    if (req.body.enabledCategories) {
      try {
        enabledCategories = typeof req.body.enabledCategories === 'string'
          ? JSON.parse(req.body.enabledCategories)
          : req.body.enabledCategories;
      } catch {
        enabledCategories = [];
      }
    }

    if (isDemo) {
      const record = await executeManuscriptAnalysis({
        fileName: 'sample_iot_agriculture_manuscript.pdf',
        fileType: 'demo',
        fileSize: DEMO_SYNTHETIC_MANUSCRIPT.length,
        rawText: DEMO_SYNTHETIC_MANUSCRIPT,
        manuscriptType,
        targetStyle,
        researchDomain,
        authorTitleInput,
        enabledCategories
      });
      return res.status(200).json(record);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No manuscript file uploaded. Please provide a PDF or DOCX file.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '') as 'pdf' | 'docx';
    const record = await executeManuscriptAnalysis({
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      fileType: ext,
      fileSize: req.file.size,
      manuscriptType,
      targetStyle,
      researchDomain,
      authorTitleInput,
      enabledCategories
    });

    return res.status(200).json(record);
  } catch (err: any) {
    console.error('[API /api/analyze Error]:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected error occurred while analyzing the manuscript.'
    });
  }
});

// 5. List analyses
app.get('/api/analyses', (_req: Request, res: Response) => {
  const records = storage.getAll();
  res.json(records);
});

// 6. Get analysis by ID
app.get('/api/analyses/:id', (req: Request, res: Response) => {
  const record = storage.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: `Analysis record "${req.params.id}" not found.` });
  }
  return res.json(record);
});

// 7. Delete analysis by ID
app.delete('/api/analyses/:id', (req: Request, res: Response) => {
  const success = storage.delete(req.params.id);
  if (!success) {
    return res.status(404).json({ error: `Analysis record "${req.params.id}" not found.` });
  }
  return res.json({ success: true, message: `Record ${req.params.id} deleted successfully.` });
});

// 8. Clear all history
app.delete('/api/analyses', (_req: Request, res: Response) => {
  storage.clearAll();
  return res.json({ success: true, message: 'All analysis records cleared.' });
});

// 9. Update Action Item status
app.patch('/api/analyses/:id/actions/:actionId', (req: Request, res: Response) => {
  const { completed } = req.body;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: '"completed" boolean field is required.' });
  }
  const updatedAction = storage.updateActionItem(req.params.id, req.params.actionId, completed);
  if (!updatedAction) {
    return res.status(404).json({ error: 'Action item or analysis not found.' });
  }
  return res.json(updatedAction);
});

// 10. Export PDF report
app.get('/api/analyses/:id/export/pdf', async (req: Request, res: Response) => {
  const record = storage.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Analysis record not found.' });
  }
  try {
    const pdfBuffer = await generatePdfReport(record);
    const safeName = record.documentName.replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PaperLens_Assessment_${safeName}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[PDF Generation Error]:', err);
    return res.status(500).json({ error: 'Failed to generate PDF report.' });
  }
});

// 11. Export JSON
app.get('/api/analyses/:id/export/json', (req: Request, res: Response) => {
  const record = storage.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Analysis record not found.' });
  }
  const safeName = record.documentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="PaperLens_Assessment_${safeName}.json"`);
  return res.json(record);
});

// 12. Export CSV of findings
app.get('/api/analyses/:id/export/csv', (req: Request, res: Response) => {
  const record = storage.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Analysis record not found.' });
  }
  const csvContent = exportFindingsCsv(record);
  const safeName = record.documentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="PaperLens_Findings_${safeName}.csv"`);
  return res.send(csvContent);
});

// 13. Methodology definitions
app.get('/api/methodology', (_req: Request, res: Response) => {
  res.json({
    rubricVersion: '2026.1-Woxsen-MajorProject',
    rubricWeights: [
      { category: 'Structure and completeness', weight: 15, method: 'Rule-Based', description: 'Checks required canonical sections against chosen style.' },
      { category: 'Title, abstract, and keywords', weight: 15, method: 'Heuristic', description: 'Title conciseness, 5 core abstract components, keywords indexability.' },
      { category: 'Research problem and objectives', weight: 10, method: 'Heuristic / AI', description: 'Problem statement, research questions, claimed contributions.' },
      { category: 'Literature review and research gap', weight: 15, method: 'Heuristic / AI', description: 'Comparative synthesis of related work and explicit gap identification.' },
      { category: 'Methodology reporting', weight: 15, method: 'Heuristic / AI', description: 'Experimental design, dataset attributes, baseline models, reproducibility.' },
      { category: 'Results, discussion, and conclusion', weight: 15, method: 'Heuristic / AI', description: 'Quantitative findings, comparative baselines, limitations and future scope.' },
      { category: 'Citation and reference consistency', weight: 10, method: 'Deterministic Rule-Based', description: 'Cross-verifies all in-text citations against bibliography entries.' },
      { category: 'Writing clarity and organization', weight: 5, method: 'Heuristic', description: 'Flesch Reading Ease, sentence length distributions, passive voice usage.' }
    ],
    normalizationFormula: 'Normalized score = (Earned points in applicable categories / Maximum points in applicable categories) × 100',
    scoringTiers: [
      { range: '85 - 100', label: 'Strong rubric compliance', interpretation: 'Meets formal submission standards across all rubric categories.' },
      { range: '70 - 84', label: 'Promising with improvements', interpretation: 'Solid foundation; address minor citation or methodological reporting gaps.' },
      { range: '50 - 69', label: 'Needs revision', interpretation: 'Missing key sections or significant structural/referencing discrepancies.' },
      { range: '0 - 49', label: 'Needs substantial revision', interpretation: 'Critically incomplete; lacks core sections or research problem clarity.' }
    ],
    methodologicalDistinction: {
      ruleBased: 'Objective deterministic checks like missing sections, citation key mismatches, or empty bibliography entries.',
      heuristic: 'Empirical indicators like sentence length thresholds, readability formulas, or cliché phrasing.',
      aiAssisted: 'Contextual qualitative evaluation of research framing, synthesis depth, and scientific clarity.',
      humanReview: 'Indispensable human verification for domain correctness, theoretical soundness, and experimental validity.'
    }
  });
});

// 14. Academic Benchmark Evaluation Lab
app.get('/api/evaluation/benchmark', (_req: Request, res: Response) => {
  const result = runBenchmarkEvaluation();
  res.json(result);
});

// Error handling middleware for Multer and API
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Uploaded file exceeds the maximum 15MB limit.' });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'An error occurred processing the request.' });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// VITE / STATIC SERVING
// ==========================================
async function startServer() {
  // Seed demo analysis if database is empty so initial dashboard is clean yet instructive
  const existing = storage.getAll();
  if (existing.length === 0) {
    console.log('[Server] Seeding initial synthetic demonstration record for viva review...');
    try {
      await executeManuscriptAnalysis({
        fileName: 'sample_iot_agriculture_manuscript.pdf',
        fileType: 'demo',
        fileSize: DEMO_SYNTHETIC_MANUSCRIPT.length,
        rawText: DEMO_SYNTHETIC_MANUSCRIPT,
        manuscriptType: 'imrad',
        targetStyle: 'IEEE / ACM Standard',
        researchDomain: 'Computer Science & Engineering',
        authorTitleInput: 'A Novel IoT and Edge Computing Framework for Smart Agriculture Monitoring: Performance Analysis and Field Evaluation'
      });
    } catch (e) {
      console.error('[Server] Seeding error:', e);
    }
  }

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PaperLens AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server Fatal]:', err);
});
