import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  ArrowRight, 
  Clock, 
  Trash2, 
  FileCheck2, 
  Sparkles, 
  BookOpen, 
  BarChart3,
  Layers
} from 'lucide-react';
import { AnalysisRecord, SystemSettingsStatus } from '../types';
import { fetchAnalyses, deleteAnalysis } from '../services/api';
import { NavigationPage } from '../components/Sidebar';

interface OverviewPageProps {
  systemStatus: SystemSettingsStatus | null;
  onNavigate: (page: NavigationPage) => void;
  onSelectAnalysis: (id: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  systemStatus,
  onNavigate,
  onSelectAnalysis
}) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAnalyses();
      setAnalyses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analyses history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved assessment report?')) return;
    try {
      await deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  // Derive genuine stats from loaded records
  const completedAnalyses = analyses.filter(a => a.status === 'completed');
  const totalCount = completedAnalyses.length;
  const avgScore = totalCount > 0
    ? Math.round(completedAnalyses.reduce((acc, c) => acc + c.overallScore, 0) / totalCount)
    : 0;

  // Unresolved action items
  let totalUnresolved = 0;
  const categoryTally: Record<string, number> = {};
  completedAnalyses.forEach(a => {
    a.actionItems.forEach(item => {
      if (!item.completed) totalUnresolved++;
    });
    a.findings.forEach(f => {
      categoryTally[f.category] = (categoryTally[f.category] || 0) + 1;
    });
  });

  let topCategory = 'None yet';
  let maxCatCount = 0;
  for (const [cat, cnt] of Object.entries(categoryTally)) {
    if (cnt > maxCatCount) {
      maxCatCount = cnt;
      topCategory = cat;
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Area */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-medium">
            <span>B.Tech CSE Major Project — 40 Marks</span>
            <span aria-hidden="true">·</span>
            <span>Woxsen University</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Research smarter. Submit with confidence.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            PaperLens AI provides transparent pre-submission quality assessment for academic manuscripts.
            Audit section completeness, verify citation-to-reference consistency, and inspect evidence-linked recommendations across a 100-point rubric.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Analyze a Paper</span>
            </button>
            <button
              onClick={() => onNavigate('methodology')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Methodology & Rubric</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards from Database */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Manuscripts Analyzed</span>
          <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
          <span className="text-[11px] text-slate-400">Recorded in database</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Average Rubric Score</span>
          <div className="text-2xl font-bold text-indigo-600">
            {totalCount > 0 ? `${avgScore} / 100` : '—'}
          </div>
          <span className="text-[11px] text-slate-400">100-pt project rubric</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Most Frequent Issue Area</span>
          <div className="text-sm font-semibold text-slate-800 truncate" title={topCategory}>
            {topCategory}
          </div>
          <span className="text-[11px] text-slate-400">Derived from detected findings</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Unresolved Recommendations</span>
          <div className="text-2xl font-bold text-amber-600">{totalUnresolved}</div>
          <span className="text-[11px] text-slate-400">Pending author review</span>
        </div>
      </div>

      {/* 2-Column Section: Recent Analyses & Quick-Start Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Manuscript Assessments</h2>
              <p className="text-xs text-slate-500">Saved reports stored in persistent application database</p>
            </div>
            {analyses.length > 0 && (
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <span>View all ({analyses.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading analysis records...</div>
          ) : analyses.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-medium text-slate-700">No manuscript analyses found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Begin by analyzing a research paper or load the synthetic demo manuscript to test the evaluation pipeline.
              </p>
              <button
                onClick={() => onNavigate('new-analysis')}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {analyses.slice(0, 5).map(record => (
                <div
                  key={record.id}
                  onClick={() => {
                    onSelectAnalysis(record.id);
                    onNavigate('results');
                  }}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {record.documentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        [{record.fileType}]
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span>{record.wordCount.toLocaleString()} words</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600 font-medium">{record.targetStyle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        {record.overallScore}/100
                      </div>
                      <div className="text-[10px] text-slate-500">{record.scoreStatusLabel}</div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, record.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded"
                      title="Delete saved report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick-Start Panel (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">How PaperLens AI Works</h2>
            <p className="text-xs text-slate-500">5-step pre-submission review workflow</p>
          </div>

          <ol className="space-y-3.5 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                1
              </span>
              <div>
                <strong className="text-slate-900 block font-medium">Upload Manuscript</strong>
                <span>Submit standard PDF or DOCX research paper. Scanned documents are checked for OCR need.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                2
              </span>
              <div>
                <strong className="text-slate-900 block font-medium">Select Publication Style</strong>
                <span>Choose target format (IMRaD, IEEE, ACM) to calibrate structural requirements.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                3
              </span>
              <div>
                <strong className="text-slate-900 block font-medium">Automated Multi-Layer Audit</strong>
                <span>Deterministic citation parsing, Flesch readability metrics, and macro-structural detection.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                4
              </span>
              <div>
                <strong className="text-slate-900 block font-medium">Review Evidence Findings</strong>
                <span>Every issue references verbatim document excerpts, severity, and actionable advice.</span>
              </div>
            </li>

            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                5
              </span>
              <div>
                <strong className="text-slate-900 block font-medium">Export Official PDF Report</strong>
                <span>Download comprehensive evaluation summaries for co-authors or viva submission.</span>
              </div>
            </li>
          </ol>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors text-center"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
