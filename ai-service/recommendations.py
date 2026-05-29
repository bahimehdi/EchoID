"""
Recommendation endpoints for the professor / admin web dashboards.

Deterministic synthetic data generator producing module-level KPIs,
explainer history, submission stats, professor performance, and more.
Swap to SQL reads when real seed data is wired in.
"""
from __future__ import annotations
import math
import random
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

School = Literal["ENSA", "EST", "FAC", "ALL"]

# ── Models ─────────────────────────────────────────────────────────────────────

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

class ExplainHistoryResponse(BaseModel):
    module: str
    label: str
    weeks: list[str]
    requests: list[int]

class SubmissionStatsResponse(BaseModel):
    module: str
    label: str
    tds: list[str]
    onTime: list[int]
    late: list[int]

class ModuleKpisResponse(BaseModel):
    module: str
    label: str
    average: float
    submissionRate: float
    explainerUsage: float
    ocrDocs: int
    bottleneckIndex: int

class AllModulesHistoryResponse(BaseModel):
    modules: list[ExplainHistoryResponse]

class EngagementByDayResponse(BaseModel):
    day: str
    count: int

class CohortSubmissionsResponse(BaseModel):
    tds: list[str]
    onTime: list[int]
    late: list[int]

class ProfessorPerformance(BaseModel):
    name: str
    modules: str
    avgScore: str
    responseRate: str
    uploadRate: str
    satisfaction: str
    radar: list[int]

class ProfessorPerformanceResponse(BaseModel):
    professors: list[ProfessorPerformance]


# ── Deterministic synthetic data ─────────────────────────────────────────────

_RNG = random.Random(42)

_MODULES = [
    ("algebre", "Algèbre linéaire"),
    ("thermo", "Thermodynamique générale"),
    ("chimie", "Chimie"),
    ("proba", "Probabilités et statistiques"),
    ("signal", "Traitement du signal"),
    ("python", "Algorithmique & Programmation (Python)"),
]

_WEEKS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]
_TDS = ["TD1", "TD2", "TD3", "TD4", "TD5", "TD6"]
_WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

def _generate_explain_history(module_id: str) -> list[int]:
    """Deterministic weekly request series per module."""
    rng = random.Random(hash(f"explain-{module_id}"))
    base = {"algebre": 50, "thermo": 35, "chimie": 25, "proba": 60, "signal": 40, "python": 30}
    start = base.get(module_id, 40)
    return [max(5, int(start + rng.uniform(-5, 10) + i * rng.uniform(2, 8))) for i in range(8)]

def _generate_submission_stats(module_id: str) -> tuple[list[int], list[int]]:
    """Per-TD on-time / late counts."""
    rng = random.Random(hash(f"sub-{module_id}"))
    total_per_td = [30, 28, 26, 27, 28, 26]
    on_time = [max(10, t - rng.randint(3, 12)) for t in total_per_td]
    late = [t - o for t, o in zip(total_per_td, on_time)]
    return on_time, late

def _generate_kpis(module_id: str) -> ModuleKpisResponse:
    rng = random.Random(hash(f"kpi-{module_id}"))
    label = dict(_MODULES)[module_id]
    return ModuleKpisResponse(
        module=module_id, label=label,
        average=round(rng.uniform(9.5, 15.0), 1),
        submissionRate=round(rng.uniform(0.50, 0.95), 2),
        explainerUsage=round(rng.uniform(0.40, 0.85), 2),
        ocrDocs=rng.randint(5, 22),
        bottleneckIndex=rng.randint(25, 65),
    )

# Pre-generate for all modules
_EXPLAIN_HISTORY: dict[str, list[int]] = {}
_SUBMISSION_STATS: dict[str, tuple[list[int], list[int]]] = {}
_KPIS: dict[str, ModuleKpisResponse] = {}
for mid, _ in _MODULES:
    _EXPLAIN_HISTORY[mid] = _generate_explain_history(mid)
    _SUBMISSION_STATS[mid] = _generate_submission_stats(mid)
    _KPIS[mid] = _generate_kpis(mid)


# ── Existing synthetic cohort ─────────────────────────────────────────────────

_FIRST_NAMES = ["Yassine", "Salma", "Reda", "Imane", "Anas", "Khadija", "Othmane", "Hajar",
                "Adil", "Soukaina", "Mehdi", "Nadia", "Walid", "Sara", "Karim", "Lina"]
_LAST_NAMES = ["El Amrani", "Bennani", "Cherkaoui", "Tazi", "Idrissi", "Naciri", "Bouzidi",
               "Ouahbi", "Sefrioui", "Mansouri", "Lahlou", "Belkadi"]
_SCHOOLS = ["ENSA", "ENSA", "ENSA", "ENSA", "EST", "EST", "FAC"]

def _student(i: int) -> dict:
    fn = _FIRST_NAMES[i % len(_FIRST_NAMES)]
    ln = _LAST_NAMES[i % len(_LAST_NAMES)]
    school = _SCHOOLS[i % len(_SCHOOLS)]
    return {
        "studentId": f"stu-{i:04d}",
        "fullName": f"{fn} {ln}",
        "school": school,
        "wd_trend": _RNG.uniform(0.02, 0.30),
        "active_days_14d": _RNG.randint(0, 14),
        "explainer_calls": _RNG.randint(0, 25),
        "days_since_last_login": _RNG.randint(0, 21),
    }

_STUDENTS = [_student(i) for i in range(60)]

_BOTTLENECK_CONCEPTS = [
    ("thermo-1er-principe", "Thermodynamique générale", "ENSA"),
    ("algebre-diagonalisation", "Algèbre linéaire", "ENSA"),
    ("algo-recursivite", "Algorithmique & Programmation (Python)", "ENSA"),
    ("optique-lentilles-minces", "Optique géométrique et instrumentale", "ENSA"),
    ("proba-bayes", "Probabilités et statistiques", "ENSA"),
    ("signal-fourier", "Traitement du signal", "ENSA"),
    ("chimie-equilibre", "Chimie", "ENSA"),
    ("electrostatique-gauss", "Électrostatique", "ENSA"),
    ("analyse-limites", "Analyse de base 1", "EST"),
    ("mecanique-newton", "Mécanique du point matériel", "FAC"),
]

def _risk(student: dict) -> float:
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


# ── Endpoints (existing) ──────────────────────────────────────────────────────

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
        InterventionSuggestion(cohort="ENSAK CP1 S2", module="Thermodynamique générale",
            suggestion="Programmer une révision sur le 1er principe avant le contrôle (70 % du cohort a sollicité l'explainer cette semaine).",
            confidence=0.86),
        InterventionSuggestion(cohort="ENSAK CP1 S2", module="Algorithmique & Programmation",
            suggestion="Renforcer les TD sur la récursivité — pic de demandes d'explication concentré sur 3 jours.",
            confidence=0.74),
        InterventionSuggestion(cohort="ENSAK CP2 S4", module="Probabilités et statistiques",
            suggestion="Mettre en avant un TD sur le théorème de Bayes : 60 % des étudiants ont consulté l'explication, contre 25 % d'engagement habituel.",
            confidence=0.81),
    ]

@router.get("/cheating-clusters", response_model=list[CheatingCluster])
def cheating_clusters(school: School = Query("ENSA")) -> list[CheatingCluster]:
    if school not in ("ENSA", "ALL"):
        return []
    return [
        CheatingCluster(clusterId="PY-R-01", assignmentTitle="TP Python — Récursivité",
            module="Algorithmique & Programmation", avgSimilarity=0.88, submittedWithinMinutes=11,
            students=[CheatingStudent(id="stu-0008", name="Adil Bouzidi"),
                      CheatingStudent(id="stu-0015", name="Lina Tazi"),
                      CheatingStudent(id="stu-0029", name="Sara Mansouri")],
            evidence=["Commentaires identiques aux lignes 12, 38 et 47",
                      "Même variable total_pts, rare dans la cohorte (< 5 %)",
                      "Indentation et lignes vides identiques sur les fonctions récursives"],
            recommendation="Vérifier les soumissions Moodle avant validation finale des notes.")
    ]


# ── New dashboard endpoints ───────────────────────────────────────────────────

@router.get("/explainer-history", response_model=ExplainHistoryResponse)
def explainer_history(module: str = Query("algebre")) -> ExplainHistoryResponse:
    label = dict(_MODULES).get(module, module)
    return ExplainHistoryResponse(
        module=module, label=label,
        weeks=_WEEKS.copy(),
        requests=_EXPLAIN_HISTORY.get(module, _EXPLAIN_HISTORY["algebre"]).copy(),
    )

@router.get("/submission-stats", response_model=SubmissionStatsResponse)
def submission_stats(module: str = Query("algebre")) -> SubmissionStatsResponse:
    label = dict(_MODULES).get(module, module)
    on_time, late = _SUBMISSION_STATS.get(module, _SUBMISSION_STATS["algebre"])
    return SubmissionStatsResponse(
        module=module, label=label,
        tds=_TDS.copy(), onTime=on_time.copy(), late=late.copy(),
    )

@router.get("/module-kpis", response_model=ModuleKpisResponse)
def module_kpis(module: str = Query("algebre")) -> ModuleKpisResponse:
    return _KPIS.get(module, _KPIS["algebre"])

@router.get("/all-modules-history", response_model=AllModulesHistoryResponse)
def all_modules_history() -> AllModulesHistoryResponse:
    modules = [
        ExplainHistoryResponse(
            module=mid, label=label,
            weeks=_WEEKS.copy(),
            requests=_EXPLAIN_HISTORY[mid].copy(),
        )
        for mid, label in _MODULES
    ]
    return AllModulesHistoryResponse(modules=modules)

@router.get("/engagement-by-day", response_model=list[EngagementByDayResponse])
def engagement_by_day() -> list[EngagementByDayResponse]:
    rng = random.Random(hash("engagement"))
    # Peak on Sunday
    counts = [rng.randint(180, 280) for _ in range(6)]
    counts.insert(6, 352)
    return [EngagementByDayResponse(day=d, count=c) for d, c in zip(_WEEKDAYS, counts)]

@router.get("/cohort-submissions", response_model=CohortSubmissionsResponse)
def cohort_submissions() -> CohortSubmissionsResponse:
    rng = random.Random(hash("cohort"))
    total_per_td = [155, 154, 155, 155, 151, 154]
    on_time = [max(80, t - rng.randint(20, 50)) for t in total_per_td]
    late = [t - o for t, o in zip(total_per_td, on_time)]
    return CohortSubmissionsResponse(tds=_TDS.copy(), onTime=on_time, late=late)

@router.get("/professor-performance", response_model=ProfessorPerformanceResponse)
def professor_performance() -> ProfessorPerformanceResponse:
    rng = random.Random(hash("professors"))
    data = [
        ("Pr. El Fassi", "Algèbre, Signal"),
        ("Pr. Benali", "Thermo, Chimie"),
        ("Pr. Chraibi", "Probabilités"),
        ("Pr. Amrani", "Python"),
    ]
    professors = [
        ProfessorPerformance(
            name=name, modules=mod,
            avgScore=str(round(rng.uniform(10.5, 15.0), 1)),
            responseRate=f"{rng.randint(75, 96)}%",
            uploadRate=f"{rng.randint(55, 85)}%",
            satisfaction=str(round(rng.uniform(3.5, 5.0), 1)),
            radar=[rng.randint(60, 95) for _ in range(4)],
        )
        for name, mod in data
    ]
    return ProfessorPerformanceResponse(professors=professors)
