import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  BarChart2, 
  Download, 
  CheckCircle2, 
  Percent, 
  Layers, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { EvaluationBenchmarkResult } from '../types';
import { fetchEvaluationBenchmark } from '../services/api';

export const EvaluationPage: React.FC = () => {
  const [benchmark, setBenchmark] = useState<EvaluationBenchmarkResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluationBenchmark()
      .then(data => setBenchmark(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportEvaluationJson = () => {
    if (!benchmark) return;
    const blob = new Blob([JSON.stringify(benchmark, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PaperLens_Experimental_Evaluation_Results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium mb-1">
            <span>B.Tech Project Evaluation Lab</span>
            <span aria-hidden="true">·</span>
            <span>40 Marks Major Project Artifact</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Experimental Evaluation & Verification Framework
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validation of issue-detection accuracy (Precision, Recall, F1) and rubric prediction error (MAE) against annotated ground truth manuscripts.
          </p>
        </div>

        <button
          onClick={handleExportEvaluationJson}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Benchmark Data (.json)</span>
        </button>
      </div>

      {loading || !benchmark ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading experimental benchmark results...</div>
      ) : (
        <>
          {/* Aggregate Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Precision (TP / [TP + FP])</span>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {(benchmark.aggregatePrecision * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-slate-400">Correctly detected issues</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Recall (TP / [TP + FN])</span>
              <div className="text-2xl font-bold text-indigo-600 font-mono">
                {(benchmark.aggregateRecall * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] text-slate-400">Coverage of true ground truth flaws</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Harmonic F1 Score</span>
              <div className="text-2xl font-bold text-emerald-600 font-mono">
                {benchmark.aggregateF1Score.toFixed(3)}
              </div>
              <span className="text-[11px] text-slate-400">Balanced accuracy across 5 datasets</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Mean Absolute Error (MAE)</span>
              <div className="text-2xl font-bold text-amber-600 font-mono">
                {benchmark.meanAbsoluteError.toFixed(1)} pts
              </div>
              <span className="text-[11px] text-slate-400">Diff vs human rubric rating (0-100)</span>
            </div>
          </div>

          {/* Module-Wise Accuracy Comparison */}
          <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Ablation Comparison Across Assessment Modules
              </h2>
              <p className="text-xs text-slate-500">
                Performance breakdown comparing deterministic rule checks, statistical heuristics, and qualitative AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Deterministic Rules</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    F1: {benchmark.ruleBasedF1.toFixed(3)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Evaluates citation cross-referencing and canonical section presence. High precision due to strict regex and parser rules with near-zero false positives.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Heuristic Engine</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    F1: {benchmark.heuristicF1.toFixed(3)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Calculates Flesch readability, sentence lengths, and cliché phrase detection. Robust on standard manuscripts, with occasional edge cases in highly dense formulas.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">AI Qualitative Review</span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    F1: {benchmark.aiAssistedF1.toFixed(3)}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Identifies narrative gaps, objective-method alignment, and synthesis depth. Constrained by strict evidence quoting to avoid hallucinated findings.
                </p>
              </div>
            </div>
          </section>

          {/* Benchmark Corpus Inventory Table */}
          <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Annotated Benchmark Corpus Inventory</h2>
                <p className="text-xs text-slate-500">
                  {benchmark.samples.length} ground-truth annotated academic manuscripts evaluated in the study
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {benchmark.totalGroundTruthIssues} Annotated Flaws
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Dataset ID</th>
                    <th className="py-3 px-4">Manuscript Title & Domain</th>
                    <th className="py-3 px-4">Ground Truth Flaws</th>
                    <th className="py-3 px-4">TP / FP / FN</th>
                    <th className="py-3 px-4">Precision</th>
                    <th className="py-3 px-4">Recall</th>
                    <th className="py-3 px-4">F1 Score</th>
                    <th className="py-3 px-4">Human vs Pred.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {benchmark.samples.map(sample => (
                    <tr key={sample.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {sample.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 max-w-xs">{sample.title}</div>
                        <div className="text-[11px] text-slate-400">{sample.category}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {sample.groundTruthIssuesCount} issues
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {sample.truePositives} / {sample.falsePositives} / {sample.falseNegatives}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {(sample.precision * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {(sample.recall * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        {sample.f1Score.toFixed(3)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {sample.humanRatingScore} vs {sample.predictedScore} (Δ {sample.absoluteError})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mathematical Definitions Card */}
          <section className="bg-slate-900 rounded-xl p-5 text-white space-y-3">
            <h3 className="text-sm font-semibold text-indigo-400">Formal Mathematical Formulas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 font-mono">
              <div className="p-3 bg-slate-800 rounded-lg">
                Precision = TP / (TP + FP)
                <br />
                Recall = TP / (TP + FN)
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                F1 Score = 2 × (Precision × Recall) / (Precision + Recall)
                <br />
                MAE = (1 / N) × Σ | HumanRating_i - PredictedScore_i |
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              *Evaluations conducted in Semester VII under the Research Writing, Intellectual Property and Scholarly Publishing course framework at Woxsen University.
            </p>
          </section>
        </>
      )}
    </div>
  );
};
