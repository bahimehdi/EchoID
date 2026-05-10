# Frontend assets

Drop the following PNG files into this folder. The app references them by path; if a file is missing, the screen falls back to a text-only header.

## Required (for the live demo)

| File | Source | Usage | Recommended size |
|---|---|---|---|
| `uit-logo.png` | Université Ibn Tofail official logo | Login + splash header | 512 × 512, transparent BG |
| `ensak-logo.png` | ENSA Kénitra (ENSAK) official logo | Login subheader, profile screen | 512 × 512, transparent BG |
| `icon.png` | App launcher icon | iOS / Android home screen | 1024 × 1024, opaque |
| `splash.png` | App splash | Cold-start splash | 1242 × 2436, navy bg `#0F172A` |
| `adaptive-icon.png` | Android adaptive icon foreground | Android adaptive launcher | 1024 × 1024, transparent |
| `favicon.png` | Web favicon | Expo web target | 48 × 48 |

## Optional

| File | Usage |
|---|---|
| `moodle-badge.png` | Course-card pill instead of "Moodle" text |
| `gclassroom-badge.png` | Course-card pill instead of "Classroom" text |

## How to wire a logo

Once you drop a file in, reference it via relative require:

```tsx
import { Image } from 'react-native';
<Image source={require('../../assets/uit-logo.png')} style={{ width: 80, height: 80 }} />
```

`expo-router` resolves these at bundle time. No extra config needed.

If you'd rather not use the official UIT/ENSAK logos until you have permission, leave the files absent — every screen has a text-only fallback.
