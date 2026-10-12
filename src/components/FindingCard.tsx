import React, { useState } from 'react';
import { Finding } from '../types';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square,
  Compass,
  FileSearch
} from 'lucide-react';

interface FindingCardProps {
  finding: Finding;
  onToggleResolved?: (findingId: string, resolved: boolean) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding, onToggleResolved }) => {
  const [expanded, setExpanded] = useState(false);
  const isResolved = !!finding.resolved;

  const severityConfigs = {
    high: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
      border: 'border-l-rose-500',
      label: 'High Priority'
    },
    medium: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertCircle,
      border: 'border-l-amber-500',
      label: 'Medium Priority'
    },
    low: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info,
      border: 'border-l-blue-500',
      label: 'Low Priority'
    }
  };

  const config = severityConfigs[finding.severity] || severityConfigs.medium;
  const Icon = config.icon;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleResolved) {
      onToggleResolved(finding.id, !isResolved);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden transition-all border-l-4 ${config.border} ${isResolved ? 'opacity-70 bg-slate-50/50' : ''}`}>
      {/* Card Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer hover:bg-slate-50/60 transition-colors flex items-start justify-between gap-3"
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-semibold text-slate-500">
              {finding.id}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${config.badge}`}>
              {config.label}
            </span>
            <span className="text-[11px] text-slate-500">
              {finding.category}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-600 flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              {finding.location}
            </span>
          </div>

          <h4 className={`text-sm font-semibold text-slate-900 ${isResolved ? 'line-through text-slate-500' : ''}`}>
            {finding.title}
          </h4>
        </div>

        {/* Action Toggle & Expand Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              isResolved 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Track revision progress"
          >
            {isResolved ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium">Addressed</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-medium">Mark Addressed</span>
              </>
            )}
          </button>

          <button 
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={expanded ? 'Collapse finding details' : 'Expand finding details'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40 space-y-3 text-xs">
          {/* Evidence Excerpt */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <FileSearch className="w-3.5 h-3.5 text-indigo-500" />
              <span>Extracted Evidence Excerpt:</span>
            </div>
            <div className="p-2.5 bg-white rounded-md border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed overflow-x-auto">
              {finding.evidence}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1">
            <span className="font-medium text-slate-700">Why this matters for peer review:</span>
            <p className="text-slate-600 leading-relaxed">
              {finding.explanation}
            </p>
          </div>

          {/* Recommended Revision Action */}
          <div className="p-3 bg-indigo-50/60 rounded-md border border-indigo-100 space-y-1">
            <span className="font-semibold text-indigo-950">Recommended Revision Action:</span>
            <p className="text-indigo-900 leading-relaxed">
              {finding.recommendation}
            </p>
          </div>

          {/* Methodology Meta Footer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              Assessment method: <strong className="text-slate-700 uppercase">{finding.assessmentType.replace('_', ' ')}</strong>
            </span>
            <span>
              {finding.isObjectivelyVerifiable 
                ? 'Deterministic verifiable rule' 
                : 'Heuristic / qualitative observation (human verification suggested)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
