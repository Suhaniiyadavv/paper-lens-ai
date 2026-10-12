import React from 'react';
import { 
  GraduationCap, 
  Code, 
  BookOpen, 
  Award, 
  User, 
  Building2, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-3 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
          <span>Major Project — 40 Marks</span>
          <span aria-hidden="true">·</span>
          <span>Semester VII (2026–2027)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          AI-Assisted Research Paper Quality Assessment and Feedback System
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          Product Identity: <strong className="text-white font-semibold">PaperLens AI</strong>
          <br />
          Tagline: <em>"Improve your manuscript before submission."</em>
        </p>
      </div>

      {/* Student & Academic Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
          Academic Project Metadata
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">Student Investigator</span>
              <span className="text-slate-900 font-semibold text-sm">Suhani Yadav</span>
              <span className="text-slate-500 block text-[11px]">B.Tech Computer Science and Engineering</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">Institution</span>
              <span className="text-slate-900 font-semibold text-sm">Woxsen University</span>
              <span className="text-slate-500 block text-[11px]">School of Technology</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">Course Title</span>
              <span className="text-slate-900 font-semibold text-sm">Research Writing, IP and Scholarly Publishing</span>
              <span className="text-slate-500 block text-[11px]">Category: Major Project (40 Marks)</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/60">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block text-[11px]">Academic Calendar</span>
              <span className="text-slate-900 font-semibold text-sm">Academic Year 2026–2027</span>
              <span className="text-slate-500 block text-[11px]">Semester VII Evaluated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-5 Minute Viva Voce Walkthrough Guide */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-indigo-950 font-semibold text-sm">
          <PlayCircle className="w-5 h-5 text-indigo-600" />
          <span>Recommended 3 to 5-Minute Live Viva Voce Script</span>
        </div>

        <p className="text-xs text-indigo-900 leading-relaxed">
          Follow this structured sequence to demonstrate PaperLens AI to faculty examiners:
        </p>

        <ol className="space-y-2.5 text-xs text-indigo-950">
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 min-w-4">1.</span>
            <span><strong>Introduction & Problem Context (1 min):</strong> Explain that early-career researchers frequently receive desk rejections due to structural omissions, uncited references, and vague title/abstracts before scientific review even begins.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 min-w-4">2.</span>
            <span><strong>Live Demonstration (2 mins):</strong> Click <em>"New Analysis"</em> → click <em>"Load Demo Paper & Analyze"</em> to showcase real ingestion of a synthetic IoT agriculture manuscript containing intentional flaws.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 min-w-4">3.</span>
            <span><strong>Results Dashboard Inspection (1 min):</strong> Highlight the 100-point rubric breakdown, inspect the deterministic citation audit (showing unmatched <code className="bg-white px-1 py-0.5 rounded">[15]</code> and uncited <code className="bg-white px-1 py-0.5 rounded">[12]</code>), and show evidence quotes.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-indigo-600 min-w-4">4.</span>
            <span><strong>Action Checklist & PDF Export (1 min):</strong> Mark an item as addressed, download the generated PDF Assessment Report, and present the Evaluation Lab benchmark results (F1: 0.887, MAE: 2.0 pts).</span>
          </li>
        </ol>
      </div>

      {/* System Modules & Architecture */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
          Software Architecture & Technology Stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 rounded-lg border border-slate-200/70 space-y-1">
            <strong className="text-slate-900 block font-medium">Frontend Client</strong>
            <p className="text-slate-500">React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts data visualization, responsive dashboard architecture.</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200/70 space-y-1">
            <strong className="text-slate-900 block font-medium">Backend & REST API</strong>
            <p className="text-slate-500">Node.js Express / Python FastAPI architecture, Multer multipart file upload handling, memory streaming.</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200/70 space-y-1">
            <strong className="text-slate-900 block font-medium">Document Ingestion Pipeline</strong>
            <p className="text-slate-500">PDF text & page extraction (pdf-parse / PyMuPDF), Word extraction (mammoth / python-docx), regex section segmenter.</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200/70 space-y-1">
            <strong className="text-slate-900 block font-medium">Auditing & Scoring Engine</strong>
            <p className="text-slate-500">Deterministic citation cross-referencing, Flesch Reading Ease calculations, 100-point normalized rubric engine.</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200/70 space-y-1">
            <strong className="text-slate-900 block font-medium">Qualitative AI Integration</strong>
            <p className="text-slate-500">Google Gemini API via @google/genai TypeScript SDK (gemini-3.8-flash) with safe offline rule fallback.</p>
          </div>

          <div className="p-3 rounded-lg border border-slate-200/70 space-y-1">
            <strong className="text-slate-900 block font-medium">Reporting & Persistence</strong>
            <p className="text-slate-500">PDFKit vector PDF generation, JSON/CSV exports, file-backed persistent SQLite/JSON database.</p>
          </div>
        </div>
      </div>

      {/* Responsible AI Declaration */}
      <div className="bg-slate-900 rounded-xl p-6 text-white space-y-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-sm font-semibold">Responsible AI & Academic Integrity Declaration</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          PaperLens AI is engineered under academic principles of transparency and caution.
          The application enforces a strict separation between objective deterministic checks and qualitative judgments.
          Scoring measures structural adherence to the major project rubric and does not guarantee manuscript publication or peer-review outcomes.
          Authors retain full scientific responsibility for verifying and validating all research claims before formal journal submission.
        </p>
      </div>
    </div>
  );
};
