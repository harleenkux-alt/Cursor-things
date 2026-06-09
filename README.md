# Inclusive Design Simulator

A portfolio-grade AI accessibility concept built as a Next.js MVP. Designers can upload an interface screenshot and
experience it through visual, cognitive, and motor accessibility simulations.

## MVP capabilities

- Drag-and-drop screenshot upload
- Side-by-side before/after comparison slider
- Visual simulations: cataracts, glaucoma, low vision, protanopia, deuteranopia, tritanopia
- Cognitive simulations: ADHD and dyslexia
- Motor simulations: tremors and limited precision
- Screenshot-derived accessibility scorecard
- Design recommendations connected to the selected simulation
- Downloadable simulation output

## Tech stack

- Next.js, React, TypeScript
- TailwindCSS
- Zustand
- Canvas API for client-side simulations
- Sharp-backed API route for image metadata
- Shadcn-style reusable UI primitives

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Important product note

These simulations are approximations intended to build empathy and reveal design risks. They should not replace
accessibility audits, WCAG testing, assistive technology testing, or research with disabled users.
