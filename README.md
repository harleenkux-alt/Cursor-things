# Inclusive Design Simulator

A portfolio-grade accessibility simulation tool for inclusive product design. Designers upload interface screenshots and experience them through visual, cognitive, and motor condition simulations — then receive an accessibility scorecard and actionable design recommendations.

## Core value

Instead of telling designers *"This text contrast is poor,"* the tool lets them experience *"This is what your screen looks like to someone with cataracts."*

## MVP capabilities

- Drag-and-drop screenshot upload (PNG, JPG, WebP)
- Side-by-side comparison (original left, simulation right)
- Before/after reveal slider
- **Visual:** cataracts, glaucoma, low vision, protanopia, deuteranopia, tritanopia
- **Cognitive:** ADHD, dyslexia
- **Motor:** tremors, limited precision
- Screenshot-derived accessibility scorecard
- Design recommendations tied to the selected simulation
- Downloadable simulation output

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript, TailwindCSS |
| Backend | Next.js API routes |
| Image processing | Canvas API (client), Sharp (server metadata) |
| State | Zustand |
| UI | Shadcn-style components |

## Project structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # Sharp-backed image metadata API
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── comparison-panel.tsx   # Side-by-side + slider comparison
│   ├── image-uploader.tsx     # Drag-and-drop upload
│   ├── simulation-selector.tsx
│   ├── report-panel.tsx       # Accessibility scorecard
│   ├── recommendations-panel.tsx
│   └── ui/                      # Reusable UI primitives
├── lib/
│   ├── simulations/
│   │   ├── engine.ts          # Canvas simulation engine
│   │   ├── catalog.ts         # Simulation definitions
│   │   └── types.ts
│   └── accessibility/
│       ├── analyzer.ts        # Contrast, density, readability analysis
│       └── recommendations.ts # Design recommendations
└── store/
    └── use-simulator-store.ts # Zustand state management
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation checklist

Use these tests to verify simulations feel believable and research-grounded:

| Test | Upload | Expected result |
|------|--------|-----------------|
| Color blindness | Dashboard with red/green status | Green and red become difficult to distinguish |
| Cataracts | News website | Text harder to read, contrast decreases, details blur |
| Glaucoma | Dense dashboard | Center visible, edges darkened — not uniform darkening |
| ADHD | Page with ads, nav, content blocks | Attention pulled in multiple directions |
| Scorecard (good) | Large fonts, good spacing, high contrast | Few warnings |
| Scorecard (bad) | Small text, poor contrast, dense layout | Many warnings |

## Important product note

These simulations are approximations intended to build empathy and reveal design risks. They should **not** replace accessibility audits, WCAG testing, assistive technology testing, or research with disabled users.

## Deploy

Deploy to [Vercel](https://vercel.com) with zero configuration — the project is a standard Next.js app.
