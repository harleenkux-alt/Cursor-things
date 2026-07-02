import type { AnalyzerContext } from '@/analyzers/base';
import type { HearingMedia, HearingResult, SimStatus } from '@/types/experience';
import { truncate } from '@/utils/text';
import { clampScore } from './types';

/**
 * HearingAnalyzer — detects media that may present information via sound and
 * checks for the visual equivalents (captions, transcripts, visual feedback).
 * Detection is name-based since Figma frames don't embed real media.
 */
export function runHearingAnalysis(ctx: AnalyzerContext): HearingResult {
  const media: HearingMedia[] = [];

  for (const node of ctx.visibleNodes) {
    const name = node.name.toLowerCase();
    const kind = detectMediaKind(name);
    if (!kind) continue;

    const hasCaption = ctx.visibleNodes.some((n) =>
      /caption|subtitle|transcript|cc\b/i.test(n.name),
    );
    const status: SimStatus =
      kind === 'notification'
        ? 'warning'
        : hasCaption
          ? 'pass'
          : 'fail';

    media.push({
      nodeId: node.id,
      name: truncate(node.name, 28),
      kind,
      status,
      recommendation:
        kind === 'video'
          ? hasCaption
            ? 'Captions detected — also provide a full transcript.'
            : 'Provide captions and a transcript for this video.'
          : kind === 'audio'
            ? 'Provide a transcript for audio-only content.'
            : 'Pair audio alerts with a visible notification.',
    });
  }

  const recommendations: string[] = [];
  const fails = media.filter((m) => m.status === 'fail');
  if (media.some((m) => m.kind === 'video' && m.status !== 'pass'))
    recommendations.push('Provide captions for all video content (WCAG 1.2.2).');
  if (media.some((m) => m.kind === 'video' || m.kind === 'audio'))
    recommendations.push('Provide transcripts for audio and video (WCAG 1.2.1).');
  if (media.some((m) => m.kind === 'notification'))
    recommendations.push('Ensure every audio cue has a redundant visual notification.');

  const score =
    media.length === 0 ? 100 : clampScore(100 - fails.length * 20 - (media.length - fails.length) * 4);

  return { score, media, recommendations };
}

function detectMediaKind(name: string): HearingMedia['kind'] | null {
  if (/video|player|reel|movie|\.mp4|youtube|vimeo/.test(name)) return 'video';
  if (/audio|voice|podcast|sound|music|\.mp3|recording/.test(name)) return 'audio';
  if (/notification|toast|alert|chime|ring|buzz/.test(name)) return 'notification';
  return null;
}
