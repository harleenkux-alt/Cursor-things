import type {
  MainToUiMessage,
  SelectionState,
  UiToMainMessage,
} from '@/types/messages';
import type { AuditSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { extractSnapshot } from './extractor';
import { applyFix, locateNodes } from './commands';

/**
 * Inclusive Audit — main thread (sandbox) entry point.
 *
 * Responsibilities:
 *  - Boot the plugin UI.
 *  - Track the current selection and report frame-availability to the UI.
 *  - Extract a serializable snapshot of the selected frame on demand.
 *  - Handle imperative commands (locate, apply-fix) and settings persistence.
 */

const SETTINGS_KEY = 'inclusive-audit:settings';
const UI_SIZE = { width: 880, height: 720 };

figma.showUI(__html__, { ...UI_SIZE, themeColors: true });

function post(message: MainToUiMessage): void {
  figma.ui.postMessage(message);
}

function isFrameLike(node: SceneNode): boolean {
  return (
    node.type === 'FRAME' ||
    node.type === 'COMPONENT' ||
    node.type === 'COMPONENT_SET' ||
    node.type === 'INSTANCE' ||
    node.type === 'SECTION' ||
    node.type === 'GROUP'
  );
}

function currentSelectionState(): SelectionState {
  const selection = figma.currentPage.selection;
  const frame = selection.find(isFrameLike);
  return {
    hasFrame: Boolean(frame),
    frameName: frame?.name,
    frameId: frame?.id,
    selectionCount: selection.length,
  };
}

function emitSelection(): void {
  post({ type: 'selection-changed', selection: currentSelectionState() });
}

async function loadSettings(): Promise<AuditSettings> {
  try {
    const stored = (await figma.clientStorage.getAsync(SETTINGS_KEY)) as
      | Partial<AuditSettings>
      | undefined;
    return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function runAnalysis(): Promise<void> {
  const selection = figma.currentPage.selection;
  const frame = selection.find(isFrameLike);
  if (!frame) {
    post({ type: 'analysis-error', message: 'Select a frame to begin.' });
    return;
  }
  post({ type: 'analysis-started' });
  post({ type: 'analysis-progress', message: 'Reading layers…', percent: 20 });

  // Yield to the event loop so the UI can render the loading state.
  await new Promise((r) => setTimeout(r, 0));

  try {
    const snapshot = extractSnapshot(frame);
    post({
      type: 'analysis-progress',
      message: `Extracted ${snapshot.nodeCount} layers`,
      percent: 60,
    });
    post({ type: 'snapshot-ready', snapshot });
  } catch (err) {
    post({
      type: 'analysis-error',
      message: err instanceof Error ? err.message : 'Failed to read the frame.',
    });
  }
}

/** Cap the exported preview so canvas simulations stay fast (<100ms). */
const MAX_PREVIEW_DIMENSION = 1400;

async function runSimulation(): Promise<void> {
  const selection = figma.currentPage.selection;
  const frame = selection.find(isFrameLike);
  if (!frame) {
    post({ type: 'analysis-error', message: 'Select a frame to begin.' });
    return;
  }
  post({ type: 'analysis-started' });
  post({ type: 'analysis-progress', message: 'Reading layers…', percent: 15 });
  await new Promise((r) => setTimeout(r, 0));

  try {
    const snapshot = extractSnapshot(frame);
    post({ type: 'analysis-progress', message: 'Rendering preview…', percent: 55 });

    const box = 'absoluteBoundingBox' in frame ? frame.absoluteBoundingBox : null;
    const maxDim = Math.max(box?.width ?? frame.width, box?.height ?? frame.height, 1);
    const scale = Math.max(0.25, Math.min(2, MAX_PREVIEW_DIMENSION / maxDim));

    const bytes = await (frame as ExportMixin).exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: scale },
    });

    post({
      type: 'simulation-ready',
      snapshot,
      image: {
        bytes,
        width: Math.round((box?.width ?? frame.width) * scale),
        height: Math.round((box?.height ?? frame.height) * scale),
        scale,
      },
    });
  } catch (err) {
    post({
      type: 'analysis-error',
      message: err instanceof Error ? err.message : 'Failed to render the frame.',
    });
  }
}

figma.on('selectionchange', emitSelection);

figma.ui.onmessage = async (msg: UiToMainMessage) => {
  switch (msg.type) {
    case 'ui-ready': {
      emitSelection();
      const settings = await loadSettings();
      post({ type: 'settings-loaded', settings });
      break;
    }
    case 'request-selection':
      emitSelection();
      break;
    case 'analyze':
      await runAnalysis();
      break;
    case 'run-simulation':
      await runSimulation();
      break;
    case 'locate':
      await locateNodes(msg.nodeIds);
      break;
    case 'apply-fix': {
      const result = await applyFix(msg.fix);
      post({
        type: 'fix-applied',
        ok: result.ok,
        nodeId: result.nodeId,
        message: result.message,
      });
      figma.notify(result.message ?? (result.ok ? 'Fix applied' : 'Fix failed'), {
        error: !result.ok,
      });
      break;
    }
    case 'load-settings': {
      const settings = await loadSettings();
      post({ type: 'settings-loaded', settings });
      break;
    }
    case 'save-settings':
      await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings);
      break;
    case 'resize':
      figma.ui.resize(Math.max(360, msg.width), Math.max(480, msg.height));
      break;
    case 'notify':
      figma.notify(msg.message, { error: msg.error });
      break;
    default:
      break;
  }
};
