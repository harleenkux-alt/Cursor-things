/** Map a 0–100 score to the brand semantic color used across the UI. */
export function scoreColor(score: number): string {
  if (score >= 85) return '#16A34A'; // success
  if (score >= 70) return '#5B8DEF'; // accent
  if (score >= 55) return '#F59E0B'; // warning
  return '#DC2626'; // danger
}

export function scoreTextClass(score: number): string {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-accent';
  if (score >= 55) return 'text-warning';
  return 'text-danger';
}
