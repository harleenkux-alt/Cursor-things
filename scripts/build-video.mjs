import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync, rmSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FRAMES = resolve(ROOT, 'media/frames');
const TMP = resolve(ROOT, 'media/tmp');
const OUT = resolve(ROOT, 'media/inclusive-audit-demo.mp4');

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const BG = '0x0B1220';
const W = 1920;
const H = 1080;
const FPS = 30;
const T = 0.6; // crossfade seconds

/** Scenes: screenshot + caption. Keep captions colon-free for drawtext. */
const scenes = [
  { file: '00-dashboard.png', title: 'Inclusive Audit', sub: 'Accessibility and inclusive design, right inside Figma', dur: 3.6 },
  { file: '01-audit-overview.png', title: 'Accessibility Audit', sub: 'Overall score, grade and per-category breakdown', dur: 3.4 },
  { file: '02-audit-sections.png', title: 'Every issue, explained', sub: 'Tap a category to jump to detailed findings and fixes', dur: 3.6 },
  { file: '03-color-inventory.png', title: 'Color Inventory', sub: 'Contrast, usage and accessible replacements per token', dur: 3.4 },
  { file: '04-experience-visual.png', title: 'Experience Accessibility', sub: 'See your screen through different visual impairments', dur: 3.6 },
  { file: '05-experience-cvd.png', title: 'Color Vision Deficiency', sub: 'Eight CVD types using accepted transformation matrices', dur: 3.4 },
  { file: '06-experience-gallery.png', title: 'Compare at a glance', sub: 'The whole screen across every simulated impairment', dur: 4.2 },
  { file: '07-experience-screenreader.png', title: 'Screen Reader preview', sub: 'Reading order, roles and names, step by step', dur: 3.8 },
  { file: '08-experience-summary.png', title: 'Experience Score', sub: 'A radar across visual, motor, keyboard and more', dur: 3.6 },
  { file: '09-reports.png', title: 'Share the results', sub: 'Export a full report as PDF, JSON or CSV', dur: 3.6 },
];

const esc = (s) => s.replace(/'/g, "\u2019").replace(/:/g, '\\:');

function drawtext(text, size, color, y, bold) {
  return [
    `drawtext=fontfile=${bold ? FONT_BOLD : FONT}`,
    `text='${esc(text)}'`,
    `fontcolor=${color}`,
    `fontsize=${size}`,
    `x=110`,
    `y=${y}`,
  ].join(':');
}

console.log('Rendering segments…');
const segFiles = [];
scenes.forEach((scene, i) => {
  const seg = resolve(TMP, `seg${String(i).padStart(2, '0')}.mp4`);
  segFiles.push(seg);
  const filter = [
    `[0:v]scale=-2:812[ui]`,
    `[1:v][ui]overlay=(W-w)/2:206[bg]`,
    `[bg]${drawtext(scene.title, 56, 'white', 70, true)}[t1]`,
    `[t1]${drawtext(scene.sub, 28, '0x94A3B8', 142, false)}[t2]`,
    `[t2]${drawtext('Inclusive Audit  ·  Figma plugin', 22, '0x5B8DEF', 1030, true)}[out]`,
  ].join(';');

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loop', '1', '-t', String(scene.dur), '-i', resolve(FRAMES, scene.file),
      '-f', 'lavfi', '-t', String(scene.dur), '-i', `color=c=${BG}:s=${W}x${H}:r=${FPS}`,
      '-filter_complex', filter,
      '-map', '[out]',
      '-r', String(FPS),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
      seg,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
  console.log(`  seg ${i} (${scene.file})`);
});

console.log('Crossfading segments…');
// Build an xfade chain across all segments.
const inputs = [];
segFiles.forEach((f) => inputs.push('-i', f));

const parts = [];
let acc = scenes[0].dur;
let last = '0:v';
for (let i = 1; i < scenes.length; i++) {
  const offset = (acc - T).toFixed(3);
  const out = i === scenes.length - 1 ? 'vout' : `vx${i}`;
  parts.push(`[${last}][${i}:v]xfade=transition=fade:duration=${T}:offset=${offset}[${out}]`);
  last = out;
  acc = acc + scenes[i].dur - T;
}
const filterComplex = parts.join(';');

execFileSync(
  'ffmpeg',
  [
    '-y',
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-r', String(FPS),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
    '-movflags', '+faststart',
    OUT,
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

// Poster frame for the portfolio.
execFileSync(
  'ffmpeg',
  ['-y', '-i', OUT, '-frames:v', '1', '-q:v', '2', resolve(ROOT, 'media/poster.png')],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

rmSync(TMP, { recursive: true, force: true });
console.log(`\nDone → ${OUT}`);
