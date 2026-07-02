/** Small numeric helpers shared across analyzers. */

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function round(v: number, decimals = 0): number {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map((v) => (v - mean) ** 2));
  return Math.sqrt(variance);
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** Count occurrences of each value, returned as a Map preserving insertion. */
export function frequency<T>(arr: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of arr) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}

/** Detect whether a value snaps to a base grid unit (default 8, with 4 allowed). */
export function isOnGrid(value: number, unit = 8, allowHalf = true): boolean {
  if (value === 0) return true;
  const rem = Math.abs(value % unit);
  const onUnit = rem < 0.5 || Math.abs(rem - unit) < 0.5;
  if (onUnit) return true;
  if (allowHalf) {
    const half = unit / 2;
    const remHalf = Math.abs(value % half);
    return remHalf < 0.5 || Math.abs(remHalf - half) < 0.5;
  }
  return false;
}
