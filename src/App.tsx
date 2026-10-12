import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavigationPage } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { AboutPage } from './pages/AboutPage';
import { AnalysisRecord, SystemSettingsStatus } from './types';
import { fetchSettingsStatus, fetchAnalyses, fetchAnalysis } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [systemStatus, setSystemStatus] = useState<SystemSettingsStatus | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisRecord | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Load initial settings and default most recent analysis
  useEffect(() => {
    async function init() {
      try {
        const [status, list] = await Promise.all([
          fetchSettingsStatus().catch(() => null),
          fetchAnalyses().catch(() => [])
        ]);

        if (status) setSystemStatus(status);
        if (list && list.length > 0) {
          // Select the most recent analysis by default
          setActiveAnalysis(list[0]);
        }
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, []);

  const handleSelectAnalysis = async (id: string) => {
    try {
      const record = await fetchAnalysis(id);
      setActiveAnalysis(record);
      setCurrentPage('results');
    } catch (err: any) {
      alert('Failed to load analysis: ' + err.message);
    }
  };

  const handleAnalysisComplete = (record: AnalysisRecord) => {
    setActiveAnalysis(record);
    setCurrentPage('results');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        systemStatus={systemStatus}
        onNavigateNew={() => setCurrentPage('new-analysis')}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Collapsible/Persistent Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          selectedAnalysisId={activeAnalysis ? activeAnalysis.id : null}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loadingInitial ? (
            <div className="py-24 text-center text-xs text-slate-400">
              Initializing PaperLens AI engine...
            </div>
          ) : (
            <>
              {currentPage === 'overview' && (
                <OverviewPage
                  systemStatus={systemStatus}
                  onNavigate={setCurrentPage}
                  onSelectAnalysis={handleSelectAnalysis}
                />
              )}

              {currentPage === 'new-analysis' && (
                <NewAnalysisPage
                  onAnalysisComplete={handleAnalysisComplete}
                />
              )}

              {currentPage === 'results' && (
                activeAnalysis ? (
                  <ResultsPage
                    analysis={activeAnalysis}
                    onRerun={() => setCurrentPage('new-analysis')}
                  />
                ) : (
                  <div className="max-w-md mx-auto text-center py-20 space-y-4">
                    <div className="text-sm font-semibold text-slate-800">No active manuscript selected</div>
                    <p className="text-xs text-slate-500">
                      Upload a new manuscript or choose an assessment from your history to view its report.
                    </p>
                    <button
                      onClick={() => setCurrentPage('new-analysis')}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                    >
                      Start New Analysis
                    </button>
                  </div>
                )
              )}

              {currentPage === 'history' && (
                <HistoryPage
                  onSelectAnalysis={handleSelectAnalysis}
                  onNavigate={setCurrentPage}
                />
              )}

              {currentPage === 'methodology' && (
                <MethodologyPage />
              )}

              {currentPage === 'evaluation' && (
                <EvaluationPage />
              )}

              {currentPage === 'about' && (
                <AboutPage />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
