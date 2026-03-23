from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


# ── Request & Response shapes ─────────────────────────────────
class Assignment(BaseModel):
    title: str
    complexity: float       # 1 = easy  ->  5 = very heavy
    days_remaining: float   # how many days until deadline


class WorkloadRequest(BaseModel):
    student_id: str
    assignments: list[Assignment]


class WorkloadResponse(BaseModel):
    student_id: str
    workload_density: float     # the Wd score
    risk_level: str             # "low" | "medium" | "high"
    recommendation: str


# ── Endpoint ──────────────────────────────────────────────────
@router.post("/analyze", response_model=WorkloadResponse)
def analyze_workload(req: WorkloadRequest):
    """
    Calculates student workload pressure using the official formula:

        Wd = sum( Ci / Ti )

    Where:
        Ci = complexity of assignment  (1 to 5)
        Ti = days remaining until deadline

    The higher the Wd score, the more overloaded the student is.

    THIS ENDPOINT IS FULLY LIVE IN SPRINT 1 — no mock needed.
    Sprint 3 will improve it with a trained ML scoring model.
    """

    # Edge case: no assignments
    if not req.assignments:
        return WorkloadResponse(
            student_id=req.student_id,
            workload_density=0.0,
            risk_level="low",
            recommendation="No assignments found. Your schedule is clear!",
        )

    # Apply the formula: Wd = sum(Ci / Ti) for each assignment
    # We use max(Ti, 0.1) to avoid division by zero
    wd = sum(
        a.complexity / max(a.days_remaining, 0.1)
        for a in req.assignments
    )
    wd = round(wd, 2)

    # Decide risk level based on Wd score
    if wd < 2.0:
        risk = "low"
        advice = (
            "Your week looks manageable. "
            "Stay consistent and work a little each day."
        )
    elif wd < 5.0:
        risk = "medium"
        advice = (
            "Moderate load detected. "
            "Try to spread your tasks across the next 2-3 days."
        )
    else:
        risk = "high"
        advice = (
            "Heavy week detected! "
            "Break your tasks into 45-minute sessions starting today. "
            "Do not wait until the last day."
        )

    return WorkloadResponse(
        student_id=req.student_id,
        workload_density=wd,
        risk_level=risk,
        recommendation=advice,
    )
