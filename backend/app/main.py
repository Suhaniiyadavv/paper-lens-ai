"""
PaperLens AI - Academic Reference FastAPI Implementation
B.Tech CSE Semester VII Major Project
Student: Suhani Yadav | University: Woxsen University | Academic Year: 2026-2027
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime
import re

app = FastAPI(
    title="PaperLens AI API",
    description="AI-Assisted Research Paper Quality Assessment and Feedback System",
    version="1.0.0-academic"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    product: str
    version: str
    student: str
    university: str
    timestamp: str

@app.get("/api/health", response_model=HealthResponse)
def get_health():
    return {
        "status": "healthy",
        "product": "PaperLens AI",
        "version": "1.0.0-academic",
        "student": "Suhani Yadav",
        "university": "Woxsen University",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.get("/api/methodology")
def get_methodology():
    return {
        "rubricVersion": "2026.1-Woxsen-MajorProject",
        "rubricWeights": [
            {"category": "Structure and completeness", "weight": 15, "method": "Rule-Based"},
            {"category": "Title, abstract, and keywords", "weight": 15, "method": "Heuristic"},
            {"category": "Research problem and objectives", "weight": 10, "method": "Heuristic / AI"},
            {"category": "Literature review and research gap", "weight": 15, "method": "Heuristic / AI"},
            {"category": "Methodology reporting", "weight": 15, "method": "Heuristic / AI"},
            {"category": "Results, discussion, and conclusion", "weight": 15, "method": "Heuristic / AI"},
            {"category": "Citation and reference consistency", "weight": 10, "method": "Rule-Based"},
            {"category": "Writing clarity and organization", "weight": 5, "method": "Heuristic"}
        ],
        "normalizationFormula": "Normalized = (Earned in applicable / Max in applicable) * 100"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
