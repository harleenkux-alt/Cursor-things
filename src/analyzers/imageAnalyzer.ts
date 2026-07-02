import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import { round } from '@/utils/math';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, makeResult } from './base';

const GENERIC_NAMES = /^(image|img|rectangle|frame|group|photo|picture|vector|ellipse)\s*\d*$/i;

function isImage(node: AuditNode): boolean {
  return node.hasImageFill || /image|img|photo|picture|avatar|thumbnail/i.test(node.name);
}

function isDecorative(node: AuditNode): boolean {
  return /decorative|background|bg|texture|pattern|gradient|blur/i.test(node.name);
}

/**
 * ImageAnalyzer — image inventory, missing alt-text placeholders, decorative
 * detection, and image dominance. Contributes to "Content".
 */
export const ImageAnalyzer: Analyzer = {
  id: 'image',
  category: 'content',
  title: 'Images & Media',
  icon: 'Image',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    const images = ctx.visibleNodes.filter(isImage);
    const decorative = images.filter(isDecorative);
    const meaningful = images.filter((n) => !isDecorative(n));

    // 1) Missing alt text placeholder (generic layer names on meaningful images).
    const missingAlt = meaningful.filter((n) => GENERIC_NAMES.test(n.name.trim()));
    for (const node of missingAlt.slice(0, 20)) {
      issues.push(
        buildIssue({
          category: 'content',
          analyzerId: 'image',
          title: 'Image missing descriptive name / alt text',
          description: `"${node.name}" is a meaningful image with a generic name. Rename it to describe its content — this is the alt text hand-off to engineering.`,
          severity: 'medium',
          wcag: '1.1.1 Non-text Content',
          wcagLevel: 'A',
          nodes: [node],
          fix: {
            kind: 'manual',
            label: 'Add alt description',
            description: 'Rename the layer to a concise description of the image content.',
            autoFixable: false,
          },
        }),
      );
    }
    if (missingAlt.length > 0) {
      recommendations.push('Name image layers descriptively so alt text can be derived automatically.');
    }

    // 2) Decorative images that should be marked to be hidden from AT.
    if (decorative.length > 0) {
      recommendations.push(
        `Mark ${decorative.length} decorative image(s) as decorative (empty alt) in handoff.`,
      );
    }

    // 3) Image dominance.
    const frameArea = Math.max(1, ctx.root.width * ctx.root.height);
    const imageArea = images.reduce((sum, n) => sum + n.width * n.height, 0);
    const dominance = round((imageArea / frameArea) * 100);
    if (dominance > 70 && images.length > 0) {
      issues.push(
        buildIssue({
          category: 'content',
          analyzerId: 'image',
          title: `Imagery dominates the layout (${dominance}%)`,
          description: `Images cover ~${dominance}% of the screen. Ensure essential information isn't conveyed only through imagery, and that text remains legible over it.`,
          severity: 'low',
          nodes: [],
        }),
      );
    }

    return makeResult(this, issues, recommendations, {
      imageCount: images.length,
      decorativeCount: decorative.length,
      meaningfulCount: meaningful.length,
      missingAltCount: missingAlt.length,
      dominance,
    });
  },
};
