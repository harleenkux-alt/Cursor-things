# Inclusive Audit

A professional **accessibility & inclusive-design auditor** for Figma. Select any
frame, click **Analyze Screen**, and get a comprehensive report — an overall
accessibility score, per-category grades, detected issues with WCAG references,
clickable "Locate" actions, applicable fixes, and a full color inventory
inspired by [inclusivecolors.com](https://www.inclusivecolors.com).

It's not another contrast checker. It runs **11 independent analyzers** across
color, typography, components, interaction, layout, motion, inclusive language,
cognitive load, and content — like having an accessibility consultant review your
whole design system.

> Runs **100% offline**. No design data ever leaves Figma.

---

## Features

### Experience Accessibility (disability & accessibility simulator)

Preview how users with different accessibility needs may experience a design.
Select a frame → **Run Accessibility Simulation** → explore tabs:

- **Visual** — live, side-by-side Original vs Simulation rendered on an in-plugin
  canvas (the Figma design is never modified). Simulate Low Vision, Cataracts,
  Glaucoma, Macular Degeneration, Tunnel Vision, Diabetic Retinopathy, Retinitis
  Pigmentosa, Blurred Vision, Reduced Contrast — plus **8 color-vision
  deficiencies** (protan/deutan/tritan -opia & -omaly, achromatopsia,
  achromatomaly) using accepted transformation matrices. Zoom 100–300%, key
  color-pair pass/warning/fail checks, and a non-destructive dyslexia-friendly
  type preview.
- **Motor** — touch-target size, control spacing, and complex/hover/drag gesture
  reliance with pass/warning/fail per control.
- **Hearing** — detects video/audio/notification elements and flags missing
  captions/transcripts/visual feedback.
- **Screen Reader** — simulated reading order with inferred role + accessible
  name; Previous/Next steps through elements and selects the matching Figma node.
- **Keyboard** — derived tab/focus order with highlight path; flags hover-only
  controls, tiny targets, and potential focus traps.
- **Cognitive** — heuristic (not a disability simulation) of reading level,
  reading time, density, primary/secondary actions, navigation/form complexity,
  cognitive load, and distraction.
- **Motion** — parallax, flashing, loops, and large/auto transitions with
  reduced-motion recommendations.
- **Summary** — an Accessibility Experience Score with a radar chart across all
  categories, issue count, and top recommendations.

> Simulations are clearly labeled as **educational approximations** — the plugin
> never claims to replicate an individual's real experience.

### Accessibility Audit

- **Overall score, grade & progress ring** with per-category breakdown.
- **11 analyzers**: Contrast, Color System, Typography, Spacing & Grid, Layout &
  Structure, Components, Interaction, Motion, Inclusive Language, Cognitive Load,
  Images & Media.
- **Issue cards** with severity, WCAG reference, affected layers, a **Locate**
  button (selects & zooms to the node in Figma), and **fix suggestions** —
  several of which can be applied automatically.
- **Color Inventory** dashboard: every color grouped by role (primary, semantic,
  neutral, text, surface, border…) with HEX, RGB, contrast vs white/black,
  nearest-neighbor contrasts, usage count, WCAG rating, and suggested
  accessible replacements.
- **Export** to PDF (print-ready HTML), JSON, and CSV.
- **Settings**: WCAG 2.1/2.2, AA/AAA target, minimum font size, minimum touch
  target, language, and dark mode (persisted via Figma client storage).
- **Performance**: analyzes 500+ layers in well under 5 seconds; heavy work runs
  off the render path and yields to keep the UI responsive.

---

## Tech stack

TypeScript · React 18 · Figma Plugin API · Vite · TailwindCSS · Radix UI ·
Lucide Icons · Zustand · Framer Motion · Vitest.

---

## Architecture

The plugin is split into the two contexts every Figma plugin has, connected by a
**typed message bridge**:

```
Figma Sandbox (main thread)                    Plugin UI (iframe)
──────────────────────────                     ──────────────────
src/main/code.ts            ── snapshot ─▶      src/store  (zustand)
  ├─ extractor.ts   builds  ◀── analyze ──         ├─ core/analysisRunner
  │   a serializable            locate            │    ├─ analyzers/*  (pure)
  │   SceneSnapshot            apply-fix          │    ├─ core/scorer
  └─ commands.ts    locate/apply                  │    └─ core/reportGenerator
                                                  └─ components/*  (React UI)
```

**Key idea:** the sandbox only *extracts a plain-object snapshot* of the selected
frame (`src/models/auditNode.ts`) and executes imperative commands. All analysis
is performed on that snapshot by **pure, framework-free analyzers** in the UI
thread. This makes every analyzer independently unit-testable without a running
Figma instance, and keeps the sandbox thin.

### Folder structure

```
src/
  main/         Figma sandbox: entry, node extractor, frame export, commands
  models/       Domain models (AuditNode snapshot, Severity)
  types/        Shared types: analysis, experience, messages, settings
  utils/        Pure helpers: color/WCAG math, readability, geometry
  analyzers/    One file per audit analyzer + base contract + registry
  simulations/  Experience engine: color matrices, canvas renderer, and the
                visual/color/motor/hearing/screen-reader/keyboard/cognitive/
                motion modules + summary generator
  core/         Orchestration: analysisRunner, scorer, reportGenerator
  services/     figmaBridge, exportService, ai/ (future-ready)
  store/        Zustand store (app state + message handling)
  hooks/        Selector hooks
  components/   UI primitives, shell/nav, dashboard, audit, experience, settings
  ui/           React entry (main.tsx, App.tsx, ui.html, index.css)
  test/         Test factories
```

### Simulation architecture

The sandbox exports the selected frame as a PNG (capped to keep rendering fast)
and sends it plus the scene snapshot to the UI. Visual/CVD simulations are pure
canvas image processing (`simulations/canvas.ts` + `colorMatrices.ts`) applied
only inside the plugin preview — the design is never altered. The non-visual
modules (motor, hearing, screen reader, keyboard, cognitive, motion) are pure
functions over the snapshot, orchestrated by the **SimulationEngine** and
aggregated by the **SummaryGenerator**. Each module is independent and reusable,
mirroring the audit analyzers' open/closed design.

### The analyzer contract

Every analyzer implements the same small interface (`src/analyzers/base.ts`):

```ts
interface Analyzer {
  id: string;
  category: AnalysisCategory;
  title: string;
  icon: string;                              // Lucide icon name
  analyze(ctx: AnalyzerContext): AnalyzerResult;
}
```

Each returns a `score` (0–100), `issues`, `severity`, and `recommendations`. The
`AccessibilityScorer` aggregates sub-scores into category and overall grades; the
`ReportGenerator` serializes the result to JSON/CSV/HTML.

**Adding an analyzer** is a single, isolated change: implement the contract and
append it to the registry in `src/analyzers/index.ts`. The runner, scorer,
report, and UI pick it up automatically.

---

## Getting started

```bash
npm install
npm run build      # typechecks, then builds dist/ui.html + dist/code.js
```

Then in the Figma desktop app:

1. **Plugins → Development → Import plugin from manifest…**
2. Select this repo's `manifest.json`.
3. Select a frame on the canvas and run **Inclusive Audit**.

### Scripts

| Script              | Description                                        |
| ------------------- | -------------------------------------------------- |
| `npm run build`     | Typecheck + build UI and sandbox bundles into `dist/` |
| `npm run build:ui`  | Build the UI (`dist/ui.html`, single self-contained file) |
| `npm run build:main`| Build the sandbox bundle (`dist/code.js`)          |
| `npm run typecheck` | Strict TypeScript check (no emit)                  |
| `npm test`          | Run the Vitest suite                               |
| `npm run dev`       | Rebuild the UI on change                           |

---

## Scoring

- Each analyzer returns a 0–100 sub-score derived from its issues, penalized by
  severity (`critical → info`) with logarithmic damping so many minor issues
  don't unfairly collapse the score.
- **Category scores** are averages of the analyzers feeding that category.
- The **overall score** is a weighted average of categories (color, typography,
  and interaction are weighted higher). Grades map: `AAA ≥95`, `AA ≥85`, `A ≥75`,
  `B ≥65`, `C ≥50`, else `F`.

Severity color coding: **critical** red · **high** orange · **medium** yellow ·
**low** blue · **info** green.

---

## Future-ready: AI

The codebase is structured so AI features slot in without touching analyzers or
UI. `src/services/ai/` defines an `AiProvider` interface for:

- AI accessibility explanations
- Rewriting content into plain language
- AI color-palette suggestions
- Automatic remediation
- An accessibility assistant chat grounded in the report

A `NullAiProvider` ships by default (`available: false`). Register a real
provider with `registerAiProvider(...)` once available; enable
`networkAccess` in `manifest.json` if the provider is networked.

---

## Notes & limitations

- Figma has no native "alt text" field; the Image analyzer treats descriptive
  **layer names** as the alt-text hand-off and flags generic names.
- Contrast uses the effective background resolved by walking up the layer tree
  (falling back to white). Text over images/gradients is flagged as
  unpredictable rather than assigned a precise ratio.
- Poppins is the intended typeface; because plugins run without network access,
  the UI falls back to the system font stack if Poppins isn't installed locally.

## License

MIT
