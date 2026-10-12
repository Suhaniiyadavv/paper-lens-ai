import React from 'react';
import { 
  BookOpenCheck, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ShieldAlert,
  Calculator
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const rubricRows = [
    {
      category: 'Structure and completeness',
      weight: 15,
      type: 'Deterministic Rule-Based',
      criteria: 'Detects presence of required canonical sections according to selected format (IMRaD, IEEE, ACM). Flags missing methods, results, or bibliography.',
      affectedBy: 'Missing canonical headings, empty section bodies.'
    },
    {
      category: 'Title, abstract, and keywords',
      weight: 15,
      type: 'Heuristic & Rule-Based',
      criteria: 'Title word count heuristics (5-25 words), cliché prefixes ("A Study On", "Novel"), 5 essential abstract components (Problem, Objective, Method, Results, Conclusion), and 3-8 indexing keywords.',
      affectedBy: 'Filler title phrases, abstract missing quantitative results, duplicate or missing keywords.'
    },
    {
      category: 'Research problem and objectives',
      weight: 10,
      type: 'Heuristic & AI-Assisted',
      criteria: 'Explicit problem statement, clear research questions or hypotheses, and enumerated claimed contribution list in the Introduction.',
      affectedBy: 'Vague motivation, lack of explicit contribution summary, unstated research questions.'
    },
    {
      category: 'Literature review and research gap',
      weight: 15,
      type: 'Heuristic & AI-Assisted',
      criteria: 'Critical synthesis vs descriptive listing, explicit contrastive markers ("however", "in contrast", "unexplored"), and clear identification of the research gap.',
      affectedBy: 'Descriptive lists of prior work without critical gap framing, missing comparative discussion.'
    },
    {
      category: 'Methodology reporting',
      weight: 15,
      type: 'Heuristic & AI-Assisted',
      criteria: 'Experimental design, dataset attributes, baseline models, algorithmic formulation or equations, and explicit evaluation metric definitions.',
      affectedBy: 'Omitted dataset splits, lack of reproducibility details, undefined evaluation metrics.'
    },
    {
      category: 'Results, discussion, and conclusion',
      weight: 15,
      type: 'Heuristic & AI-Assisted',
      criteria: 'Empirical data presentation, comparative baselines, discussion of underlying mechanisms, limitations acknowledgement, and future work.',
      affectedBy: 'Pure repetition of numbers without discussion, missing benchmark comparisons, missing limitations.'
    },
    {
      category: 'Citation and reference consistency',
      weight: 10,
      type: 'Deterministic Rule-Based',
      criteria: 'Cross-verifies numeric citations [1] and author-year markers against bibliography entries. Identifies uncited references, missing bib entries, and duplicates.',
      affectedBy: 'Citations lacking matching reference, uncited bibliography entries, duplicate entries, malformed DOIs.'
    },
    {
      category: 'Writing clarity and organization',
      weight: 5,
      type: 'Heuristic',
      criteria: 'Flesch Reading Ease score, Flesch-Kincaid Grade Level, sentence length distributions (sentences > 35 words), and passive voice density.',
      affectedBy: 'Excessive average sentence length (> 28 words), multiple run-on sentences, heavy passive voice.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Methodology & 100-Point Assessment Rubric
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed specification of evaluation criteria, scoring normalization, and the separation between deterministic rules and AI-assisted analysis.
        </p>
      </div>

      {/* The 4 Assessment Layers Distinction */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Scale className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Methodological Hierarchy: Rules vs Heuristics vs AI vs Human Review
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-semibold text-slate-900 block">1. Deterministic Rule-Based Checks</span>
            <p className="text-slate-600 leading-relaxed">
              Objective, strictly verifiable conditions. For example: detecting whether an in-text citation <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[11px]">[15]</code> exists in the Bibliography, detecting duplicate reference entries, or flagging a missing References section. These produce binary facts without probabilistic guesswork.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-semibold text-slate-900 block">2. Empirical Heuristic Checks</span>
            <p className="text-slate-600 leading-relaxed">
              Statistical patterns derived from scholarly writing conventions. For example: calculating average sentence length, counting sentences exceeding 35 words, computing Flesch Reading Ease, and detecting cliché title prefixes. These estimate stylistic properties but are not rigid universal laws.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-semibold text-slate-900 block">3. AI-Assisted Qualitative Evaluation</span>
            <p className="text-slate-600 leading-relaxed">
              Evaluates contextual writing dimensions such as whether a literature review synthesizes prior work critically, or whether stated contributions match the methodology. Governed by strict evidence-linking to prevent hallucination, with an automatic offline fallback when no API key is provided.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="font-semibold text-slate-900 block">4. Irreplaceable Human Peer Review</span>
            <p className="text-slate-600 leading-relaxed">
              Domain experts remain indispensable for evaluating mathematical correctness, experimental reproducibility, theoretical novelty, and broader scientific significance. PaperLens AI is an author decision-support tool, not an automated journal editor.
            </p>
          </div>
        </div>
      </section>

      {/* 100-Point Rubric Table */}
      <section className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Default 100-Point Assessment Rubric</h2>
            <p className="text-xs text-slate-500">Distribution of weights across project categories (v2026.1)</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600">100 Pts Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rubric Category</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Methodology</th>
                <th className="py-3 px-4">Evaluation Criteria</th>
                <th className="py-3 px-4">Negative Deductions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rubricRows.map(row => (
                <tr key={row.category} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {row.category}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {row.weight} pts
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs">
                    {row.criteria}
                  </td>
                  <td className="py-3 px-4 text-slate-500 leading-relaxed max-w-xs">
                    {row.affectedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Score Calculation Formula & Normalization */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Calculator className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Score Calculation & Normalization Formula
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            When all 8 categories are evaluated, the overall score is the direct sum of points earned:
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800">
            Overall Score = Σ (Earned Points in Category i)  [out of 100 max]
          </div>

          <p>
            If a user deselects specific categories or if a section is marked Not Applicable (N/A) for a particular manuscript format, points are normalized transparently so unassessed categories do not penalize the paper:
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800">
            Normalized Score = ( Σ Earned Points in Applicable Categories / Σ Max Points in Applicable Categories ) × 100
          </div>

          <div className="pt-2">
            <h3 className="font-semibold text-slate-900 mb-1.5">Compliance Status Thresholds:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <li className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-900">
                <strong>85 – 100:</strong> Strong rubric compliance (High submission readiness)
              </li>
              <li className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-900">
                <strong>70 – 84:</strong> Promising with improvements (Minor citation/clarity revisions)
              </li>
              <li className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-900">
                <strong>50 – 69:</strong> Needs revision (Significant structural or reference gaps)
              </li>
              <li className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/60 text-rose-900">
                <strong>0 – 49:</strong> Needs substantial revision (Critical sections absent)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* System Limitations & Ethics */}
      <section className="bg-slate-900 rounded-xl p-5 text-white space-y-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <ShieldAlert className="w-4 h-4" />
          <h2 className="text-sm font-semibold">Important Scientific Limitations & AI Ethics</h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          1. <strong>No Plagiarism Certification:</strong> Citation cross-checks verify formatting and reference correspondence; they do not index external proprietary journal databases to detect uncredited copying.
          <br />
          2. <strong>No Fact Verification:</strong> The system does not verify whether external papers cited actually support the author’s claims.
          <br />
          3. <strong>Data Minimization:</strong> Uploaded manuscripts are processed server-side in memory or temporary files, and are never saved to public training corpora.
        </p>
      </section>
    </div>
  );
};
