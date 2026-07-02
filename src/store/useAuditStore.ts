import { create } from 'zustand';
import type { AuditReport, FixSuggestion } from '@/types/analysis';
import type { SelectionState } from '@/types/messages';
import type { AuditSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { runAnalysis, type RunProgress } from '@/core/analysisRunner';
import { bridge } from '@/services/figmaBridge';

export type View = 'home' | 'analyzing' | 'result' | 'settings';

interface AuditState {
  view: View;
  selection: SelectionState;
  settings: AuditSettings;
  report: AuditReport | null;
  error: string | null;
  progress: { message: string; percent: number };
  expandedSections: Record<string, boolean>;
  activeFixId: string | null;

  // actions
  init: () => void;
  analyze: () => void;
  goHome: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  updateSettings: (patch: Partial<AuditSettings>) => void;
  toggleSection: (id: string) => void;
  locate: (nodeIds: string[]) => void;
  applyFix: (fix: FixSuggestion) => void;
  setActiveFix: (id: string | null) => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  view: 'home',
  selection: { hasFrame: false, selectionCount: 0 },
  settings: DEFAULT_SETTINGS,
  report: null,
  error: null,
  progress: { message: '', percent: 0 },
  expandedSections: {},
  activeFixId: null,

  init: () => {
    bridge.subscribe(async (msg) => {
      switch (msg.type) {
        case 'selection-changed':
          set({ selection: msg.selection });
          break;
        case 'settings-loaded':
          set((s) => ({ settings: { ...s.settings, ...msg.settings } }));
          applyTheme(get().settings.darkMode);
          break;
        case 'analysis-started':
          set({ view: 'analyzing', error: null, progress: { message: 'Preparing…', percent: 10 } });
          break;
        case 'analysis-progress':
          set({ progress: { message: msg.message, percent: msg.percent } });
          break;
        case 'analysis-error':
          set({ error: msg.message, view: 'home' });
          break;
        case 'snapshot-ready': {
          set({ progress: { message: 'Running analyzers…', percent: 75 } });
          try {
            const report = await runAnalysis(msg.snapshot, get().settings, {
              yieldBetween: msg.snapshot.nodeCount > 400,
              onProgress: (p: RunProgress) =>
                set({
                  progress: {
                    message: `Analyzing ${p.title}…`,
                    percent: 75 + Math.round((p.index / p.total) * 24),
                  },
                }),
            });
            set({ report, view: 'result', progress: { message: 'Done', percent: 100 } });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : 'Analysis failed.',
              view: 'home',
            });
          }
          break;
        }
        case 'fix-applied':
          // Re-run is left to the user; we surface the toast via main thread.
          break;
      }
    });
    bridge.post({ type: 'ui-ready' });
  },

  analyze: () => {
    const { selection } = get();
    if (!selection.hasFrame) {
      set({ error: 'Select a frame to begin.' });
      return;
    }
    set({ error: null });
    bridge.post({ type: 'analyze' });
  },

  goHome: () => set({ view: 'home' }),
  openSettings: () => set({ view: 'settings' }),
  closeSettings: () => set((s) => ({ view: s.report ? 'result' : 'home' })),

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    if ('darkMode' in patch) applyTheme(settings.darkMode);
    bridge.post({ type: 'save-settings', settings });
  },

  toggleSection: (id) =>
    set((s) => ({
      expandedSections: { ...s.expandedSections, [id]: !s.expandedSections[id] },
    })),

  locate: (nodeIds) => {
    if (nodeIds.length === 0) return;
    bridge.post({ type: 'locate', nodeIds });
  },

  applyFix: (fix) => bridge.post({ type: 'apply-fix', fix }),

  setActiveFix: (id) => set({ activeFixId: id }),
}));

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
}
