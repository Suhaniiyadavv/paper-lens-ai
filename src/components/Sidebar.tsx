import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  History, 
  BookOpenCheck, 
  FlaskConical, 
  GraduationCap 
} from 'lucide-react';

export type NavigationPage = 'overview' | 'new-analysis' | 'results' | 'history' | 'methodology' | 'evaluation' | 'about';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  selectedAnalysisId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate,
  selectedAnalysisId 
}) => {
  const navItems = [
    { id: 'overview' as NavigationPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'new-analysis' as NavigationPage, label: 'New Analysis', icon: FilePlus2 },
    { id: 'history' as NavigationPage, label: 'Analysis History', icon: History },
    { id: 'methodology' as NavigationPage, label: 'Methodology & Rubric', icon: BookOpenCheck },
    { id: 'evaluation' as NavigationPage, label: 'Evaluation Lab', icon: FlaskConical },
    { id: 'about' as NavigationPage, label: 'About the Project', icon: GraduationCap }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Platform Modules
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600/90 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Analysis Shortcut */}
        {selectedAnalysisId && (
          <div className="pt-4 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Active Assessment
            </div>
            <button
              onClick={() => onNavigate('results')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                currentPage === 'results'
                  ? 'bg-indigo-600/90 text-white font-semibold'
                  : 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="truncate">Report: {selectedAnalysisId}</span>
              <span className="text-[10px] text-indigo-300">View</span>
            </button>
          </div>
        )}
      </div>

      {/* Academic Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="text-slate-300 font-medium">B.Tech CSE Major Project</div>
        <div className="text-[11px] text-slate-400">Course: Research Writing & IP</div>
        <div className="text-[11px] text-slate-400">Woxsen University · 2026–2027</div>
      </div>
    </aside>
  );
};
