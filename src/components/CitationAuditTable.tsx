import React, { useState } from 'react';
import { CitationReferenceMatch, ReferenceEntry } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Link2, ExternalLink } from 'lucide-react';

interface CitationAuditTableProps {
  auditData: {
    totalCitationsFound: number;
    totalReferencesInBibliography: number;
    uncitedReferencesCount: number;
    missingReferenceCitationsCount: number;
    duplicateReferencesCount: number;
    citationMatches: CitationReferenceMatch[];
    bibliographyEntries: ReferenceEntry[];
  };
}

export const CitationAuditTable: React.FC<CitationAuditTableProps> = ({ auditData }) => {
  const [activeTab, setActiveTab] = useState<'citations' | 'bibliography'>('citations');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Deterministic Citation Cross-Reference Audit</h3>
          <p className="text-xs text-slate-500">
            Rule-based verification matching in-text identifiers with bibliography entries
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('citations')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'citations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In-Text Citations ({auditData.citationMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('bibliography')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'bibliography' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bibliography Entries ({auditData.bibliographyEntries.length})
          </button>
        </div>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
          <span className="text-slate-500 block">Total Citations in Body</span>
          <span className="text-base font-bold text-slate-900">{auditData.totalCitationsFound}</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
          <span className="text-slate-500 block">Bibliography Entries</span>
          <span className="text-base font-bold text-slate-900">{auditData.totalReferencesInBibliography}</span>
        </div>
        <div className={`p-3 rounded-lg border ${auditData.missingReferenceCitationsCount > 0 ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200/60'}`}>
          <span className="text-slate-500 block">Missing Bib Entries</span>
          <span className={`text-base font-bold ${auditData.missingReferenceCitationsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {auditData.missingReferenceCitationsCount}
          </span>
        </div>
        <div className={`p-3 rounded-lg border ${auditData.uncitedReferencesCount > 0 ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200/60'}`}>
          <span className="text-slate-500 block">Uncited References</span>
          <span className={`text-base font-bold ${auditData.uncitedReferencesCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {auditData.uncitedReferencesCount}
          </span>
        </div>
      </div>

      {/* Citations Tab */}
      {activeTab === 'citations' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Citation Identifier</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Bibliography Match Status</th>
                <th className="py-2.5 px-3">Sample Context in Body</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditData.citationMatches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    No in-text citation identifiers detected in the manuscript body.
                  </td>
                </tr>
              ) : (
                auditData.citationMatches.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                      {m.citationKey}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {m.occurrencesCount}×
                    </td>
                    <td className="py-2.5 px-3">
                      {m.hasMatchingReference ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Matched Entry
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium text-[11px]">
                          <XCircle className="w-3 h-3" /> No Matching Reference
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {m.citationLocations[0] || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bibliography Tab */}
      {activeTab === 'bibliography' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Reference Entry</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Cited in Body?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditData.bibliographyEntries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    No bibliography entries parsed from the References section.
                  </td>
                </tr>
              ) : (
                auditData.bibliographyEntries.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {b.key || `[${b.index}]`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{b.raw}</p>
                      {b.hasDoi && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 mt-0.5">
                          <Link2 className="w-2.5 h-2.5" /> DOI: {b.doi}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {b.year || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      {b.isCitedInText ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Cited in Body
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> Uncited Reference
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
