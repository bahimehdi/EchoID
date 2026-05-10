# EchoID Nexus — Click-by-click demo script

**Total runtime:** ~10 minutes. Designed for a 3-act pitch (Student → Professor → Admin).

## Pre-flight (5 min before stage)

1. From repo root:
   ```bash
   docker compose -f infra/docker/docker-compose.dev.yml --env-file infra/env/.env up -d --build
   ```
2. Wait for all containers to go green (`docker compose -f infra/docker/docker-compose.dev.yml ps`).
3. Open browser tabs:
   - **Student app:** `http://localhost:19006`
   - **Professor / Admin dashboard:** `http://localhost:3000`
   - **Grafana:** `http://localhost:3001` (login `admin` / `admin`, skip change-password)
   - **Swagger:** `http://localhost:8080/swagger-ui.html`

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Student | `student.demo@uit.ac.ma` | `Demo!2026` |
| Professor | `prof.demo@uit.ac.ma` | `Demo!2026` |
| Admin | `admin.demo@uit.ac.ma` | `Demo!2026` |

## Act 1 — Student journey (≈ 4 min)

1. **Login** on the mobile app with `student.demo@uit.ac.ma`. Show the UIT logo + French UI.
2. **Home tab.** Point out 6 ENSAK courses, mixed Moodle / Google Classroom badges. *"Aggregated from two LMS sources — we don't replace them, we add a layer on top."*
3. **Workload tab.** Show the Wd score and the colored status pill. Tap a course in the breakdown. Show the 14-day trend bars.
4. **Explainer tab.** Type `Thermodynamique 1er principe`, pick **Visuel** level → tap **Expliquer**. Show the curated French explanation + 3 YouTube videos. *"No live AI for the demo — fixtures keyed by concept slug. Same shapes, swap-in ready."*
5. **OCR tab.** Pick any PDF/image (a phone photo works). Show the extracted French TD text + indexed concept tag. Tap nothing else — the indexed concept can deep-link back to the explainer in production.

## Act 2 — Professor view (≈ 3 min)

1. Switch tab to `http://localhost:3000`. Sign in with `prof.demo@uit.ac.ma`.
2. **Concept bottlenecks panel.** *"This is the cohort's confusion map — concepts where students hit the explainer most this month."* Switch the school chip to ENSA / EST / FAC.
3. **At-risk students panel.** Real ML — logistic regression on Wd trend + engagement + last-login. Color-coded risk pills. *"Catch the drop-off before mid-term, not after the exam."*
4. **Grafana iframe.** Show the daily concept-query timeseries + explanation-level pie. *"Same dashboard a teacher in Kénitra opens — provisioned as code, no manual setup."*

## Act 3 — Admin view (≈ 2 min)

1. Sign out, sign back in as `admin.demo@uit.ac.ma`.
2. **KPI strip.** 47 active students / 12 uploads / 5 at-risk / LMS + AI service operational.
3. **Intervention suggestions.** Read one of the cards — *"This isn't a dashboard, it's a recommendation engine. Confidence score + actionable French sentence."*
4. **Grafana admin board** in the iframe: cross-school active-students bar, daily notifications by trigger.

## Closing line

*"Three roles, one platform, real ML on real data. Built on top of the LMS your school already trusts. Demo runs offline — no API keys, no cloud dependencies."*

## Fallback playbook

| If… | Then |
|---|---|
| Mobile won't load | Open Swagger UI and walk endpoints; the JSON is the demo |
| Grafana iframe blocked | Open `http://localhost:3001` directly in a new tab |
| AI endpoint times out | The frontend shows an "Données indisponibles" pill, no crash. Refresh once, then move on |
| `docker compose up` fails | `docker compose down -v && docker compose up -d` resets the volume cleanly |
