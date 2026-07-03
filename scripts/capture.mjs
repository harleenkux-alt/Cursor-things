import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'media/frames');
mkdirSync(OUT, { recursive: true });

const CHROME = process.env.CHROME_PATH || '/usr/local/bin/google-chrome';
const DEMO_URL = 'file://' + resolve(ROOT, 'demo-dist/demo.html');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function clickByText(page, selector, text) {
  const ok = await page.evaluate(
    (sel, txt) => {
      const els = Array.from(document.querySelectorAll(sel));
      const el = els.find((e) => (e.textContent || '').trim().includes(txt));
      if (el) {
        el.scrollIntoView({ block: 'center' });
        el.click();
        return true;
      }
      return false;
    },
    selector,
    text,
  );
  if (!ok) console.warn(`  ! could not find "${text}" (${selector})`);
  return ok;
}

async function clickTab(page, name) {
  // Radix tabs activate on real pointer events (mousedown/focus), not a
  // synthetic .click(), so we issue a genuine mouse click at the tab's center.
  const rect = await page.evaluate((nm) => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const tab = tabs.find((t) => (t.textContent || '').trim() === nm);
    if (!tab) return null;
    tab.scrollIntoView({ block: 'nearest', inline: 'center' });
    const r = tab.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, name);
  if (!rect) {
    console.warn(`  ! tab "${name}" not found`);
    return false;
  }
  await page.mouse.click(rect.x, rect.y);
  const ok = true;
  // Wait until Radix marks it active.
  await page.waitForFunction(
    (nm) => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const tab = tabs.find((t) => (t.textContent || '').trim() === nm);
      return tab && tab.getAttribute('data-state') === 'active';
    },
    { timeout: 4000 },
    name,
  ).catch(() => console.warn(`  ! tab "${name}" did not activate`));
  return ok;
}

async function clickCategoryCard(page, label) {
  return page.evaluate((lbl) => {
    const cards = Array.from(document.querySelectorAll('[role="button"]'));
    const card = cards.find(
      (c) => (c.textContent || '').includes(lbl) && (c.textContent || '').includes('/100'),
    );
    if (card) {
      card.click();
      return true;
    }
    return false;
  }, label);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb'],
    defaultViewport: { width: 880, height: 720, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') console.log('  [page error]', m.text());
  });

  await page.goto(DEMO_URL, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.__demoReady === true', { timeout: 20000 });
  await sleep(600);

  let n = 0;
  const shot = async (name) => {
    const file = resolve(OUT, `${String(n).padStart(2, '0')}-${name}.png`);
    await page.screenshot({ path: file });
    console.log('  captured', file);
    n++;
  };

  const nav = async (label) => {
    await page.click(`[aria-label="${label}"]`);
    await sleep(700);
  };

  // 1. Dashboard
  await shot('dashboard');

  // 2. Accessibility Audit — Overview
  await nav('Accessibility Audit');
  await shot('audit-overview');

  // 3. Click the failing "Interaction" category → linked Sections detail
  await clickCategoryCard(page, 'Interaction');
  await sleep(900);
  await shot('audit-sections');

  // 4. Color Inventory
  await nav('Color Inventory');
  await sleep(400);
  await clickByText(page, 'button', '#'); // expand first swatch (hex label)
  await sleep(400);
  await shot('color-inventory');

  // 5. Experience Accessibility — Visual (compare)
  await nav('Experience Accessibility');
  await sleep(800);
  await shot('experience-visual');

  // 6. Pick a color-vision deficiency simulation
  await clickByText(page, 'button', 'Deuteranopia (no green)');
  await sleep(700);
  await shot('experience-cvd');

  // 7. Gallery of all impairments
  await clickByText(page, 'button', 'Gallery');
  await sleep(1600);
  await shot('experience-gallery');

  // 8. Screen Reader preview
  await clickTab(page, 'Screen Reader');
  await sleep(900);
  await shot('experience-screenreader');

  // 9. Summary radar
  await clickTab(page, 'Summary');
  await sleep(900);
  await shot('experience-summary');

  // 10. Reports
  await nav('Reports');
  await sleep(500);
  await shot('reports');

  await browser.close();
  console.log(`\nDone — ${n} frames in ${OUT}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
