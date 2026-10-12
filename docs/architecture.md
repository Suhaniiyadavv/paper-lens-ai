# PaperLens AI — System Architecture & Technical Specification

## Academic Context
- **Project Title:** AI-Assisted Research Paper Quality Assessment and Feedback System
- **Programme:** B.Tech Computer Science and Engineering, Semester VII
- **Course:** Research Writing, Intellectual Property and Scholarly Publishing (Major Project — 40 Marks)
- **Student:** Suhani Yadav
- **University:** Woxsen University
- **Academic Year:** 2026–2027

---

## 1. System Overview
PaperLens AI is a pre-submission decision-support platform designed to assist authors and peer reviewers in evaluating the structural completeness, referencing consistency, and scientific reporting rigor of academic manuscripts.

The system emphasizes a rigorous separation of concerns:
1. **Deterministic Rule Layer:** Performs exact, verifiable audits (citation-to-bibliography matching, missing mandatory sections, duplicate reference IDs).
2. **Empirical Heuristic Layer:** Evaluates linguistic and structural patterns (Flesch Reading Ease, sentence length variance, title cliché identification, abstract component heuristics).
3. **Qualitative AI Layer:** Ingests section summaries to provide constructive peer-review observations using Google Gemini (`gemini-3.8-flash`), featuring a graceful offline fallback when no external API key is present.
4. **Scoring & Rubric Engine:** Calculates a 0–100 score across 8 weighted categories with transparent normalization for optional categories.

---

## 2. Architecture Diagram

```
+--------------------------------------------------------------------------+
|                          CLIENT APPLICATION                              |
|   React 19 + TypeScript + Tailwind CSS + Lucide Icons + Recharts UI     |
+--------------------------------------------------------------------------+
                                    |
                                    | HTTP / REST (Multipart / JSON)
                                    v
+--------------------------------------------------------------------------+
|                     EXPRESS FULL-STACK BACKEND (server.ts)               |
|                                                                          |
|  [Multer 15MB Uploads]   [Vite Dev Middleware]   [REST API Controllers]  |
+--------------------------------------------------------------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +-------------------+    +------------------------+
| DOCUMENT PARSER  |     | CITATION ANALYZER |    | RUBRIC SCORING ENGINE  |
| - pdf-parse      |     | - In-text regex   |    | - 100-pt Weighted Math |
| - mammoth (docx) |     | - Bib Parser      |    | - Normalization for    |
| - Section Slicer |     | - Cross-Match     |    |   N/A categories       |
+------------------+     +-------------------+    +------------------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                                  v
+--------------------------------------------------------------------------+
|                       QUALITATIVE AI & EXPORT ENGINE                     |
|  - GoogleGenAI SDK (gemini-3.8-flash) with offline fallback              |
|  - PDFKit Report Generation (vector A4 with rubric tables & findings)    |
|  - JSON & CSV Data Exporters                                             |
|  - SQLite / JSON File Persistence (data/analyses.json)                   |
+--------------------------------------------------------------------------+
```

---

## 3. Data Flow
1. **Ingestion:** User uploads a PDF or DOCX file (or triggers synthetic Viva Demo mode).
2. **Extraction:** Buffer parsed into normalized text, page count, and word statistics. Scanned image PDFs without extractable text are flagged with OCR warnings.
3. **Segmentation:** Headings mapped to canonical aliases (Title, Abstract, Keywords, Introduction, Related Work, Methodology, Results, Conclusion, References).
4. **Deterministic Analysis:**
   - In-text citation keys extracted (`[1]`, `[1-3]`, `(Smith et al., 2020)`).
   - Bibliography entries parsed and indexed.
   - Cross-matching identifies uncited references and missing bibliography entries.
5. **Readability & Heuristic Calculation:**
   - Sentence segmentation, average word length, sentences > 35 words.
   - Flesch Reading Ease and Flesch-Kincaid Grade Level formulas computed.
6. **Qualitative AI Review:**
   - Structured JSON schema query to Gemini 3.8 Flash (if `GEMINI_API_KEY` configured).
   - If offline, fallback engine records localized heuristic assessment.
7. **Rubric Aggregation & Persistence:**
   - Points tallied across 8 categories (max 100).
   - Saved to persistent database; action items generated for revision tracking.
8. **Export:** User downloads vector PDF assessment report, JSON evaluation data, or CSV findings.
