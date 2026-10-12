import fs from 'fs';
import path from 'path';
import { AnalysisRecord, ActionItem } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'analyses.json');

interface DatabaseSchema {
  version: string;
  analyses: Record<string, AnalysisRecord>;
  updatedAt: string;
}

class StorageEngine {
  private inMemoryCache: Record<string, AnalysisRecord> = {};
  private isInitialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        this.inMemoryCache = parsed.analyses || {};
      } else {
        const initialData: DatabaseSchema = {
          version: '1.0.0',
          analyses: {},
          updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
        this.inMemoryCache = {};
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('[StorageEngine] Error initializing storage:', err);
      this.inMemoryCache = {};
      this.isInitialized = true;
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data: DatabaseSchema = {
        version: '1.0.0',
        analyses: this.inMemoryCache,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[StorageEngine] Failed to persist data to disk:', err);
    }
  }

  public getAll(): AnalysisRecord[] {
    this.ensureInitialized();
    return Object.values(this.inMemoryCache).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): AnalysisRecord | null {
    this.ensureInitialized();
    return this.inMemoryCache[id] || null;
  }

  public save(record: AnalysisRecord): AnalysisRecord {
    this.ensureInitialized();
    this.inMemoryCache[record.id] = record;
    this.persist();
    return record;
  }

  public delete(id: string): boolean {
    this.ensureInitialized();
    if (this.inMemoryCache[id]) {
      delete this.inMemoryCache[id];
      this.persist();
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this.ensureInitialized();
    this.inMemoryCache = {};
    this.persist();
  }

  public updateActionItem(analysisId: string, actionId: string, completed: boolean): ActionItem | null {
    this.ensureInitialized();
    const record = this.inMemoryCache[analysisId];
    if (!record) return null;

    const action = record.actionItems.find(a => a.id === actionId);
    if (!action) return null;

    action.completed = completed;
    action.updatedAt = new Date().toISOString();

    // Also sync the finding's resolved flag
    const finding = record.findings.find(f => f.id === action.findingId);
    if (finding) {
      finding.resolved = completed;
    }

    this.persist();
    return action;
  }

  public getStats() {
    const all = this.getAll();
    const completed = all.filter(a => a.status === 'completed');
    const totalAnalyses = completed.length;
    const avgScore = totalAnalyses > 0 
      ? Math.round(completed.reduce((acc, curr) => acc + curr.overallScore, 0) / totalAnalyses) 
      : 0;

    // Most common issue category
    const categoryCounts: Record<string, number> = {};
    let totalUnresolved = 0;

    completed.forEach(a => {
      a.findings.forEach(f => {
        categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
      });
      a.actionItems.forEach(item => {
        if (!item.completed) totalUnresolved++;
      });
    });

    let topIssueCategory = 'None';
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topIssueCategory = cat;
      }
    }

    return {
      totalAnalyses,
      avgScore,
      topIssueCategory,
      totalUnresolvedRecommendations: totalUnresolved
    };
  }
}

export const storage = new StorageEngine();
