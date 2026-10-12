import React from 'react';

interface ScoreGaugeProps {
  score: number;
  statusLabel: string;
  formula: string;
  aiStatus: 'enabled' | 'offline_fallback' | 'disabled';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  statusLabel,
  formula,
  aiStatus
}) => {
  // Score color tiers
  let strokeColor = '#3b82f6';
  let badgeClass = 'text-blue-700 bg-blue-50 border-blue-200';

  if (score >= 85) {
    strokeColor = '#10b981'; // Emerald
    badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (score >= 70) {
    strokeColor = '#3b82f6'; // Blue
    badgeClass = 'text-blue-700 bg-blue-50 border-blue-200';
  } else if (score >= 50) {
    strokeColor = '#f59e0b'; // Amber
    badgeClass = 'text-amber-800 bg-amber-50 border-amber-200';
  } else {
    strokeColor = '#ef4444'; // Red
    badgeClass = 'text-red-700 bg-red-50 border-red-200';
  }

  // Circular gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      {/* Radial Meter */}
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{score}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">out of 100</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-center sm:text-left flex-1">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${badgeClass}`}>
            {statusLabel}
          </span>
          <span className="text-xs text-slate-500">
            {aiStatus === 'enabled' ? 'AI Qualitative Review Included' : 'Rule-Based + Heuristic Mode'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-mono">
          {formula}
        </p>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          The score reflects compliance with the 100-point academic rubric criteria. It is a decision-support indicator and does not predict journal acceptance or guarantee scientific correctness.
        </p>
      </div>
    </div>
  );
};
