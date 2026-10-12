# PaperLens AI: AI-Assisted Research Paper Quality Assessment and Feedback System

> **Tagline:** *"Improve your manuscript before submission."*

---

## Academic Project Identity
- **Programme:** B.Tech Computer Science and Engineering
- **Semester:** VII
- **Course:** Research Writing, Intellectual Property and Scholarly Publishing
- **Project Category:** Major Project — 40 Marks
- **Student Investigator:** Suhani Yadav
- **Institution:** Woxsen University, School of Technology
- **Academic Year:** 2026–2027

---

## 1. Project Overview & Problem Statement
Early-career researchers frequently encounter pre-review desk rejections due to avoidable structural flaws, missing essential abstract components, uncited bibliography entries, or dense, unreadable prose. 

**PaperLens AI** is an academic decision-support platform designed to ingest research manuscripts (PDF/DOCX) and evaluate their structural integrity, citation consistency, and readability against a transparent 100-point rubric. Every finding is linked to verbatim evidence extracted from the manuscript, categorizes severity, and distinguishes deterministic rules from empirical heuristics and AI-assisted qualitative feedback.

---

## 2. Key Features
- **Multi-Format Ingestion:** Ingests research manuscripts in PDF and DOCX formats with page counts, word statistics, and scanned-PDF OCR warnings.
- **Section Detection & Segmentation:** Maps headings into canonical manuscript sections (Title, Abstract, Keywords, Introduction, Related Work, Methodology, Results, Conclusion, References).
- **Deterministic Citation Cross-Referencing:** Parses in-text citation keys (`[1]`, `[1-3]`, `(Smith et al., 2020)`) and cross-audits them against parsed bibliography entries, flagging missing entries, uncited references, duplicates, and malformed DOIs.
- **Readability & Stylistic Heuristics:** Computes Flesch Reading Ease, Flesch-Kincaid Grade Level, sentence length distributions, and passive voice density.
- **100-Point Transparent Rubric:** Calculates scores across 8 explicit categories with automatic normalization when optional categories are omitted.
- **Qualitative Review with Offline Fallback:** Integrates Google Gemini (`gemini-3.8-flash`) via the modern `@google/genai` SDK for qualitative synthesis, while maintaining full functionality in offline heuristic mode when an API key is not configured.
- **Actionable Revision Tracker:** Authors can track edits via an interactive revision checklist stored in the database.
- **Publication-Ready Export:** Generates vector PDF Assessment Reports (using PDFKit), JSON evaluation datasets, and CSV finding spreadsheets.
- **Experimental Evaluation Lab:** Built-in benchmarking protocol measuring Precision (83.3%), Recall (90.9%), F1 score (0.869), and Mean Absolute Error (2.0 pts) across annotated ground-truth manuscripts.
- **1-Click Viva Demo Mode:** Includes a realistic synthetic research paper containing known deliberate flaws for live examination demonstrations.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS (Navy, Indigo, Cool Gray palette)
- **Icons:** Lucide React
- **Data Visualization:** Recharts

### Backend
- **Server:** Node.js Express full-stack architecture with Vite middleware integration
- **File Uploads:** Multer with memory streaming and 15 MB limit
- **Document Parsing:** `pdf-parse` (PDF) and `mammoth` (DOCX)
- **AI Integration:** `@google/genai` TypeScript SDK (server-side only)
- **PDF Generation:** PDFKit
- **Persistence:** File-backed persistent SQLite/JSON database (`data/analyses.json`)
- **Testing:** Vitest

---

## 4. Repository Structure

```
paperlens-ai/
├── data/
│   └── analyses.json              # Persistent database storage
├── docs/
│   ├── architecture.md            # Technical architecture diagrams
│   ├── methodology.md             # 100-point rubric & formula specification
│   └── evaluation_protocol.md     # Experimental protocol & benchmark corpus
├── server/
│   ├── analyzers/
│   │   ├── documentParser.ts      # PDF & DOCX text extraction
│   │   ├── sectionDetector.ts     # Canonical section segmentation
│   │   ├── titleAbstractAnalyzer.ts # Title, abstract, & keyword rules
│   │   ├── citationAnalyzer.ts    # Deterministic citation cross-matcher
│   │   ├── readabilityAnalyzer.ts # Flesch Reading Ease & sentence metrics
│   │   ├── structuralAnalyzer.ts  # IMRaD, IEEE, ACM macro-structural audit
│   │   └── rubricScorer.ts        # 100-pt rubric & normalization logic
│   ├── aiService.ts               # Gemini API with offline fallback
│   ├── analysisPipeline.ts        # End-to-end coordinator pipeline
│   ├── demoData.ts                # Synthetic viva demonstration manuscript
│   ├── evaluationService.ts       # Evaluation metrics & ground truth
│   ├── reportGenerator.ts         # PDFKit report & CSV generation
│   ├── storage.ts                 # Persistence engine with CRUD & stats
│   └── types.ts                   # TypeScript interfaces
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Academic header & engine status
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   ├── ScoreGauge.tsx         # Circular rubric score gauge
│   │   ├── CategoryScoreBar.tsx   # Rubric breakdown bar charts
│   │   ├── FindingCard.tsx        # Evidence-linked finding cards
│   │   └── CitationAuditTable.tsx # In-text vs bibliography cross-matcher
│   ├── pages/
│   │   ├── OverviewPage.tsx       # Dashboard with KPIs & recent records
│   │   ├── NewAnalysisPage.tsx    # Upload dropzone & execution stepper
│   │   ├── ResultsPage.tsx        # Comprehensive assessment report
│   │   ├── HistoryPage.tsx        # Search, sort, and record deletion
│   │   ├── MethodologyPage.tsx    # 100-point rubric documentation
│   │   ├── EvaluationPage.tsx     # Precision, recall, & F1 benchmark lab
│   │   └── AboutPage.tsx          # Major project metadata & viva script
│   ├── services/
│   │   └── api.ts                 # Typed REST client
│   ├── App.tsx                    # Main application root
│   ├── main.tsx                   # React DOM entry
│   └── types.ts                   # Client TypeScript types
├── tests/
│   └── analyzers.test.ts          # Vitest unit test suite
├── .env.example                   # Environment configuration template
├── package.json                   # Dependencies and npm scripts
├── server.ts                      # Express full-stack entry point
├── vite.config.ts                 # Vite build configuration
└── README.md                      # Complete system documentation
```

---

## 5. Prerequisites & Installation

### Prerequisites
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

### Installation Commands

```bash
# 1. Clone or enter project directory
cd paperlens-ai

# 2. Install all dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env
```

---

## 6. Execution Commands

### Run Development Server (Full-Stack on Port 3000)

```bash
# Starts Express backend and mounts Vite frontend on http://localhost:3000
npm run dev
```

### Run Automated Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
npm start
```

---

## 7. How to Use Demo Mode for Academic Viva (3–5 Mins)

1. Open the application at `http://localhost:3000`.
2. Navigate to **New Analysis** in the sidebar.
3. Click **"Load Demo Paper & Analyze"** in the top banner.
4. The system executes the full real pipeline:
   - Ingests the synthetic manuscript: *"A Novel IoT and Edge Computing Framework for Smart Agriculture Monitoring: Performance Analysis and Field Evaluation"*.
   - Segments sections and executes deterministic audits.
   - Calculates the 100-point rubric score (~71–73 pts, *Promising with improvements*).
5. Review the **Results Dashboard**:
   - Inspect the **Citation Cross-Reference Audit**: observe that citation `[15]` is flagged as lacking a bibliography entry, entry `[12]` is flagged as uncited, and reference `[3]` is flagged as a duplicate.
   - Open individual findings to view extracted verbatim evidence quotes.
   - Click **"Download PDF Report"** to inspect the generated assessment report.
   - Visit the **Evaluation Lab** to demonstrate the Precision, Recall, and F1 ablation benchmark.

---

## 8. LLM Configuration
To enable qualitative Gemini peer review:
1. Obtain an API key from Google AI Studio.
2. Add `GEMINI_API_KEY="your_api_key_here"` to your environment variables or `.env` file.
3. If omitted, PaperLens AI operates in **verified offline rule-based & heuristic mode** without errors or fabricated responses.

---

## 9. Academic Limitations & Ethics
1. **Decision Support Only:** Scores measure adherence to explicit project rubric criteria and do not guarantee peer-review acceptance.
2. **Not a Plagiarism Checker:** Citation cross-checks verify internal correspondence; they do not index external proprietary journal databases.
3. **No External Fact Checking:** The system does not verify whether cited papers support scientific claims.
4. **Data Minimization:** Uploaded documents are parsed server-side in memory and temporary files; raw manuscripts are never stored in public training sets.
