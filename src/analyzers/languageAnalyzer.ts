import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import { isEmojiOnly, readability } from '@/utils/text';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, looksLikeText, makeResult } from './base';
import {
  ABLEIST_LANGUAGE,
  COLOR_ONLY_INSTRUCTIONS,
  GENDERED_LANGUAGE,
  JARGON,
  type LexiconEntry,
} from './lexicon';

/**
 * LanguageAnalyzer — inclusive design & content. Detects gendered / ableist
 * language, jargon, reading level, color-only instructions, and emoji-only
 * communication. Contributes to "Inclusive Design".
 */
export const LanguageAnalyzer: Analyzer = {
  id: 'language',
  category: 'inclusive',
  title: 'Inclusive Language',
  icon: 'MessagesSquare',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];
    const textNodes = ctx.visibleNodes.filter(looksLikeText);
    const allText = textNodes.map((n) => n.text!.characters).join(' \n ');

    const scan = (
      entries: LexiconEntry[],
      kind: string,
      severity: 'medium' | 'low',
      wcagNote?: string,
    ) => {
      for (const entry of entries) {
        const matches = textNodes.filter((n) => entry.pattern.test(n.text!.characters));
        if (matches.length === 0) continue;
        issues.push(
          buildIssue({
            category: 'inclusive',
            analyzerId: 'language',
            title: `${kind}: "${entry.term}"`,
            description: `Found "${entry.term}" in ${matches.length} place(s). Consider "${entry.suggestion}".${wcagNote ? ` ${wcagNote}` : ''}`,
            severity,
            nodes: matches.slice(0, 12),
            fix: {
              kind: 'manual',
              label: 'Rewrite copy',
              current: entry.term,
              recommended: entry.suggestion,
              autoFixable: false,
            },
          }),
        );
      }
    };

    scan(GENDERED_LANGUAGE, 'Gendered language', 'medium');
    scan(ABLEIST_LANGUAGE, 'Ableist language', 'medium');
    scan(JARGON, 'Jargon / complex wording', 'low');

    // Color-only instructions.
    const colorOnly = textNodes.filter((n) =>
      COLOR_ONLY_INSTRUCTIONS.some((p) => p.test(n.text!.characters)),
    );
    for (const node of colorOnly.slice(0, 10)) {
      issues.push(
        buildIssue({
          category: 'inclusive',
          analyzerId: 'language',
          title: 'Instruction relies on color alone',
          description: `"${node.text!.characters.slice(0, 60)}" identifies UI by color. Users who are colorblind can't follow this — add a label, icon, or position cue.`,
          severity: 'high',
          wcag: '1.4.1 Use of Color',
          wcagLevel: 'A',
          nodes: [node],
        }),
      );
    }
    if (colorOnly.length > 0) {
      recommendations.push('Never rely on color alone — pair it with text, icons, or patterns.');
    }

    // Emoji-only communication.
    const emojiOnly = textNodes.filter((n) => isEmojiOnly(n.text!.characters));
    for (const node of emojiOnly.slice(0, 10)) {
      issues.push(
        buildIssue({
          category: 'inclusive',
          analyzerId: 'language',
          title: 'Emoji-only content',
          description: `"${node.name}" communicates with emoji only. Screen readers announce emoji inconsistently — add a text equivalent.`,
          severity: 'low',
          nodes: [node],
        }),
      );
    }

    // Overall reading level of the screen's prose.
    const prose = textNodes
      .filter((n) => n.text!.characters.trim().split(/\s+/).length >= 8)
      .map((n) => n.text!.characters)
      .join('. ');
    const r = readability(prose);
    if (prose.length > 0 && r.fleschKincaidGrade > 12) {
      const complexNodes: AuditNode[] = textNodes.filter(
        (n) => readability(n.text!.characters).fleschKincaidGrade > 14,
      );
      issues.push(
        buildIssue({
          category: 'inclusive',
          analyzerId: 'language',
          title: `High reading level (grade ${r.fleschKincaidGrade})`,
          description: `The overall copy reads at a grade ${r.fleschKincaidGrade} level ("${r.label}"). Most audiences are best served by grade 8–9. Simplify sentences and vocabulary.`,
          severity: 'medium',
          nodes: complexNodes.slice(0, 10),
          fix: {
            kind: 'manual',
            label: 'Simplify content',
            current: `Grade ${r.fleschKincaidGrade}`,
            recommended: 'Grade 8–9',
            autoFixable: false,
          },
        }),
      );
      recommendations.push('Aim for a grade 8–9 reading level using short sentences and plain words.');
    }

    return makeResult(this, issues, recommendations, {
      readability: r,
      wordCount: r.words,
      colorOnlyCount: colorOnly.length,
      totalTextNodes: textNodes.length,
      sampleText: allText.slice(0, 200),
    });
  },
};
