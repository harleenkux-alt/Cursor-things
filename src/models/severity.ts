/**
 * Issue severity levels, ordered from most to least urgent.
 *
 * Color mapping (per product spec):
 *  - critical → red
 *  - high     → orange
 *  - medium   → yellow
 *  - low      → blue
 *  - info     → green
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export const SEVERITY_ORDER: readonly Severity[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
] as const;

/** Relative weight used when converting issues into a score penalty. */
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0,
};

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; token: string }
> = {
  critical: { label: 'Critical', color: '#DC2626', token: 'danger' },
  high: { label: 'High', color: '#F97316', token: 'orange' },
  medium: { label: 'Medium', color: '#F59E0B', token: 'warning' },
  low: { label: 'Low', color: '#005FCC', token: 'info' },
  info: { label: 'Info', color: '#16A34A', token: 'success' },
};

export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b);
}
