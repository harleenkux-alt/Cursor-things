/**
 * Small, curated lexicons for the inclusive-language analyzer.
 *
 * These lists are intentionally conservative to limit false positives. Each
 * entry maps a term to a suggested inclusive alternative. They are exported so
 * they can be extended or localized later, and so future AI features can use
 * them as grounding context.
 */

export interface LexiconEntry {
  pattern: RegExp;
  term: string;
  suggestion: string;
}

export const GENDERED_LANGUAGE: LexiconEntry[] = [
  { pattern: /\bguys\b/i, term: 'guys', suggestion: 'everyone / folks / team' },
  { pattern: /\bmankind\b/i, term: 'mankind', suggestion: 'humankind / people' },
  { pattern: /\bmanpower\b/i, term: 'manpower', suggestion: 'workforce / staff' },
  { pattern: /\bchairman\b/i, term: 'chairman', suggestion: 'chairperson / chair' },
  { pattern: /\bsalesman\b/i, term: 'salesman', suggestion: 'salesperson' },
  { pattern: /\bhe\/she\b/i, term: 'he/she', suggestion: 'they' },
  { pattern: /\bmiddleman\b/i, term: 'middleman', suggestion: 'intermediary' },
];

export const ABLEIST_LANGUAGE: LexiconEntry[] = [
  { pattern: /\bcrazy\b/i, term: 'crazy', suggestion: 'wild / surprising / intense' },
  { pattern: /\binsane\b/i, term: 'insane', suggestion: 'incredible / extreme' },
  { pattern: /\blame\b/i, term: 'lame', suggestion: 'disappointing / weak' },
  { pattern: /\bdumb\b/i, term: 'dumb', suggestion: 'unclear / confusing' },
  { pattern: /\bblind spot\b/i, term: 'blind spot', suggestion: 'gap / oversight' },
  { pattern: /\bcripple[ds]?\b/i, term: 'cripple', suggestion: 'weaken / limit' },
  { pattern: /\bsanity check\b/i, term: 'sanity check', suggestion: 'quick check / review' },
];

export const JARGON: LexiconEntry[] = [
  { pattern: /\bleverage\b/i, term: 'leverage', suggestion: 'use' },
  { pattern: /\butilize\b/i, term: 'utilize', suggestion: 'use' },
  { pattern: /\bsynerg(y|ize|ies)\b/i, term: 'synergy', suggestion: 'work together' },
  { pattern: /\bstreamline\b/i, term: 'streamline', suggestion: 'simplify' },
  { pattern: /\bideate\b/i, term: 'ideate', suggestion: 'brainstorm' },
  { pattern: /\bfacilitate\b/i, term: 'facilitate', suggestion: 'help' },
  { pattern: /\bonboarding\b/i, term: 'onboarding', suggestion: 'getting started' },
];

/** Phrases that describe UI by color alone (a WCAG 1.4.1 red flag). */
export const COLOR_ONLY_INSTRUCTIONS: RegExp[] = [
  /\bthe (red|green|blue|yellow|orange) (button|link|icon|dot|field|box)\b/i,
  /\bclick the (red|green|blue|yellow|orange)\b/i,
  /\b(in|marked|shown|highlighted) (in )?(red|green|blue|yellow|orange)\b/i,
  /\b(red|green) means\b/i,
];
