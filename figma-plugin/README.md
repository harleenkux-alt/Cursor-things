# Inclusive Design Simulator — Figma Plugin

Run accessibility simulations directly on selected Figma frames.

## What it does

1. Select a **frame**, **component**, **instance**, **section**, or **group** on the canvas
2. The plugin exports it automatically as a PNG
3. You see:
   - Simulation categories (Visual, Cognitive, Motor)
   - Before / after comparison
   - Accessibility scorecard
   - Design recommendations

All simulation logic is shared with the web app (`src/lib/`).

## Build

From the repo root:

```bash
npm run figma:build
```

Or from this folder:

```bash
npm install
npm run build
```

Output is written to `figma-plugin/dist/`.

## Install in Figma

1. Open **Figma Desktop**
2. Go to **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin/dist/manifest.json`
4. Run **Plugins → Development → Inclusive Design Simulator**

## Usage

1. Select a single frame on the canvas
2. Open the plugin
3. Pick a simulation type from the category chips
4. Review the comparison, scorecard, and recommendations
5. Change selection to simulate a different frame instantly

## Development

Watch mode:

```bash
cd figma-plugin
npm run watch
```

Then reload the plugin in Figma after changes.

## Notes

- Exports at 2× scale for sharper simulation detail
- Analysis runs fully client-side (no server required)
- Select exactly one exportable layer at a time
