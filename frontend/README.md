# EchoID Mobile (Expo)

React Native + Expo (TypeScript) — student companion app for EchoID Nexus.

## Stack

- **Expo SDK 51** + **expo-router** — file-based navigation, native + web target.
- **TanStack Query** — server-state caching + retries.
- **Zustand** — local auth state.
- **expo-secure-store** — JWT persistence.
- **expo-document-picker** + **expo-notifications** — OCR upload + push.

## Run

```bash
npm install
npx expo start
```

Then `a` (Android), `i` (iOS), `w` (web), or scan the QR with Expo Go.

The app expects the EchoID backend on `http://localhost:8080`. For a physical device, set:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-LAN-IP>:8080 npx expo start
```

## Layout

```
app/
├── _layout.tsx           # root: providers + auth gate
├── index.tsx             # redirect to (auth) or (tabs) based on session
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/
    ├── _layout.tsx       # bottom tab bar
    ├── home.tsx          # course list (Moodle + GClassroom unified)
    ├── explainer.tsx     # concept input → /api/ai/explain + /api/ai/videos
    ├── upload.tsx        # OCR upload → /api/ai/ocr/upload
    ├── workload.tsx      # /api/students/{id}/workload + 7-day trend
    └── profile.tsx       # session info + sign out

lib/
├── api.ts                # axios + bearer interceptor + 401 refresh flow
├── auth.ts               # zustand store, secure-store persistence
├── config.ts             # API_BASE_URL resolution
└── types.ts              # CourseDTO, ExplainResponse, OcrResponse, …
```

## Conventions

- Every screen reads via TanStack Query. Mutations via `useMutation`.
- Auth tokens never live in component state — always go through `lib/auth.ts`.
- French content in fixtures matches ENSAK teaching language; UI strings are English for the jury demo.
