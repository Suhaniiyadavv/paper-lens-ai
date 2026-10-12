import React from 'react';
import { FileText, Cpu, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { SystemSettingsStatus } from '../types';

interface NavbarProps {
  systemStatus: SystemSettingsStatus | null;
  onNavigateNew: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ systemStatus, onNavigateNew }) => {
  const isAiOnline = systemStatus?.aiService.configured;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-white tracking-tight">PaperLens AI</span>
                <span className="text-xs text-indigo-300 font-medium">B.Tech Major Project</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Improve your manuscript before submission
              </p>
            </div>
          </div>

          {/* Academic Context & Engine Status */}
          <div className="flex items-center gap-4">
            {/* Student & Institution Meta (unboxed, typographic) */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-medium text-slate-200">Suhani Yadav</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>Woxsen University</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-slate-400">Sem VII Major Project (40M)</span>
            </div>

            {/* AI Engine Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Engine:</span>
              {isAiOnline ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Gemini 3.8 Flash
                </span>
              ) : (
                <span className="text-amber-300 font-medium flex items-center gap-1" title="Deterministic and heuristic rules active. Qualitative LLM offline.">
                  <AlertCircle className="w-3 h-3" /> Heuristic / Offline
                </span>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onNavigateNew}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
