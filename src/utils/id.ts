let counter = 0;

/** Deterministic-ish unique id for issues (stable within one analysis run). */
export function makeId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter.toString(36)}`;
}

export function resetIdCounter(): void {
  counter = 0;
}
