from __future__ import annotations
import json
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal, Optional

from settings import get_settings

log = logging.getLogger(__name__)
router = APIRouter()

Level = Literal["beginner", "visual", "advanced"]

_CACHE: dict[str, dict] = {}

_SLUG_READABLE: dict[str, str] = {
    "thermo-1er-principe": "le premier principe de la thermodynamique",
    "algebre-diagonalisation": "la diagonalisation des matrices en algèbre linéaire",
    "analyse-limites": "les limites et la continuité en analyse mathématique",
    "analyse-series": "les séries numériques et leur convergence",
    "chimie-equilibre": "les équilibres chimiques et la constante d'équilibre",
    "electronique-amplificateur-op": "l'amplificateur opérationnel et ses montages de base",
    "electrostatique-gauss": "le théorème de Gauss en électrostatique",
    "mecanique-newton": "les lois de Newton en mécanique classique",
    "optique-lentilles-minces": "les lentilles minces en optique géométrique",
    "proba-bayes": "le théorème de Bayes en probabilités",
    "signal-fourier": "la transformée de Fourier en traitement du signal",
    "algo-recursivite": "la récursivité en algorithmique et programmation",
}

_LEVEL_INSTRUCTIONS: dict[str, str] = {
    "beginner": (
        "Explique ce concept comme si tu t'adressais à un étudiant débutant "
        "qui découvre la matière. Utilise un langage simple, des analogies "
        "concrètes et évite le jargon technique avancé."
    ),
    "visual": (
        "Explique ce concept avec une approche visuelle et intuitive. "
        "Utilise des métaphores graphiques, des schémas mentaux, et "
        "décris visuellement les mécanismes en jeu. Cible un étudiant "
        "de cycle préparatoire."
    ),
    "advanced": (
        "Explique ce concept à un niveau avancé : formules mathématiques, "
        "démonstrations rigoureuses, et cas limites. Suppose que l'étudiant "
        "maîtrise déjà les bases et prépare un examen approfondi."
    ),
}


class ExplainRequest(BaseModel):
    conceptSlug: str
    level: Level = "beginner"


class ExplainResponse(BaseModel):
    conceptSlug: str
    courseId: Optional[str] = None
    explanation: str
    keyPoints: list[str]
    level: Level
    videosSlug: Optional[str] = None
    isFallback: bool


def _call_gemini(slug: str, level: Level) -> dict | None:
    api_key = get_settings().google_api_key
    if not api_key:
        return None

    try:
        import google.generativeai as genai
    except ImportError:
        log.warning("google-generativeai not installed")
        return None

    concept = _SLUG_READABLE.get(slug, slug.replace("-", " "))
    level_instruction = _LEVEL_INSTRUCTIONS.get(level, _LEVEL_INSTRUCTIONS["beginner"])

    prompt = (
        f"Tu es un professeur de classe préparatoire aux grandes écoles d'ingénieurs "
        f"au Maroc. Tu expliques les concepts scientifiques en français.\n\n"
        f"Concept à expliquer : {concept}\n\n"
        f"{level_instruction}\n\n"
        f"Réponds UNIQUEMENT avec un objet JSON valide (sans balise markdown) "
        f"contenant deux champs :\n"
        f'  - "explanation": un texte d\'explication détaillé en français '
        f"(au moins 4-6 phrases, entre 250 et 500 mots)\n"
        f'  - "key_points": un tableau de 4 à 6 points clés en français\n\n'
        f"Exemple de format attendu :\n"
        f'{{"explanation": "texte ici...", '
        f'"key_points": ["point 1", "point 2", "point 3"]}}'
    )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1]
            text = text.rsplit("```", 1)[0]
        parsed = json.loads(text)
        if not isinstance(parsed.get("explanation"), str) or not isinstance(parsed.get("key_points"), list):
            raise ValueError("Unexpected response shape")
        return parsed
    except Exception as e:
        log.warning("Gemini call failed for %s: %s", slug, e)
        return None


@router.post("/concept", response_model=ExplainResponse)
def explain_concept(req: ExplainRequest) -> ExplainResponse:
    cache_key = f"{req.conceptSlug}:{req.level}"
    cached = _CACHE.get(cache_key)
    if cached:
        return ExplainResponse(
            conceptSlug=req.conceptSlug,
            explanation=cached["explanation"],
            keyPoints=cached["key_points"],
            level=req.level,
            isFallback=False,
        )

    result = _call_gemini(req.conceptSlug, req.level)

    if result:
        _CACHE[cache_key] = result
        return ExplainResponse(
            conceptSlug=req.conceptSlug,
            explanation=result["explanation"],
            keyPoints=result["key_points"],
            level=req.level,
            isFallback=False,
        )

    return ExplainResponse(
        conceptSlug=req.conceptSlug,
        explanation=(
            "Désolé, l'explication n'est pas disponible pour le moment. "
            "Vérifie que la clé API Google est configurée dans le fichier .env "
            "et que le service AI a accès à Internet."
        ),
        keyPoints=["Service temporairement indisponible"],
        level=req.level,
        isFallback=True,
    )
