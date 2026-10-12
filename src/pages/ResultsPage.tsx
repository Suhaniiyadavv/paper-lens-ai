import React, { useState } from 'react';
import { 
  Download, 
  FileDown, 
  RotateCcw, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  FileText,
  BookmarkCheck,
  Table,
  Cpu
} from 'lucide-react';
import { AnalysisRecord, Severity, AssessmentType } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { CategoryScoreBar } from '../components/CategoryScoreBar';
import { FindingCard } from '../components/FindingCard';
import { CitationAuditTable } from '../components/CitationAuditTable';
import { updateActionItem } from '../services/api';

interface ResultsPageProps {
  analysis: AnalysisRecord;
  onRerun: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ analysis, onRerun }) => {
  const [record, setRecord] = useState<AnalysisRecord>(analysis);
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | AssessmentType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnaddressed, setShowOnlyUnaddressed] = useState<boolean>(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setRecord(analysis);
  }, [analysis]);

  // Handle action item toggle
  const handleToggleResolved = async (findingId: string, resolved: boolean) => {
    // Find matching action item
    const action = record.actionItems.find(a => a.findingId === findingId);
    if (!action) return;

    try {
      await updateActionItem(record.id, action.id, resolved);

      // Optimistic state update
      setRecord(prev => ({
        ...prev,
        actionItems: prev.actionItems.map(a => 
          a.id === action.id ? { ...a, completed: resolved } : a
        ),
        findings: prev.findings.map(f =>
          f.id === findingId ? { ...f, resolved } : f
        )
      }));
    } catch (err: any) {
      alert('Failed to update action item: ' + err.message);
    }
  };

  // Filter findings
  const filteredFindings = record.findings.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (methodFilter !== 'all' && f.assessmentType !== methodFilter) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (showOnlyUnaddressed && f.resolved) return false;
    return true;
  });

  // Unique categories in findings
  const uniqueCategories = Array.from(new Set(record.findings.map(f => f.category)));

  // Severity counts
  const highCount = record.findings.filter(f => f.severity === 'high').length;
  const mediumCount = record.findings.filter(f => f.severity === 'medium').length;
  const lowCount = record.findings.filter(f => f.severity === 'low').length;
  const addressedCount = record.findings.filter(f => f.resolved).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Report Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-indigo-600 font-semibold">{record.id}</span>
            <span aria-hidden="true">·</span>
            <span>Analyzed {new Date(record.createdAt).toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span className="uppercase font-mono text-[11px]">Format: {record.manuscriptType}</span>
            <span aria-hidden="true">·</span>
            <span>Rubric {record.rubricVersion}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {record.documentName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{record.wordCount.toLocaleString()} words</span>
            <span aria-hidden="true">·</span>
            <span>{record.pageCount} pages</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-700 font-medium">{record.researchDomain}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onRerun}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Re-run assessment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run</span>
          </button>

          <a
            href={`/api/analyses/${record.id}/export/pdf`}
            download
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </a>

          <a
            href={`/api/analyses/${record.id}/export/json`}
            download
            className="px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
            title="Download Raw JSON Evaluation Data"
          >
            <FileDown className="w-3.5 h-3.5" />
          </a>

          <a
            href={`/api/analyses/${record.id}/export/csv`}
            download
            className="px-2.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
            title="Export Findings as CSV Spreadsheet"
          >
            <Table className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Warnings Banner if any */}
      {record.extractionWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl space-y-1 text-xs">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Document Ingestion Warnings</span>
          </div>
          <ul className="list-disc list-inside text-amber-800 space-y-0.5 pl-1">
            {record.extractionWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary KPI & Gauge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreGauge
            score={record.overallScore}
            statusLabel={record.scoreStatusLabel}
            formula={record.normalizedCalculationFormula}
            aiStatus={record.aiAvailabilityStatus}
          />
        </div>

        {/* Priority Counts Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Priority Findings
            </h3>
            <span className="text-xs font-mono text-slate-500">{record.findings.length} Total</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/60">
              <span className="text-[10px] text-rose-700 font-semibold block uppercase">High</span>
              <span className="text-xl font-bold text-rose-700">{highCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60">
              <span className="text-[10px] text-amber-800 font-semibold block uppercase">Medium</span>
              <span className="text-xl font-bold text-amber-800">{mediumCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/60">
              <span className="text-[10px] text-blue-700 font-semibold block uppercase">Low</span>
              <span className="text-xl font-bold text-blue-700">{lowCount}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100">
            <span>Resolved Checklist Items:</span>
            <span className="font-bold text-emerald-600 font-mono">
              {addressedCount} / {record.findings.length}
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryScoreBar categories={record.categoryAssessments} />
        </div>

        {/* Strengths Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Evidence-Backed Strengths</h3>
          </div>

          {record.strengths.length === 0 ? (
            <p className="text-xs text-slate-500">
              No prominent structural strengths identified in this pass. Focus on addressing high-priority findings.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700">
              {record.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Citation Cross-Reference Audit Table */}
      <CitationAuditTable auditData={record.citationAudit} />

      {/* Findings Section with Multi-Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Detailed Findings & Recommendations</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredFindings.length} of {record.findings.length} evidence-backed observations
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Severity Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'high', 'medium', 'low'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    severityFilter === sev ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Assessment Type Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Methods</option>
              <option value="rule_based">Rule-Based</option>
              <option value="heuristic">Heuristic</option>
              <option value="ai_assisted">AI-Assisted</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 max-w-xs"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Unresolved toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={showOnlyUnaddressed}
                onChange={(e) => setShowOnlyUnaddressed(e.target.checked)}
                className="rounded text-indigo-600 w-3.5 h-3.5"
              />
              <span>Unaddressed Only</span>
            </label>
          </div>
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No findings match the current filter selection.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFindings.map(f => (
              <FindingCard
                key={f.id}
                finding={f}
                onToggleResolved={handleToggleResolved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actionable Revision Checklist */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Actionable Revision Plan</h3>
            <p className="text-xs text-slate-500">
              Track author edits before final journal or conference submission
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-indigo-600">
            {record.actionItems.filter(a => a.completed).length} / {record.actionItems.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {record.actionItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleToggleResolved(item.findingId, !item.completed)}
              className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors ${
                item.completed ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="rounded text-indigo-600 w-3.5 h-3.5"
                />
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] shrink-0 font-mono">
                <span className="text-slate-500">{item.location}</span>
                <span className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
                  item.priority === 'high' ? 'bg-rose-100 text-rose-700' : item.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations Disclaimer */}
      <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-600 text-xs space-y-1.5">
        <div className="font-semibold text-slate-800">Academic Decision-Support Disclaimer</div>
        <p className="leading-relaxed">
          PaperLens AI is an academic pre-submission assessment tool created for a B.Tech Computer Science Major Project (Woxsen University).
          Deterministic findings (such as citation-to-reference matching and missing canonical sections) reflect verifiable structural criteria.
          Qualitative indicators and rubric scores represent adherence to predefined project standards, and do not establish scientific truthfulness, guarantee peer-review acceptance, or replace professional editorial judgment.
        </p>
      </div>
    </div>
  );
};
