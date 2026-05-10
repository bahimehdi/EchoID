# EchoID Web Dashboards

Vite + React 18 + TypeScript — professor & admin console.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

The dev server proxies `/api/*` to `http://localhost:8080` (set `BACKEND_URL` env var to override).

## Routes

- `/login` — JWT-based; only `PROFESSOR` or `ADMIN` roles can sign in.
- `/professor` — concept bottlenecks (Recharts bar), at-risk students, Grafana iframe.
- `/admin` — KPI strip, intervention suggestions, Grafana iframe (admin board).

Role gating: `App.tsx` redirects on missing/unauthorised role; sessions persist in `localStorage`.

## Stack

- `react-router-dom` v6 — routing.
- `@tanstack/react-query` — server state.
- `recharts` — bar/line/pie charts.
- `axios` — HTTP, with bearer-token interceptor.

## Demo accounts

See [`docs/DEMO_SCRIPT.md`](../docs/DEMO_SCRIPT.md) at the repo root.

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the built bundle
```
