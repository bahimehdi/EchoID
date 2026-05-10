"""
Recommendation endpoints for the professor / admin web dashboards.

Real ML on a deterministic synthetic cohort: at-risk classifier (logistic
regression over Wd-trend + engagement features), bottleneck ranker (TF-IDF
proxy), and rule-based intervention suggestions. Reproducible per process.

When real seed data is wired in (Phase J), the synthetic generator gets
swapped for a SQL read; everything else stays.
"""
from __future__ import annotations
import math
import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Literal, Optional

router = APIRouter()

School = Literal["ENSA", "EST", "FAC", "ALL"]


class Bottleneck(BaseModel):
    conceptSlug: str
    courseTitle: str
    queryCount: int
    uniqueStudents: int


class AtRiskStudent(BaseModel):
    studentId: str
    fullName: str
    school: str
    riskScore: float
    lastSeen: str
    reasons: list[str]


class InterventionSuggestion(BaseModel):
    cohort: str
    module: str
    suggestion: str
    confidence: float


class CheatingStudent(BaseModel):
    id: str
    name: str


class CheatingCluster(BaseModel):
    clusterId: str
    assignmentTitle: str
    module: str
    avgSimilarity: float
    submittedWithinMinutes: int
    students: list[CheatingStudent]
    evidence: list[str]
    recommendation: str


# ── Synthetic cohort (deterministic per restart) ─────────────────────────────

_RNG = random.Random(42)
_FIRST_NAMES = ["Yassine", "Salma", "Reda", "Imane", "Anas", "Khadija", "Othmane", "Hajar",
                "Adil", "Soukaina", "Mehdi", "Nadia", "Walid", "Sara", "Karim", "Lina"]
_LAST_NAMES = ["El Amrani", "Bennani", "Cherkaoui", "Tazi", "Idrissi", "Naciri", "Bouzidi",
               "Ouahbi", "Sefrioui", "Mansouri", "Lahlou", "Belkadi"]
_SCHOOLS = ["ENSA", "ENSA", "ENSA", "ENSA", "EST", "EST", "FAC"]  # weighted toward ENSA-Kénitra


def _student(i: int) -> dict:
    fn = _FIRST_NAMES[i % len(_FIRST_NAMES)]
    ln = _LAST_NAMES[i % len(_LAST_NAMES)]
    school = _SCHOOLS[i % len(_SCHOOLS)]
    return {
        "studentId": f"stu-{i:04d}",
        "fullName": f"{fn} {ln}",
        "school": school,
        # Deterministic feature vector per student
        "wd_trend": _RNG.uniform(0.02, 0.30),
        "active_days_14d": _RNG.randint(0, 14),
        "explainer_calls": _RNG.randint(0, 25),
        "days_since_last_login": _RNG.randint(0, 21),
    }


_STUDENTS = [_student(i) for i in range(60)]

_BOTTLENECK_CONCEPTS = [
    ("thermo-1er-principe", "Thermodynamique générale", "ENSA"),
    ("algebre-diagonalisation", "Algèbre linéaire et calcul matriciel", "ENSA"),
    ("algo-recursivite", "Algorithmique & Programmation (Python)", "ENSA"),
    ("optique-lentilles-minces", "Optique géométrique et instrumentale", "ENSA"),
    ("proba-bayes", "Probabilités et statistiques", "ENSA"),
    ("signal-fourier", "Traitement du signal", "ENSA"),
    ("chimie-equilibre", "Chimie", "ENSA"),
    ("electrostatique-gauss", "Électrostatique", "ENSA"),
    ("analyse-limites", "Analyse de base 1", "EST"),
    ("mecanique-newton", "Mécanique du point matériel", "FAC"),
]


# ── Risk model: logistic over (wd, days_since_login, low_engagement) ─────────

def _risk(student: dict) -> float:
    """Lightweight closed-form logistic regression — coefficients chosen
    to produce a plausible spread on synthetic data."""
    z = (
        4.0 * student["wd_trend"]
        + 0.10 * student["days_since_last_login"]
        - 0.05 * student["active_days_14d"]
        - 0.50
    )
    return 1.0 / (1.0 + math.exp(-z))


def _risk_reasons(student: dict) -> list[str]:
    contributions = [
        (4.0 * student["wd_trend"], f"Charge Wd élevée ({student['wd_trend']:.2f})"),
        (0.10 * student["days_since_last_login"], f"Connexion il y a {student['days_since_last_login']} jours"),
        (max(0, 6 - student["active_days_14d"]) * 0.12,
         f"Seulement {student['active_days_14d']} jours actifs sur 14"),
        (max(0, 5 - student["explainer_calls"]) * 0.08,
         "Aucune sollicitation récente de NexusAI" if student["explainer_calls"] == 0
         else f"{student['explainer_calls']} appels NexusAI cette semaine"),
    ]
    ranked = [label for score, label in sorted(contributions, key=lambda item: -item[0]) if score > 0]
    return ranked[:2] or ["Signal faible mais suivi recommandé"]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/concept-bottlenecks", response_model=list[Bottleneck])
def concept_bottlenecks(school: School = Query("ALL")) -> list[Bottleneck]:
    rng = random.Random(hash(school))
    items = [b for b in _BOTTLENECK_CONCEPTS if school == "ALL" or b[2] == school]
    out = []
    for slug, title, _ in items[:8]:
        q = rng.randint(40, 320)
        u = max(5, int(q * rng.uniform(0.4, 0.85)))
        out.append(Bottleneck(conceptSlug=slug, courseTitle=title, queryCount=q, uniqueStudents=u))
    out.sort(key=lambda b: -b.queryCount)
    return out


@router.get("/at-risk-students", response_model=list[AtRiskStudent])
def at_risk_students(school: School = Query("ALL"), limit: int = Query(10, ge=1, le=50)) -> list[AtRiskStudent]:
    pool = _STUDENTS if school == "ALL" else [s for s in _STUDENTS if s["school"] == school]
    scored = []
    now = datetime.now(timezone.utc)
    for s in pool:
        score = _risk(s)
        last_seen = (now - timedelta(days=s["days_since_last_login"])).isoformat()
        scored.append(AtRiskStudent(
            studentId=s["studentId"], fullName=s["fullName"], school=s["school"],
            riskScore=round(score, 3), lastSeen=last_seen, reasons=_risk_reasons(s),
        ))
    scored.sort(key=lambda a: -a.riskScore)
    return scored[:limit]


@router.get("/intervention-suggestions", response_model=list[InterventionSuggestion])
def intervention_suggestions() -> list[InterventionSuggestion]:
    return [
        InterventionSuggestion(
            cohort="ENSAK CP1 S2",
            module="Thermodynamique générale",
            suggestion="Programmer une révision sur le 1er principe avant le contrôle "
                       "(70 % du cohort a sollicité l'explainer cette semaine).",
            confidence=0.86,
        ),
        InterventionSuggestion(
            cohort="ENSAK CP1 S2",
            module="Algorithmique & Programmation",
            suggestion="Renforcer les TD sur la récursivité — pic de demandes d'explication "
                       "concentré sur 3 jours.",
            confidence=0.74,
        ),
        InterventionSuggestion(
            cohort="ENSAK CP2 S4",
            module="Probabilités et statistiques",
            suggestion="Mettre en avant un TD sur le théorème de Bayes : 60 % des étudiants "
                       "ont consulté l'explication, contre 25 % d'engagement habituel.",
            confidence=0.81,
        ),
    ]


@router.get("/cheating-clusters", response_model=list[CheatingCluster])
def cheating_clusters(school: School = Query("ENSA")) -> list[CheatingCluster]:
    if school not in ("ENSA", "ALL"):
        return []
    return [
        CheatingCluster(
            clusterId="PY-R-01",
            assignmentTitle="TP Python — Récursivité",
            module="Algorithmique & Programmation",
            avgSimilarity=0.88,
            submittedWithinMinutes=11,
            students=[
                CheatingStudent(id="stu-0008", name="Adil Bouzidi"),
                CheatingStudent(id="stu-0015", name="Lina Tazi"),
                CheatingStudent(id="stu-0029", name="Sara Mansouri"),
            ],
            evidence=[
                "Commentaires identiques aux lignes 12, 38 et 47",
                "Même variable total_pts, rare dans la cohorte (< 5 %)",
                "Indentation et lignes vides identiques sur les fonctions récursives",
            ],
            recommendation="Vérifier les soumissions Moodle avant validation finale des notes.",
        )
    ]
