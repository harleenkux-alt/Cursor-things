import type { AuditReport, ColorInventory, Issue } from '@/types/analysis';

/**
 * AI provider abstraction (future-ready).
 *
 * Inclusive Audit ships fully offline today. These interfaces define the
 * contract that a future AI layer (local model, or a networked provider enabled
 * via the plugin manifest's `networkAccess`) would implement. The rest of the
 * app depends only on this interface, so wiring up a real provider later
 * requires no changes to the analyzers or UI.
 */
export interface AiExplanation {
  issueId: string;
  plainLanguage: string;
  whyItMatters: string;
  howToFix: string;
}

export interface AiRewrite {
  original: string;
  simplified: string;
  readingGradeBefore: number;
  readingGradeAfter: number;
}

export interface AiPaletteSuggestion {
  description: string;
  colors: { role: string; hex: string; rationale: string }[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiProvider {
  readonly id: string;
  readonly available: boolean;

  /** Explain an issue in plain language for non-experts. */
  explainIssue(issue: Issue): Promise<AiExplanation>;

  /** Rewrite content into plain, inclusive language. */
  rewriteContent(text: string, targetGrade?: number): Promise<AiRewrite>;

  /** Suggest an accessible, on-brand palette from the current inventory. */
  suggestPalette(inventory: ColorInventory): Promise<AiPaletteSuggestion>;

  /** Free-form accessibility assistant chat grounded in the report. */
  chat(messages: AiChatMessage[], report: AuditReport): Promise<string>;
}
