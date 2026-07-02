import type { SceneSnapshot } from '@/models/auditNode';
import type { AuditSettings } from '@/types/settings';
import type { FixSuggestion } from '@/types/analysis';

/**
 * Typed message protocol between the UI (iframe) and the main thread (sandbox).
 *
 * UI → Main : {@link UiToMainMessage}
 * Main → UI : {@link MainToUiMessage}
 */

export type UiToMainMessage =
  | { type: 'ui-ready' }
  | { type: 'analyze' }
  | { type: 'request-selection' }
  | { type: 'locate'; nodeIds: string[] }
  | { type: 'apply-fix'; fix: FixSuggestion }
  | { type: 'load-settings' }
  | { type: 'save-settings'; settings: AuditSettings }
  | { type: 'resize'; width: number; height: number }
  | { type: 'notify'; message: string; error?: boolean };

export interface SelectionState {
  hasFrame: boolean;
  frameName?: string;
  frameId?: string;
  selectionCount: number;
}

export type MainToUiMessage =
  | { type: 'selection-changed'; selection: SelectionState }
  | { type: 'analysis-started' }
  | { type: 'analysis-progress'; message: string; percent: number }
  | { type: 'snapshot-ready'; snapshot: SceneSnapshot }
  | { type: 'analysis-error'; message: string }
  | { type: 'settings-loaded'; settings: AuditSettings }
  | { type: 'fix-applied'; nodeId?: string; ok: boolean; message?: string };

/** Envelope Figma wraps around all plugin messages. */
export interface PluginMessageEvent<T> {
  pluginMessage: T;
}
