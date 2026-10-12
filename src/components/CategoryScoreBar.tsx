import React from 'react';
import { CategoryAssessment } from '../types';
import { ShieldCheck, HelpCircle } from 'lucide-react';

interface CategoryScoreBarProps {
  categories: CategoryAssessment[];
}

export const CategoryScoreBar: React.FC<CategoryScoreBarProps> = ({ categories }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Rubric Category Breakdown</h3>
          <p className="text-xs text-slate-500">
            Performance distributed across 8 explicit academic evaluation dimensions
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">100 Pts Total</span>
      </div>

      <div className="space-y-3.5">
        {categories.map(cat => {
          const pct = cat.maxScore > 0 ? Math.round((cat.earnedScore / cat.maxScore) * 100) : 0;
          let barColor = 'bg-indigo-600';
          if (pct < 50) barColor = 'bg-rose-500';
          else if (pct < 75) barColor = 'bg-amber-500';
          else barColor = 'bg-emerald-600';

          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{cat.category}</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {cat.assessmentType.replace('_', ' ').toUpperCase()}
                  </span>
                  {cat.humanVerificationRecommended && (
                    <span 
                      className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5"
                      title="Qualitative check: author peer review recommended."
                    >
                      <HelpCircle className="w-2.5 h-2.5" /> Human check
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-slate-900">{cat.earnedScore.toFixed(1)}</span>
                  <span className="text-slate-400">/ {cat.maxScore} pts</span>
                  <span className="text-slate-500 text-[11px]">({pct}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                {cat.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
