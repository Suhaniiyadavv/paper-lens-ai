import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  FileText, 
  X, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { analyzeManuscript } from '../services/api';
import { AnalysisRecord } from '../types';

interface NewAnalysisPageProps {
  onAnalysisComplete: (record: AnalysisRecord) => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Metadata form
  const [title, setTitle] = useState('');
  const [researchDomain, setResearchDomain] = useState('Computer Science & Engineering');
  const [manuscriptType, setManuscriptType] = useState<'imrad' | 'ieee' | 'acm' | 'custom'>('imrad');
  const [targetStyle, setTargetStyle] = useState('IEEE / ACM Standard');

  // Assessment categories preferences (all selected by default)
  const [enabledCategories, setEnabledCategories] = useState<string[]>([
    'Structure and completeness',
    'Title, abstract, and keywords',
    'Research problem and objectives',
    'Literature review and research gap',
    'Methodology reporting',
    'Results, discussion, and conclusion',
    'Citation and reference consistency',
    'Writing clarity and organization'
  ]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableCategories = [
    { name: 'Structure and completeness', weight: '15%', type: 'Rule-Based' },
    { name: 'Title, abstract, and keywords', weight: '15%', type: 'Heuristic' },
    { name: 'Research problem and objectives', weight: '10%', type: 'Heuristic / AI' },
    { name: 'Literature review and research gap', weight: '15%', type: 'Heuristic / AI' },
    { name: 'Methodology reporting', weight: '15%', type: 'Heuristic / AI' },
    { name: 'Results, discussion, and conclusion', weight: '15%', type: 'Heuristic / AI' },
    { name: 'Citation and reference consistency', weight: '10%', type: 'Rule-Based' },
    { name: 'Writing clarity and organization', weight: '5%', type: 'Heuristic' }
  ];

  const handleFileSelection = (selectedFile: File) => {
    setValidationError(null);
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'docx'].includes(ext)) {
      setValidationError('Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setValidationError('File exceeds the 15 MB limit. Please compress or select a smaller manuscript file.');
      return;
    }

    if (selectedFile.size === 0) {
      setValidationError('The selected file is empty (0 bytes).');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const toggleCategory = (catName: string) => {
    if (enabledCategories.includes(catName)) {
      if (enabledCategories.length <= 1) return; // keep at least 1
      setEnabledCategories(prev => prev.filter(c => c !== catName));
    } else {
      setEnabledCategories(prev => [...prev, catName]);
    }
  };

  // Run Real Analysis
  const handleStartAnalysis = async (isDemo = false) => {
    if (!isDemo && !file) {
      setValidationError('Please select or drag a manuscript file to analyze.');
      return;
    }

    setIsProcessing(true);
    setValidationError(null);

    try {
      const formData = new FormData();
      if (isDemo) {
        formData.append('isDemo', 'true');
        formData.append('title', 'A Novel IoT and Edge Computing Framework for Smart Agriculture Monitoring: Performance Analysis and Field Evaluation');
      } else if (file) {
        formData.append('file', file);
        if (title.trim()) formData.append('title', title.trim());
      }

      formData.append('manuscriptType', manuscriptType);
      formData.append('targetStyle', targetStyle);
      formData.append('researchDomain', researchDomain);
      formData.append('enabledCategories', JSON.stringify(enabledCategories));

      // Sequential progress cues
      setProcessingStep('Extracting document text and pages...');
      await new Promise(r => setTimeout(r, 400));
      setProcessingStep('Segmenting manuscript sections & headers...');
      await new Promise(r => setTimeout(r, 400));
      setProcessingStep('Parsing citations and cross-checking references...');

      const record = await analyzeManuscript(formData);

      setProcessingStep('Finalizing 100-point rubric assessment...');
      await new Promise(r => setTimeout(r, 300));

      onAnalysisComplete(record);
    } catch (err: any) {
      setValidationError(err.message || 'Analysis failed. Please check the uploaded file.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          New Manuscript Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload your academic research paper for pre-submission structural, citation, and readability quality assessment.
        </p>
      </div>

      {/* Demo Mode Quick Launch Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Instant Viva Demonstration Mode</span>
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed max-w-xl">
            Demonstrate the full pipeline instantly using a synthetic research manuscript containing intentional realistic flaws (citation mismatches, vague title prefix, abstract gaps, and uncited bibliography items).
          </p>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleStartAnalysis(true)}
          className="shrink-0 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Load Demo Paper & Analyze</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step A: Upload File */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Step 1: Upload Manuscript Document</h2>
          <p className="text-xs text-slate-500">Supports standard research paper PDFs and DOCX files up to 15 MB</p>
        </div>

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-slate-800">
              Drag & drop your manuscript here, or <span className="text-indigo-600 underline">browse files</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              PDF or DOCX · Max 15 MB · Clean text extractable (Scanned image PDFs require OCR)
            </p>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">{file.name}</div>
                <div className="text-[11px] text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.name.endsWith('.pdf') ? 'PDF Document' : 'DOCX Document'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Step B: Metadata */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Step 2: Manuscript Metadata & Target Format</h2>
          <p className="text-xs text-slate-500">Configures structural expectations and domain calibration</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 sm:col-span-2">
            <label className="font-medium text-slate-700">Manuscript Title (Optional Override)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to detect automatically from document header"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Target Publishing Style</label>
            <select
              value={manuscriptType}
              onChange={(e) => setManuscriptType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="imrad">Generic IMRaD (Intro, Method, Results, Discussion)</option>
              <option value="ieee">IEEE Conference / Journal Style</option>
              <option value="acm">ACM Proceedings Style</option>
              <option value="custom">Custom / Unspecified Structure</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-slate-700">Research Domain</label>
            <input
              type="text"
              value={researchDomain}
              onChange={(e) => setResearchDomain(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Step C: Assessment Categories */}
      <section className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Step 3: Assessment Categories</h2>
            <p className="text-xs text-slate-500">All 8 core categories selected by default (100 pts total)</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {enabledCategories.length} / {availableCategories.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {availableCategories.map(cat => {
            const checked = enabledCategories.includes(cat.name);
            return (
              <label
                key={cat.name}
                className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                  checked ? 'bg-indigo-50/40 border-indigo-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat.name)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-500 font-mono">{cat.weight}</span>
                  <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">{cat.type}</span>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* Step D: Execution Action */}
      <div className="pt-2">
        {isProcessing ? (
          <div className="bg-white rounded-xl border border-indigo-200 p-6 text-center space-y-4 shadow-sm">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Analyzing Manuscript</h3>
              <p className="text-xs text-indigo-700 font-medium font-mono">{processingStep}</p>
            </div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Please wait while the document is ingested, canonical sections segmented, citations cross-referenced, and rubric scores computed.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleStartAnalysis(false)}
            disabled={!file}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Analyze Manuscript</span>
          </button>
        )}
      </div>
    </div>
  );
};
