import { describe, expect, it } from 'vitest';
import {
  BLACK,
  WHITE,
  contrastRatio,
  figmaToHex,
  hexToRgb,
  rateContrast,
  rgbToHex,
  suggestAccessibleColor,
} from './color';

describe('color utils', () => {
  it('computes max contrast between black and white as 21:1', () => {
    expect(contrastRatio(BLACK, WHITE)).toBe(21);
  });

  it('computes identical colors as 1:1', () => {
    expect(contrastRatio(WHITE, WHITE)).toBe(1);
  });

  it('matches the known WCAG value for #767676 on white (~4.54)', () => {
    const gray = hexToRgb('#767676');
    expect(contrastRatio(gray, WHITE)).toBeGreaterThanOrEqual(4.5);
  });

  it('round-trips hex <-> rgb', () => {
    expect(rgbToHex(hexToRgb('#005FCC'))).toBe('#005FCC');
  });

  it('converts figma normalized color to hex', () => {
    expect(figmaToHex({ r: 0, g: 0.372, b: 0.8, a: 1 })).toBe('#005FCC');
  });

  it('rates contrast correctly for small text', () => {
    expect(rateContrast(7.5, false)).toBe('AAA');
    expect(rateContrast(4.6, false)).toBe('AA');
    expect(rateContrast(2, false)).toBe('Fail');
  });

  it('suggests an accessible color that meets the target ratio', () => {
    const fg = hexToRgb('#9AA0A6'); // low-contrast gray on white
    const suggestion = suggestAccessibleColor(fg, WHITE, 4.5);
    expect(contrastRatio(hexToRgb(suggestion), WHITE)).toBeGreaterThanOrEqual(4.5);
  });
});
