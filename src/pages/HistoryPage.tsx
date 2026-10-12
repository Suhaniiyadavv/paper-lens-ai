import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  ArrowUpDown, 
  Trash2, 
  FileText, 
  ArrowRight,
  Download,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { AnalysisRecord } from '../types';
import { fetchAnalyses, deleteAnalysis, clearAllAnalyses } from '../services/api';
import { NavigationPage } from '../components/Sidebar';

interface HistoryPageProps {
  onSelectAnalysis: (id: string) => void;
  onNavigate: (page: NavigationPage) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectAnalysis, onNavigate }) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAnalyses();
      setAnalyses(data);
    } catch (err: any) {
      alert('Failed to load history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete analysis "${id}"?`)) return;
    try {
      await deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Failed to delete analysis: ' + err.message);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear ALL saved analysis records from the database? This action is irreversible.')) return;
    try {
      await clearAllAnalyses();
      setAnalyses([]);
    } catch (err: any) {
      alert('Failed to clear records: ' + err.message);
    }
  };

  // Search and Sort
  const filteredAnalyses = analyses
    .filter(a => a.documentName.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'score_desc') return b.overallScore - a.overallScore;
      if (sortBy === 'score_asc') return a.overallScore - b.overallScore;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and inspect previously evaluated research manuscripts saved in persistent storage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {analyses.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by manuscript title or ID..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-slate-500 shrink-0 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* History List Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading history records...</div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No matching analyses found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search keywords.' : 'Run your first manuscript assessment to see historical records here.'}
            </p>
            <button
              onClick={() => onNavigate('new-analysis')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Analyze a Paper
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Document & ID</th>
                  <th className="py-3 px-4">Analyzed Date</th>
                  <th className="py-3 px-4">Rubric Score</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4">Findings</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnalyses.map(record => (
                  <tr
                    key={record.id}
                    onClick={() => {
                      onSelectAnalysis(record.id);
                      onNavigate('results');
                    }}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 max-w-sm truncate">
                        {record.documentName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {record.id} · {record.targetStyle}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      {record.overallScore}/100
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {record.scoreStatusLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {record.findings.length} findings
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectAnalysis(record.id);
                            onNavigate('results');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                        >
                          View Report
                        </button>

                        <a
                          href={`/api/analyses/${record.id}/export/pdf`}
                          download
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          title="Download PDF Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={(e) => handleDelete(e, record.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
