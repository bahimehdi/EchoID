# Web Console — Redesign & Insights Plan

This is a **plan**, not code. It captures every change you asked for so the
work can be sequenced cleanly. Each section names the files to touch and the
shape of the deliverable.

---

## 1. Visual parity with the mobile app

### Goal
The mobile design system (`frontend/lib/theme.ts`) sets the look. The web
should feel like the **same product**, not a separate app. Port the tokens
and the same component vocabulary — Card, Badge, ProgressBar, Donut, soft
white surfaces on `#F4F4F8` background, UIT navy `#1E3A8A`, accent orange
for warnings, accent green for "validé", same rounded 16 px cards with soft
shadow, same typography hierarchy (very bold `~32 pt` headings, uppercase
small section labels with letter-spacing).

### Files to create
- `web/src/lib/theme.ts` — copy / adapt from `frontend/lib/theme.ts`. Convert
  React Native `StyleSheet` values to plain CSSProperties:
  - colors map → exported constants (same names)
  - radius → `'16px'` strings
  - shadow → `boxShadow: '0 4px 14px rgba(11,27,69,.06)'`
- `web/src/components/Card.tsx` — already exists, restyle with the new tokens.
  Add an optional `accent` prop ('primary' | 'orange' | 'red' | 'green') that
  becomes a 4 px left border, exactly like the mobile Card.
- `web/src/components/Badge.tsx` — same 5 tones as mobile: primary / orange
  / red / green / gray. Pill shape, uppercase 11 pt 700 weight.
- `web/src/components/Donut.tsx` — broken-arc donut. Reuse the SVG approach
  from `frontend/components/Donut.tsx`, swap React Native primitives for
  plain SVG.
- `web/src/components/Header.tsx` — top bar matching mobile: hamburger left
  (or back arrow on subroutes), centered "Portail UIT", avatar right.
- `web/src/components/StatCard.tsx` — replaces the inline `Kpi` in `Admin.tsx`,
  uses Card + a big bold value + uppercase label.

### Files to overhaul
- `web/index.html` — body background to `#F4F4F8` (light, not the current
  navy). Update `<title>` to "EchoID — Console UIT".
- `web/src/routes/Login.tsx` — match mobile login: UIT logo at the top, dual
  card (SSO button + email/password form), divider "ou", subtle shadow,
  light background. Drop the navy bg.
- `web/src/routes/Professor.tsx` and `Admin.tsx` — wrap in light theme,
  swap inline styles for the new components, mirror the section labels
  pattern (uppercase mini-titles above each card group).

### Suggested ordering
Theme → Card → Badge → Header → StatCard → restyle existing routes →
new charts (next sections) → Login.

### Estimated diff size
~12 files, ~600 lines of React + CSS. No backend touch.

---

## 2. Admin dashboard — more graphs + deeper insights

### Today
Five `—` KPI cards, one suggestions card, one Grafana iframe (broken).

### Tomorrow
Each panel below is a `<Card>` containing a chart **plus** a short insight
paragraph beneath it. Insights are not "5 students at risk" — they're
phrased like an analyst's takeaway with a recommended action and a
confidence number.

#### Panel A — Volume of explainer queries (line chart)
- **Library:** `chart.js` via `react-chartjs-2`. Already supports line / bar
  / pie / doughnut without extra dependencies.
- **Data shape (hardcode in a `web/src/lib/insightsFixtures.ts`):**
  ```ts
  { labels: ['Sem 38','Sem 39',...,'Sem 45'],
    datasets: [{ label: 'Requêtes explainer', data: [40, 62, 58, 91, 110, 145, 132, 168] }] }
  ```
- **Insight beneath:**
  > Le volume hebdomadaire a augmenté de **+72 % depuis 6 semaines**, signal
  > d'adoption croissante. Pic attendu fin novembre (période d'examens).
  > **Action :** prévoir une augmentation de quota AI Service de 1.5× pour
  > anticiper.

#### Panel B — Soumissions vs deadlines (bar chart, two series)
- Two series: "Rendus à temps" vs "Rendus en retard (1–2 j)".
- **Insight (this is the example you liked):**
  > Sur les 4 derniers TD, **63 %** des étudiants ont rendu en retard de 1–2
  > jours. La distribution est très étroite — ce n'est pas du retard
  > chronique mais un décalage de rythme cohort-wide. **Recommandation :**
  > pour les 3 prochains TD, déplacer la deadline de +48 h. Le taux de
  > rendu à temps est projeté à passer de 37 % → 88 %. *Confiance : 84 %.*

#### Panel C — Cohorte par école (stacked bar)
- ENSA / EST / FAC, 3 metrics each: actifs 7 j, à risque, taux de rendu.
- **Insight:**
  > ENSA mène en activité (47 actifs, 89 % taux de rendu) mais affiche **5
  > étudiants à risque** dont 4 en CP1-S2. **Action :** TD de soutien
  > dédié sur Thermo + Algèbre la semaine prochaine.

#### Panel D — Engagement par jour de la semaine (horizontal bar)
- 7 lignes Lun → Dim, longueur = sessions moyennes.
- **Insight:**
  > Pic le **dimanche soir** (révision avant la semaine), creux le mercredi
  > après-midi. **Action :** programmer les notifications "rappel deadline"
  > le dimanche 19 h plutôt que le mardi matin. Engagement push attendu :
  > 3.2× plus élevé.

#### Panel E — Top 5 concepts difficiles (donut + list)
- Donut représentant la répartition des requêtes par module (Thermo 28 %,
  Algèbre 21 %, Chimie 15 %, ...).
- **Insight:** garder ton exemple Bayes :
  > **ENSAK CP2 S4 — Probabilités et statistiques.** Mettre en avant un TD
  > sur le théorème de Bayes : 60 % des étudiants ont consulté l'explication,
  > contre 25 % d'engagement habituel. *Confiance : 81 %.*

### Files to touch
- `web/src/lib/insightsFixtures.ts` — NEW. Hardcode 5 datasets + 5
  insight-strings. Each insight is `{ headline, body, action, confidence }`.
- `web/src/components/InsightBlock.tsx` — NEW. Renders the insight under a
  chart with a colored left bar, headline, body, action line, and confidence
  pill. Visually echoes the suggestion cards already on the admin page.
- `web/src/components/charts/{LineChart,BarChart,DonutChart,StackedBar}.tsx`
  — NEW. Thin wrappers around `react-chartjs-2` with dark/light theme
  awareness baked in.
- `web/package.json` — add `chart.js@^4` and `react-chartjs-2@^5`.
- `web/src/routes/Admin.tsx` — replace KPI strip + suggestions card with
  the 5 panels A–E above, each `<Card> + <ChartXxx> + <InsightBlock>`.

### Backend? Optional.
The user said hardcode for now. Plan: when ready to make it real, the
fixtures move to `ai-service/recommendations.py` and the `Admin.tsx` stops
importing fixtures and instead calls existing `/api/admin/recommendations/*`
routes — the proxy is already wired.

---

## 3. Professor dashboard — cheating detection + reasoning

### 3.1 Restrict the school filter
Today: `ENSA / EST / FAC / ALL`.
Wanted: **ENSA only** for the demo.

- File: `web/src/routes/Professor.tsx`
- Change: drop the chip row entirely, hardcode `school = 'ENSA'` as the
  fixed query param. Add a small subtitle on the page header
  *"Cohorte : ENSA — Cycle préparatoire"* so the scope is obvious.

### 3.2 At-risk students with per-student reasoning
Today: name + risk %.
Wanted: name + risk % + the **reason** (or top 2 reasons) the model flagged them.

#### Backend change
- File: `ai-service/recommendations.py`
- The `at_risk_students` endpoint adds a `reasons: list[str]` field per
  student. Drive it from the same features the model already uses:
  - `wd_trend` high → `"Charge Wd élevée (0.27)"`
  - `days_since_last_login` ≥ 7 → `"Connexion il y a 9 jours"`
  - `active_days_14d` ≤ 3 → `"Seulement 2 jours actifs sur 14"`
  - `explainer_calls` low → `"Aucune sollicitation de l'explainer cette semaine"`
- Pick the top 2 reasons by feature contribution to the logistic-regression
  z-score. Include them in the response.

#### Frontend change
- File: `web/src/routes/Professor.tsx`
- Each at-risk row becomes a small Card with: avatar circle (initials),
  name + school, risk pill, then a 2-line reason strip beneath. Same row
  height ~64 px, two reasons truncate with ellipsis if long.
- Empty state: *"Aucun étudiant à risque détecté cette semaine."*

### 3.3 NEW — Cheating cluster detection
Wanted: detect groups of students whose answers look mechanically identical
(same comments, same spacing, same variable names).

#### Pitch story
> Quand un examen Python est rendu sur Moodle, on calcule un **fingerprint
> stylistique** par soumission (commentaires, indentation, ordre des
> imports, choix de noms de variables) et on clustérise. Les étudiants dont
> le fingerprint a une distance ≤ 0.15 sont surfacés ensemble.

#### Implementation outline (no code yet)
- **Where the data lives (eventual):** new table
  `assignment_submissions(id, assignment_id, student_id, source_text, fingerprint, submitted_at)`.
- **Fingerprint computation (offline batch job, not real-time):**
  - Strip identifiers (rename `var1, var2, ...`), normalize whitespace.
  - Compute MinHash on (a) raw token n-grams and (b) AST-shape n-grams.
  - Distance = 1 − Jaccard estimate.
- **Cluster:** simple agglomerative clustering with linkage threshold 0.15.
- **API:** `GET /api/professor/cheating-clusters?assignmentId=...` returns
  `[{ clusterId, students: [{id, name}], avgSimilarity, evidence: [{type:'comments', detail:'...'}, ...] }]`.
- **Demo posture (today):** hardcode 1 cluster with 3 students into
  `ai-service/recommendations.py` and expose it via a new
  `GET /recommendations/cheating-clusters` endpoint, proxied by
  `AdminController` or a new `ProfessorController`.

#### UI
- New card on the professor dashboard titled
  *"Soumissions à examiner — similarité élevée"*.
- Each cluster: 3-up avatar stack (first letters of names), similarity
  meter (0–100 %), expandable list of evidence:
  > • Commentaires identiques aux lignes 12, 38, 47
  > • Même variable `total_pts` (rare dans le cohort, fréquence < 5 %)
  > • Soumissions dans une fenêtre de 11 minutes
- Action button *"Ouvrir les soumissions sur Moodle →"* (dummy link).

#### Insight beneath
> Trois étudiants présentent un fingerprint stylistique à **88 % similaire**
> sur le TP Python "Récursivité". Probabilité de coïncidence statistique
> < 1 %. **Action recommandée :** ouvrir un échange avec ces étudiants
> avant la prochaine évaluation.

### Files to touch
- `ai-service/recommendations.py` — add `at_risk_students` reasons field +
  new `cheating_clusters` endpoint with hardcoded data.
- `backend/.../AdminController.java` — add proxy passthrough for
  `cheating-clusters`.
- `web/src/routes/Professor.tsx` — drop ALL filter, expand at-risk rows
  with reasons, add cheating cluster card + insight.

---

## 4. Quick wins to do alongside

- **Remove the broken Grafana iframes from the demo path** until you wire
  up Grafana. They look ugly empty. Replace with a placeholder Card that
  says *"Grafana — voir l'analyse approfondie"* and links to the local
  Grafana URL when running. (The recent commit already added a hint
  paragraph; this finishes the job.)
- **Hide the score number in mobile** if the user said it looked generic;
  keep it for ranking only. (Already done — keep an eye on it.)
- **Web header**: add the same UIT logo and *"Portail UIT"* title used on
  mobile so the brand identity is unmistakable.

---

## Sequencing recommendation

If you record the demo soon, do them in this order — each step
self-contained, each ships value:

1. **Visual parity (Section 1)** — biggest perceptual win for the demo.
   ~half a day.
2. **Restrict school filter to ENSA + at-risk reasons (3.1, 3.2)** —
   ~2 hours total. Big credibility bump for the professor walkthrough.
3. **5-panel admin dashboard with insights (Section 2)** — ~4 hours.
   Replaces the empty KPI strip + lonely Grafana iframe with the strongest
   storytelling surface in the app.
4. **Cheating cluster panel (3.3)** — ~3 hours. The single most
   "Wow, this isn't ChatGPT" moment of the whole pitch.

Total: ~1.5 dev days for a full upgrade.

---

## What this plan is **not**

- A backend ML rewrite. The "real" cheating fingerprint pipeline lives on
  the post-competition roadmap. For the demo it's hardcoded fixtures with
  the right shape.
- A Grafana fix. Grafana stays in the docker-compose path and gets reborn
  when you re-enable that. The web dashboards now stand alone without it.
- A re-architecture. Same React Query, same proxy, same envelope —
  components and tokens replaced, routes mostly unchanged.
