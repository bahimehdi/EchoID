"""
Generate all demo fixtures (explain / ocr / videos) into ai-service/fixtures/.

Re-run any time the demo catalogue changes:

    python ai-service/fixtures/_build_fixtures.py

Idempotent. Authors French content per the spec in .context/DEMO_FALLBACKS.md.
"""
from __future__ import annotations
import json
import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


def write(path_parts: tuple[str, ...], data: dict) -> None:
    path = os.path.join(ROOT, *path_parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─── Explainer (12) ──────────────────────────────────────────────────────────

EXPLAIN: list[dict] = [
    {
        "concept_slug": "thermo-1er-principe",
        "course_id": "ENSAK-CP1-S2-05",
        "display_name": "1er principe de la thermodynamique",
        "levels": {
            "beginner": {
                "explanation": "Le 1er principe dit que l'énergie d'un système isolé se conserve. Si tu chauffes un gaz (Q) ou que tu travailles sur lui (W), son énergie interne ΔU augmente d'autant : ΔU = Q + W.",
                "key_points": ["Conservation de l'énergie", "ΔU = Q + W", "Q et W comptés positivement quand reçus"],
            },
            "visual": {
                "explanation": "Imagine une boîte fermée avec un gaz. Tu ajoutes de la chaleur (flèche Q) et tu pousses un piston (flèche W). L'énergie interne U monte de Q + W exactement. Pas de fuite.",
                "key_points": ["Boîte = système", "U = état interne, Q et W = flux", "Diagramme P-V utile"],
            },
            "advanced": {
                "explanation": "dU = δQ + δW. Sur un cycle fermé, ∮dU = 0 ⇒ Q + W = 0. Pour une transformation quasi-statique, δW = -P_ext dV. U est une fonction d'état; Q et W ne le sont pas.",
                "key_points": ["dU exacte, δQ et δW non exactes", "∮dU = 0 sur un cycle", "δW_qs = -P_ext dV"],
            },
        },
        "videos_slug": "thermo-1er-principe",
    },
    {
        "concept_slug": "algebre-diagonalisation",
        "course_id": "ENSAK-CP1-S2-01",
        "display_name": "Diagonalisation d'une matrice",
        "levels": {
            "beginner": {
                "explanation": "Diagonaliser A, c'est trouver une base où A devient diagonale D — que des nombres sur la diagonale. Le passage se fait via P : A = P·D·P⁻¹.",
                "key_points": ["A = P·D·P⁻¹", "P contient les vecteurs propres", "D contient les valeurs propres"],
            },
            "visual": {
                "explanation": "A déforme l'espace. Trouve les directions (vecteurs propres) que A étire sans tourner. Dans ces axes, A se résume à des étirements indépendants.",
                "key_points": ["Vecteurs propres = axes invariants", "Valeurs propres = étirements", "Si A symétrique réelle, P orthogonale"],
            },
            "advanced": {
                "explanation": "A ∈ Mₙ(K) diagonalisable ⇔ polynôme minimal scindé à racines simples sur K, ⇔ Σ dim(E_λᵢ) = n. Théorème spectral pour matrices hermitiennes.",
                "key_points": ["Critère du polynôme minimal", "Σ dim(E_λᵢ) = n", "Théorème spectral"],
            },
        },
        "videos_slug": "algebre-diagonalisation",
    },
    {
        "concept_slug": "analyse-limites",
        "course_id": "ENSAK-CP1-S1-02",
        "display_name": "Limites et continuité",
        "levels": {
            "beginner": {
                "explanation": "La limite de f en a, c'est la valeur dont s'approche f(x) quand x s'approche de a. Si f(a) existe et coïncide avec la limite, f est continue.",
                "key_points": ["lim_{x→a} f(x) = L", "Continuité ⇔ lim = f(a)", "Sinon : trou ou saut"],
            },
            "visual": {
                "explanation": "Trace la courbe sans lever le crayon : c'est continu. La limite, c'est où la courbe ‘pointe’ quand on s'approche de a, indépendamment de f(a).",
                "key_points": ["Continu = un seul trait", "Limite = ‘flèche’", "Lim gauche ≠ lim droite ⇒ saut"],
            },
            "advanced": {
                "explanation": "(ε,δ) : ∀ε>0, ∃δ>0, |x−a|<δ ⇒ |f(x)−L|<ε. Théorèmes : composition, gendarmes, valeurs intermédiaires sur compact.",
                "key_points": ["Définition (ε,δ)", "Théorème des gendarmes", "TVI sur compact"],
            },
        },
        "videos_slug": "analyse-limites",
    },
    {
        "concept_slug": "analyse-series",
        "course_id": "ENSAK-CP1-S2-02",
        "display_name": "Séries numériques — convergence",
        "levels": {
            "beginner": {
                "explanation": "Σuₙ converge si la somme partielle s'approche d'un nombre fini. Si uₙ ↛ 0, la série diverge.",
                "key_points": ["Série = somme infinie", "uₙ ↛ 0 ⇒ divergence", "Convergence ⇒ valeur finie"],
            },
            "visual": {
                "explanation": "Pas de plus en plus petits : si ils rétrécissent assez vite (1, 1/2, 1/4...), la distance totale est finie. Sinon, infini.",
                "key_points": ["Σ 1/2ⁿ converge (=2)", "Σ 1/n diverge", "Vitesse de décroissance compte"],
            },
            "advanced": {
                "explanation": "Critères : comparaison, équivalents, d'Alembert, Cauchy, Riemann (Σ 1/nᵅ converge ⇔ α>1), Leibniz pour séries alternées.",
                "key_points": ["d'Alembert / Cauchy", "Riemann : α > 1", "Leibniz pour alternées"],
            },
        },
        "videos_slug": "analyse-series",
    },
    {
        "concept_slug": "electrostatique-gauss",
        "course_id": "ENSAK-CP1-S1-04",
        "display_name": "Théorème de Gauss",
        "levels": {
            "beginner": {
                "explanation": "Le flux du champ E à travers une surface fermée vaut Q_int / ε₀. Pas besoin de calculer E partout : juste la charge à l'intérieur.",
                "key_points": ["∮ E·dS = Q_int / ε₀", "Surface de Gauss arbitraire", "Idéal avec symétries"],
            },
            "visual": {
                "explanation": "Lignes de champ comme piquants d'oursin. Le ‘nombre’ traversant une bulle ne dépend que de la charge intérieure, pas de la forme de la bulle.",
                "key_points": ["Lignes de champ = piquants", "Bulle = surface de Gauss", "Forme indifférente"],
            },
            "advanced": {
                "explanation": "∮_∂V E·dS = (1/ε₀) ∫_V ρ dV. Forme locale : ∇·E = ρ/ε₀. Choix de surface adaptée aux symétries du problème.",
                "key_points": ["∇·E = ρ/ε₀", "Symétries → choix de surface", "Discontinuité E_n = σ/ε₀"],
            },
        },
        "videos_slug": "electrostatique-gauss",
    },
    {
        "concept_slug": "mecanique-newton",
        "course_id": "ENSAK-CP1-S1-05",
        "display_name": "Lois de Newton",
        "levels": {
            "beginner": {
                "explanation": "1) Sans force, vitesse constante (inertie). 2) F = ma. 3) Action = réaction. Bases de la mécanique classique.",
                "key_points": ["1ʳᵉ : inertie", "2ᵉ : F = ma", "3ᵉ : action ↔ réaction"],
            },
            "visual": {
                "explanation": "Pousse un chariot : plus tu pousses, plus il accélère (loi 2). Arrête : il continue à vitesse constante (loi 1). Tu pousses, il te pousse (loi 3).",
                "key_points": ["Pousser = accélérer", "Arrêter = vitesse constante", "Réaction opposée"],
            },
            "advanced": {
                "explanation": "ΣF_ext = m·a en référentiel galiléen. Action-réaction : F_{A→B} = -F_{B→A}, points d'application différents. En non-galiléen : forces d'inertie.",
                "key_points": ["PFD en galiléen", "Forces d'inertie sinon", "Théorème du moment cinétique"],
            },
        },
        "videos_slug": "mecanique-newton",
    },
    {
        "concept_slug": "optique-lentilles-minces",
        "course_id": "ENSAK-CP1-S2-04",
        "display_name": "Lentilles minces — formules de conjugaison",
        "levels": {
            "beginner": {
                "explanation": "Une lentille mince fait converger ou diverger la lumière. Position de l'image : 1/p' − 1/p = 1/f'. Grandissement : γ = p'/p.",
                "key_points": ["1/p' − 1/p = 1/f'", "Convention algébrique", "γ = p'/p"],
            },
            "visual": {
                "explanation": "Trace 3 rayons : parallèle à l'axe (passe par F'), centre optique (non dévié), foyer F (ressort parallèle). Leur intersection = image.",
                "key_points": ["3 rayons remarquables", "Centre optique non dévié", "F et F' = foyers"],
            },
            "advanced": {
                "explanation": "Vergence V = 1/f'. Lentilles accolées : V_total = ΣVᵢ. Conditions de Gauss : rayons paraxiaux. Formule de Newton : f f' = AF · A'F'.",
                "key_points": ["Vergence additive", "Conditions de Gauss", "Formule de Newton"],
            },
        },
        "videos_slug": "optique-lentilles-minces",
    },
    {
        "concept_slug": "algo-recursivite",
        "course_id": "ENSAK-CP1-S2-06",
        "display_name": "Récursivité en Python",
        "levels": {
            "beginner": {
                "explanation": "Une fonction récursive s'appelle elle-même sur un cas plus petit, jusqu'au cas de base. Exemple : factorielle(n) = n × factorielle(n−1), avec factorielle(0) = 1.",
                "key_points": ["Cas de base obligatoire", "Appel sur cas plus petit", "Convergence vers le cas de base"],
            },
            "visual": {
                "explanation": "Matriochka : ouvre la grande, tu trouves une moyenne, ouvre-la... jusqu'à la dernière. Puis tu refermes en empilant les résultats.",
                "key_points": ["Pile d'exécution", "Cas de base = dernière matriochka", "Retour : on combine"],
            },
            "advanced": {
                "explanation": "Pile d'appel limitée (~1000 par défaut). @lru_cache pour mémoïser (Fibonacci O(2ⁿ) → O(n)). Récursivité ↔ itération via pile explicite.",
                "key_points": ["RecursionError si trop profond", "@lru_cache", "Conversion en itératif"],
            },
        },
        "videos_slug": "algo-recursivite",
    },
    {
        "concept_slug": "chimie-equilibre",
        "course_id": "ENSAK-CP2-S3-05",
        "display_name": "Équilibres chimiques",
        "levels": {
            "beginner": {
                "explanation": "Une réaction peut s'arrêter avant complétion : équilibre. La constante K mesure la position. K grand = beaucoup de produits.",
                "key_points": ["v_directe = v_inverse", "K = [produits]/[réactifs]^coeffs", "K dépend de T"],
            },
            "visual": {
                "explanation": "Foule passant entre deux salles. À l'équilibre, les effectifs sont stables, mais le flux continue. K = rapport des effectifs.",
                "key_points": ["Équilibre dynamique", "Le Chatelier : compensation", "K dépend de T seulement"],
            },
            "advanced": {
                "explanation": "ΔG = ΔG° + RT ln(Q). À l'équilibre, ΔG = 0 ⇒ K = exp(−ΔG°/RT). Le Chatelier : T, P, C déplacent l'équilibre.",
                "key_points": ["ΔG° = −RT ln K", "Q vs K", "Le Chatelier"],
            },
        },
        "videos_slug": "chimie-equilibre",
    },
    {
        "concept_slug": "proba-bayes",
        "course_id": "ENSAK-CP2-S4-02",
        "display_name": "Théorème de Bayes",
        "levels": {
            "beginner": {
                "explanation": "Bayes : P(A|B) = P(B|A)·P(A) / P(B). Comment mettre à jour une probabilité quand on a une nouvelle info.",
                "key_points": ["P(A|B) = P(B|A)·P(A) / P(B)", "A priori vs a posteriori", "Inverse une conditionnelle"],
            },
            "visual": {
                "explanation": "Test médical à 99% de sensibilité, maladie rare (1‰) : un test positif ne donne que ~9% de chance d'être malade. La rareté écrase la précision.",
                "key_points": ["Prévalence compte énormément", "Faux positifs explosent si rare", "Bayes redresse l'intuition"],
            },
            "advanced": {
                "explanation": "P(Aᵢ|B) = P(B|Aᵢ)·P(Aᵢ) / Σⱼ P(B|Aⱼ)·P(Aⱼ). Inférence bayésienne : posterior ∝ likelihood × prior. Familles conjuguées.",
                "key_points": ["Posterior ∝ Likelihood × Prior", "Familles conjuguées", "MAP"],
            },
        },
        "videos_slug": "proba-bayes",
    },
    {
        "concept_slug": "signal-fourier",
        "course_id": "ENSAK-CP2-S4-03",
        "display_name": "Transformée de Fourier discrète",
        "levels": {
            "beginner": {
                "explanation": "La TFD décompose un signal en fréquences pures. Utile pour analyser, débruiter, compresser.",
                "key_points": ["Temps → fréquences", "X[k] = Σ x[n]·e^(−2iπkn/N)", "TFD inversible"],
            },
            "visual": {
                "explanation": "Plusieurs notes au piano simultanément : la TFD distingue chaque fréquence. Spectre = barres aux fréquences présentes, hauteur = amplitude.",
                "key_points": ["Spectre = ingrédients fréquentiels", "Pic = fréquence dominante", "Bruit = énergie partout"],
            },
            "advanced": {
                "explanation": "FFT (Cooley-Tukey) : O(N log N) au lieu de O(N²). Parseval : énergie temporelle = énergie spectrale. Shannon-Nyquist : fₛ ≥ 2·f_max.",
                "key_points": ["FFT O(N log N)", "Parseval", "Shannon-Nyquist"],
            },
        },
        "videos_slug": "signal-fourier",
    },
    {
        "concept_slug": "electronique-amplificateur-op",
        "course_id": "ENSAK-CP2-S4-05",
        "display_name": "Amplificateur opérationnel — montages de base",
        "levels": {
            "beginner": {
                "explanation": "L'AOP amplifie V+−V−. En boucle fermée avec rétroaction négative, V+ ≈ V−. Inverseur : gain = −R₂/R₁. Non-inverseur : gain = 1+R₂/R₁.",
                "key_points": ["V+ ≈ V−", "Inverseur : −R₂/R₁", "Non-inverseur : 1+R₂/R₁"],
            },
            "visual": {
                "explanation": "Robinet égalisant deux niveaux d'eau (V+ et V−) en ajustant sa sortie. Les résistances règlent comment la sortie agit sur V−.",
                "key_points": ["AOP cherche V+ = V−", "Rétroaction négative = stabilité", "Sans rétro : comparateur"],
            },
            "advanced": {
                "explanation": "AOP idéal : gain BO infini, R_e ∞, R_s 0, BP ∞. Réel : slew-rate, BP finie (gain·BP = constante), offset, biais. Stabilité : Nyquist.",
                "key_points": ["Hypothèses idéales", "Produit gain-bande", "Slew-rate, offset"],
            },
        },
        "videos_slug": "electronique-amplificateur-op",
    },
]

for fx in EXPLAIN:
    write(("explain", f"{fx['concept_slug']}.json"), fx)

# Generic fallback used when slug doesn't match.
write(
    ("explain", "_fallback.json"),
    {
        "concept_slug": "_fallback",
        "display_name": "Concept hors catalogue",
        "levels": {
            "beginner": {
                "explanation": "Voici une explication générale du concept demandé. Pour une réponse adaptée à ton niveau, sélectionne un concept dans le catalogue ENSAK ou contacte ton enseignant.",
                "key_points": ["Concept reformulé", "Exemple typique", "Erreur fréquente à éviter"],
            },
            "visual": {
                "explanation": "Concept hors catalogue de démo. Une version visuelle adaptée à ton niveau sera générée par le LLM en production.",
                "key_points": ["Schéma type à venir", "Analogie visuelle", "Représentation concrète"],
            },
            "advanced": {
                "explanation": "Concept hors catalogue de démo. La version avancée s'appuierait sur la formulation rigoureuse du sujet.",
                "key_points": ["Définition formelle", "Théorème ou identité clé", "Cas limite"],
            },
        },
        "videos_slug": None,
    },
)


# ─── OCR (4) ─────────────────────────────────────────────────────────────────

OCR: list[dict] = [
    {
        "fixture_slug": "td-thermo-handwritten",
        "course_id": "ENSAK-CP1-S2-05",
        "ocr_status": "OK",
        "page_count": 1,
        "extracted_text": (
            "TD 3 — Application du 1er principe\n\n"
            "Énoncé : Une mole de gaz parfait monoatomique subit une transformation isobare "
            "de l'état (T1 = 300 K, P = 1 atm) à T2 = 450 K.\n\n"
            "1) Calculer la chaleur Q reçue par le gaz.\n"
            "2) Calculer le travail W échangé.\n"
            "3) En déduire ΔU et vérifier ΔU = Q + W.\n\n"
            "Indication : pour un gaz parfait monoatomique, Cp = 5R/2 et Cv = 3R/2."
        ),
        "indexed_concepts": ["thermo-1er-principe"],
        "confidence": 0.94,
        "processing_ms": 1180,
    },
    {
        "fixture_slug": "exam-algebre-2024",
        "course_id": "ENSAK-CP1-S2-01",
        "ocr_status": "OK",
        "page_count": 2,
        "extracted_text": (
            "Examen final 2024 — Algèbre linéaire\n\n"
            "Exercice 1 : Soit A = [[2, 1], [0, 3]]. \n"
            "1) Déterminer les valeurs propres de A.\n"
            "2) Donner une base de vecteurs propres et écrire A = P·D·P⁻¹.\n"
            "3) En déduire Aⁿ pour tout entier n ≥ 1."
        ),
        "indexed_concepts": ["algebre-diagonalisation"],
        "confidence": 0.91,
        "processing_ms": 1340,
    },
    {
        "fixture_slug": "notes-chimie-equilibre",
        "course_id": "ENSAK-CP2-S3-05",
        "ocr_status": "OK",
        "page_count": 1,
        "extracted_text": (
            "Chapitre 4 — Équilibres chimiques\n\n"
            "À température fixée, une réaction réversible atteint un état d'équilibre où "
            "les concentrations restent stables. La constante d'équilibre K dépend uniquement "
            "de T. Si on perturbe le système (variation de T, P, ou C), il évolue pour minimiser "
            "la perturbation (loi de Le Chatelier)."
        ),
        "indexed_concepts": ["chimie-equilibre"],
        "confidence": 0.96,
        "processing_ms": 980,
    },
    {
        "fixture_slug": "td-algo-recursivite",
        "course_id": "ENSAK-CP1-S2-06",
        "ocr_status": "OK",
        "page_count": 1,
        "extracted_text": (
            "TD 4 — Récursivité\n\n"
            "Exercice 1 : Écrire une fonction récursive `factorielle(n)` qui calcule n!.\n"
            "Exercice 2 : Écrire `fibonacci(n)` puis comparer son temps d'exécution avec une "
            "version mémoïsée (`@lru_cache`).\n"
            "Exercice 3 : Convertir la fonction du 1) en version itérative."
        ),
        "indexed_concepts": ["algo-recursivite"],
        "confidence": 0.93,
        "processing_ms": 1090,
    },
]
for fx in OCR:
    write(("ocr", f"{fx['fixture_slug']}.json"), fx)


# ─── Videos (6) ──────────────────────────────────────────────────────────────

VIDEOS: list[dict] = [
    # `query` drives YouTube Data API search.list at runtime — hand-tuned
    # French phrasing that surfaces real popular educational videos. The
    # `videos[]` list is the offline fallback if the API call fails.
    # IDs verified live on YouTube via search + oEmbed (2026-05-10).
    # Channel names sourced from search snippets; durations omitted intentionally
    # — accurate durations require the YouTube Data API. The frontend hides the
    # duration pill when null. Rebuild with the API key once available to
    # populate `duration_sec` and `view_count`.
    {
        "concept_slug": "thermo-1er-principe",
        "query": "premier principe thermodynamique cours",
        "videos": [
            {"title": "Premier principe de la thermodynamique — transfert thermique",
             "channel": "Yvan Pouchat",
             "url": "https://www.youtube.com/watch?v=TyPyVLFxZME"},
            {"title": "Premier principe thermodynamique — transfert thermique",
             "channel": "Physique Chimie au Lycée",
             "url": "https://www.youtube.com/watch?v=0PC5CaU0jtg"},
            {"title": "Thermodynamique — Premier principe (cours complet)",
             "channel": "Cours de Physique",
             "url": "https://www.youtube.com/watch?v=2q7diLsIkBQ"},
        ],
    },
    {
        "concept_slug": "algebre-diagonalisation",
        "query": "diagonalisation matrice cours exercice",
        "videos": [
            {"title": "Diagonaliser une matrice 3×3 — exercice (Maths Spé)",
             "channel": "Maths-Et-Tiques",
             "url": "https://www.youtube.com/watch?v=EUtdnH4jQpo"},
            {"title": "Comment diagonaliser une matrice 3×3 — partie 3",
             "channel": "Méthode Maths",
             "url": "https://www.youtube.com/watch?v=jDH88je2Vf8"},
            {"title": "Exercice corrigé — polynôme caractéristique et valeurs propres",
             "channel": "Maths Express",
             "url": "https://www.youtube.com/watch?v=300lX-fnIEg"},
        ],
    },
    {
        "concept_slug": "algo-recursivite",
        "query": "récursivité python cours",
        "videos": [
            {"title": "Bac Informatique — La Récursivité (Cours Algorithmique)",
             "channel": "Bac Informatique",
             "url": "https://www.youtube.com/watch?v=KMN-Uodr5Ns"},
        ],
    },
    {
        "concept_slug": "proba-bayes",
        "query": "théorème de bayes probabilité cours",
        "videos": [
            {"title": "Théorème de Bayes",
             "channel": "Maths-Sup-Spé",
             "url": "https://www.youtube.com/watch?v=NYWnaKs3iu0"},
            {"title": "Comprendre le Théorème de Bayes — application pratique",
             "channel": "Maths Concrètes",
             "url": "https://www.youtube.com/watch?v=xzCtZLiuCL8"},
            {"title": "Formule de Bayes — cours et démonstration",
             "channel": "Cours Probabilités",
             "url": "https://www.youtube.com/watch?v=gHYM7l9UzN8"},
        ],
    },
    {
        "concept_slug": "signal-fourier",
        "query": "transformée de fourier discrète cours",
        "videos": [
            {"title": "Cours sur la Transformée de Fourier",
             "channel": "Cours d'Analyse",
             "url": "https://www.youtube.com/watch?v=krdZu52HVn0"},
            {"title": "Transformée de Fourier — définition et exercice",
             "channel": "Maths PSI/MP",
             "url": "https://www.youtube.com/watch?v=q9BqsTxruyM"},
            {"title": "Bilan TFD (Transformée de Fourier discrète) et FFT",
             "channel": "Signal & Systèmes",
             "url": "https://www.youtube.com/watch?v=vBxzdheShAY"},
        ],
    },
    {
        "concept_slug": "optique-lentilles-minces",
        "query": "lentilles minces formule conjugaison physique",
        "videos": [
            {"title": "Formule de conjugaison des lentilles minces",
             "channel": "Physique Chimie au Lycée",
             "url": "https://www.youtube.com/watch?v=I15WZLfiD_g"},
            {"title": "Les lentilles minces — définitions et formule de conjugaison",
             "channel": "Optique Géométrique",
             "url": "https://www.youtube.com/watch?v=k9WBHbcKt7k"},
            {"title": "Lentilles minces — formule de conjugaison, foyers, vergence",
             "channel": "Cours d'Optique",
             "url": "https://www.youtube.com/watch?v=JaDxU5x5_88"},
        ],
    },
]

# Search-only entries for the 6 explainer concepts that didn't have hand-curated
# fallback videos. With a YouTube API key these surface live search results.
SEARCH_ONLY = [
    ("analyse-limites", "limite continuité fonction cours"),
    ("analyse-series", "séries numériques convergence cours"),
    ("electrostatique-gauss", "théorème de gauss électrostatique"),
    ("mecanique-newton", "lois de newton mécanique cours"),
    ("chimie-equilibre", "équilibre chimique constante cours"),
    ("electronique-amplificateur-op", "amplificateur opérationnel montage cours"),
]
for slug, query in SEARCH_ONLY:
    VIDEOS.append({"concept_slug": slug, "query": query, "videos": []})

for fx in VIDEOS:
    write(("videos", f"{fx['concept_slug']}.json"), fx)

# Fallback for unknown video slug.
write(
    ("videos", "_fallback.json"),
    {
        "concept_slug": "_fallback",
        "videos": [
            {"title": "ENSAK — vue d'ensemble du cycle préparatoire",
             "channel": "ENSAK Officiel", "url": "https://www.youtube.com/results",
             "duration_sec": 360, "score": 0.5},
        ],
    },
)


print(f"Wrote {len(EXPLAIN)} explainer + 1 fallback")
print(f"Wrote {len(OCR)} OCR fixtures")
print(f"Wrote {len(VIDEOS)} video fixtures + 1 fallback")
