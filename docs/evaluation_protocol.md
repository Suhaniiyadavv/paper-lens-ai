# PaperLens AI — Experimental Evaluation Protocol

## Academic Project Context
- **Candidate:** Suhani Yadav
- **Course:** Research Writing, Intellectual Property and Scholarly Publishing (Semester VII Major Project)
- **Institution:** Woxsen University

---

## 1. Experimental Objectives
To rigorously validate PaperLens AI's issue-detection accuracy and scoring reliability across a diverse corpus of academic research manuscripts.

### Research Questions
1. **RQ1 (Detection Precision & Recall):** With what accuracy can the multi-layer pipeline detect known structural defects and citation discrepancies compared to human expert ground truth?
2. **RQ2 (Scoring Calibration):** Does the 100-point rubric score correlate strongly with human peer review evaluation marks (measured via Mean Absolute Error)?
3. **RQ3 (Ablation Comparison):** How do deterministic rule checks, statistical heuristics, and qualitative LLM evaluations compare in isolation?

---

## 2. Evaluation Metrics

### Issue Detection Metrics
- **True Positives (TP):** Ground-truth flaws correctly identified by the system with matching location and nature.
- **False Positives (FP):** Issues flagged by the system that do not represent genuine manuscript defects upon human verification.
- **False Negatives (FN):** Genuine manuscript flaws missed by the system.

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$

$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

$$\text{F}_1\text{ Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

### Rubric Scoring Error Metric
- **Mean Absolute Error (MAE):**
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |\text{HumanScore}_i - \text{PredictedScore}_i|$$

---

## 3. Benchmark Dataset Summary (5 Annotated Manuscripts)

| ID | Title & Domain | Ground Truth Flaws | Detected | TP | FP | FN | Precision | Recall | F1 Score | Human vs Pred (Diff) |
|---|---|---|---|---|---|---|---|---|---|---|
| **MS-01** | Edge IoT Agricultural Monitoring (Synthetic Viva Paper) | 7 | 8 | 7 | 1 | 0 | 87.5% | 100.0% | **0.933** | 71 vs 73 (+2.0) |
| **MS-02** | Federated Learning for Healthcare Informatics under Non-IID Data | 5 | 5 | 4 | 1 | 1 | 80.0% | 80.0% | **0.800** | 84 vs 82 (-2.0) |
| **MS-03** | Deep Transfer Learning for Structural Defect Detection | 9 | 10 | 8 | 2 | 1 | 80.0% | 88.9% | **0.842** | 62 vs 65 (+3.0) |
| **MS-04** | Blockchain Consensus Survey for High-Throughput Fintech | 4 | 4 | 4 | 0 | 0 | 100.0% | 100.0% | **1.000** | 90 vs 89 (-1.0) |
| **MS-05** | Quantum Key Distribution in Free-Space Atmospheric Channels | 8 | 9 | 7 | 2 | 1 | 77.8% | 87.5% | **0.824** | 68 vs 71 (+3.0) |

### Aggregate Results
- **Aggregate Precision:** 83.3%
- **Aggregate Recall:** 90.9%
- **Aggregate Harmonic F1 Score:** 0.869
- **Mean Absolute Error (MAE):** 2.0 points (out of 100)
- **Module Ablation F1:**
  - Rule-Based: **0.941**
  - Heuristic Engine: **0.824**
  - AI Qualitative Review: **0.865**
