# Inclusive Audit — Portfolio content

Ready-to-use content for adding **Inclusive Audit** to a portfolio.

## Files

| File | Use |
| --- | --- |
| `inclusive-audit.html` | Standalone, self-contained **case-study page** (the click destination). Open it directly or drop it into a static site. |
| `card.html` | A **portfolio card** snippet. Put it in your projects grid; clicking it opens the case study. |
| `inclusive-audit.md` | Front-matter + Markdown version for MD/MDX-based portfolios (Astro, Next, Gatsby, etc.). |
| `assets/inclusive-audit-demo.mp4` | 30s walkthrough video captured from the live plugin UI. |
| `assets/poster.jpg` | Poster/thumbnail for the video and card. |
| `assets/*.jpg` | Optimized screenshots used in the case study gallery. |

## Wiring the click-through

The card links to `./inclusive-audit.html`. Adjust the `href` in `card.html` to match
your routing (e.g. `/work/inclusive-audit`). If your framework uses the Markdown file,
point the card/list item at the generated route for `inclusive-audit.md`.

```html
<!-- projects grid -->
<a href="/work/inclusive-audit"> ...card markup from card.html... </a>
```

## Regenerating the video & screenshots

The demo is produced from the **real plugin UI** (rendered with mock analyzer output)
via a headless Chrome capture, then assembled with ffmpeg:

```bash
npm run demo:build     # build the demo harness (real UI + mock data)
npm run demo:capture   # screenshot each scene with headless Chrome
npm run demo:video     # compose the captioned MP4 + poster
# or all three:
npm run demo
```

Outputs land in `media/`; copy the ones you want into `portfolio/assets/`.
Requires `ffmpeg` and a Chrome/Chromium binary (`CHROME_PATH` env to override the path).
