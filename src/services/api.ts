import { 
  AnalysisRecord, 
  SystemSettingsStatus, 
  ActionItem,
  EvaluationBenchmarkResult
} from '../types';

export async function fetchHealth(): Promise<any> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchSettingsStatus(): Promise<SystemSettingsStatus> {
  const res = await fetch('/api/settings/status');
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchAnalyses(): Promise<AnalysisRecord[]> {
  const res = await fetch('/api/analyses');
  if (!res.ok) throw new Error('Failed to fetch analyses list');
  return res.json();
}

export async function fetchAnalysis(id: string): Promise<AnalysisRecord> {
  const res = await fetch(`/api/analyses/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch analysis details');
  }
  return res.json();
}

export async function deleteAnalysis(id: string): Promise<void> {
  const res = await fetch(`/api/analyses/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete analysis');
  }
}

export async function clearAllAnalyses(): Promise<void> {
  const res = await fetch('/api/analyses', {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear analyses');
}

export async function updateActionItem(analysisId: string, actionId: string, completed: boolean): Promise<ActionItem> {
  const res = await fetch(`/api/analyses/${encodeURIComponent(analysisId)}/actions/${encodeURIComponent(actionId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!res.ok) throw new Error('Failed to update action item');
  return res.json();
}

export async function analyzeManuscript(formData: FormData): Promise<AnalysisRecord> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Analysis failed. Please check the uploaded file.');
  }
  return res.json();
}

export async function fetchMethodology(): Promise<any> {
  const res = await fetch('/api/methodology');
  if (!res.ok) throw new Error('Failed to fetch methodology data');
  return res.json();
}

export async function fetchEvaluationBenchmark(): Promise<EvaluationBenchmarkResult> {
  const res = await fetch('/api/evaluation/benchmark');
  if (!res.ok) throw new Error('Failed to fetch evaluation benchmark');
  return res.json();
}

export async function fetchDemoPaper(): Promise<{ title: string; content: string; notes: string }> {
  const res = await fetch('/api/demo-paper');
  if (!res.ok) throw new Error('Failed to fetch demo manuscript');
  return res.json();
}
