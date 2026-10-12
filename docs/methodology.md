# PaperLens AI — Evaluation Methodology & Rubric Specification

## 1. 100-Point Assessment Rubric

The system scores manuscripts across eight weighted dimensions totaling 100 points:

| # | Dimension | Weight | Primary Method | Criteria & Verification |
|---|-----------|--------|----------------|-------------------------|
| 1 | **Structure and Completeness** | 15 pts | Rule-Based | Detects required canonical sections according to format (IMRaD, IEEE, ACM). Checks for missing methods, results, or references. |
| 2 | **Title, Abstract, and Keywords** | 15 pts | Heuristic & Rule | Title conciseness (5-25 words), cliché prefixes ("A Study On"), 5 essential abstract components (Problem, Objective, Method, Results, Conclusion), and 3-8 indexing keywords. |
| 3 | **Research Problem and Objectives** | 10 pts | Heuristic & AI | Clear problem statement, explicit research questions or aims, and enumerated contribution statements in the Introduction. |
| 4 | **Literature Review and Research Gap** | 15 pts | Heuristic & AI | Critical synthesis versus mere serial listing, presence of contrastive transition markers ("however", "in contrast", "unexplored"), and clear gap framing. |
| 5 | **Methodology Reporting** | 15 pts | Heuristic & AI | Experimental design clarity, dataset disclosure (size, splits, parameters), mathematical formulation or algorithms, and explicit evaluation metrics. |
| 6 | **Results, Discussion, and Conclusion** | 15 pts | Heuristic & AI | Empirical quantitative presentation, comparative baselines, interpretation of mechanisms, limitations discussion, and future research paths. |
| 7 | **Citation and Reference Consistency** | 10 pts | Rule-Based | Deterministic cross-matching between in-text citation markers and bibliography entries. Flags uncited references, missing citations, and duplicates. |
| 8 | **Writing Clarity and Organization** | 5 pts | Heuristic | Flesch Reading Ease score, sentence length distributions (sentences > 35 words), and passive voice density estimation. |
| | **Total Maximum Score** | **100 pts** | | |

---

## 2. Normalization Mathematics
When all categories are selected and applicable:
$$\text{Overall Score} = \sum_{i=1}^{8} \text{Earned Points}_i$$

When specific categories are deselected by the author or marked Not Applicable (N/A) for non-empirical formats:
$$\text{Normalized Score} = \left( \frac{\sum \text{Earned Points in Applicable Categories}}{\sum \text{Maximum Points in Applicable Categories}} \right) \times 100$$

### Compliance Thresholds
- **85 – 100 pts:** *Strong rubric compliance* (High structural readiness for peer review).
- **70 – 84 pts:** *Promising with improvements* (Solid base; address citation or methodological reporting gaps).
- **50 – 69 pts:** *Needs revision* (Significant structural, reference, or motivation gaps).
- **0 – 49 pts:** *Needs substantial revision* (Missing core sections or underdeveloped content).

---

## 3. Readability Index Formulas
- **Flesch Reading Ease (FRE):**
  $$\text{FRE} = 206.835 - 1.015 \left(\frac{\text{words}}{\text{sentences}}\right) - 84.6 \left(\frac{\text{syllables}}{\text{words}}\right)$$
- **Flesch-Kincaid Grade Level (FKGL):**
  $$\text{FKGL} = 0.39 \left(\frac{\text{words}}{\text{sentences}}\right) + 11.8 \left(\frac{\text{syllables}}{\text{words}}\right) - 15.59$$
- **Automated Readability Index (ARI):**
  $$\text{ARI} = 4.71 \left(\frac{\text{characters}}{\text{words}}\right) + 0.5 \left(\frac{\text{words}}{\text{sentences}}\right) - 21.43$$
