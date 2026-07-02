/** Resolve a numeric font weight from a Figma font style string. */
const WEIGHT_MAP: Array<[RegExp, number]> = [
  [/thin|hairline/i, 100],
  [/extra\s?light|ultra\s?light/i, 200],
  [/light/i, 300],
  [/regular|normal|book/i, 400],
  [/medium/i, 500],
  [/semi\s?bold|demi\s?bold/i, 600],
  [/extra\s?bold|ultra\s?bold/i, 800],
  [/black|heavy/i, 900],
  [/bold/i, 700],
];

export function resolveFontWeight(style: string): number {
  for (const [pattern, weight] of WEIGHT_MAP) {
    if (pattern.test(style)) return weight;
  }
  return 400;
}
