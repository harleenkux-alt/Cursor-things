import type { AiProvider } from './types';

export * from './types';

/**
 * The default (no-op) AI provider. It reports `available: false` so the UI can
 * hide AI affordances until a real provider is registered via
 * {@link registerAiProvider}.
 *
 * Swapping in a real implementation later (e.g. an on-device model, or a
 * networked provider after enabling `networkAccess` in the manifest) is a
 * one-line change and requires no edits to analyzers or components.
 */
export const NullAiProvider: AiProvider = {
  id: 'null',
  available: false,
  async explainIssue(issue) {
    return {
      issueId: issue.id,
      plainLanguage: issue.description,
      whyItMatters: 'AI explanations are not enabled in this build.',
      howToFix: issue.fix?.label ?? 'See the recommendations for this section.',
    };
  },
  async rewriteContent(text) {
    return { original: text, simplified: text, readingGradeBefore: 0, readingGradeAfter: 0 };
  },
  async suggestPalette() {
    return { description: 'AI palette suggestions are not enabled.', colors: [] };
  },
  async chat() {
    return 'The AI assistant is not enabled in this build.';
  },
};

let activeProvider: AiProvider = NullAiProvider;

export function registerAiProvider(provider: AiProvider): void {
  activeProvider = provider;
}

export function getAiProvider(): AiProvider {
  return activeProvider;
}
