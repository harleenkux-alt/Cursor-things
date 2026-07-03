import { create } from 'zustand';
import type { AuditReport, FixSuggestion } from '@/types/analysis';
import type { SelectionState } from '@/types/messages';
import type { AuditSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from '@/types/settings';
import type { AnalysisCategory } from '@/types/analysis';
import type { ExperienceReport, FrameImage } from '@/types/experience';
import { runAnalysis, type RunProgress } from '@/core/analysisRunner';
import { runExperienceAnalysis } from '@/simulations';
import { bridge } from '@/services/figmaBridge';

/** Top-level navigation destinations. */
export type Nav =
  | 'dashboard'
  | 'audit'
  | 'experience'
  | 'colors'
  | 'reports'
  | 'settings';

/** What (if anything) is currently being computed. */
export type FlowStatus = 'idle' | 'auditing' | 'simulating';

interface AuditState {
  nav: Nav;
  status: FlowStatus;
  selection: SelectionState;
  settings: AuditSettings;
  report: AuditReport | null;
  experience: ExperienceReport | null;
  frameImage: FrameImage | null;
  error: string | null;
  progress: { message: string; percent: number };
  expandedSections: Record<string, boolean>;
  /** Which tab the Accessibility Audit screen shows. */
  auditTab: 'overview' | 'sections';
  /** Analyzer section to scroll to & highlight after navigating. */
  focusAnalyzerId: string | null;

  // actions
  init: () => void;
  setNav: (nav: Nav) => void;
  setAuditTab: (tab: 'overview' | 'sections') => void;
  openAuditCategory: (category: AnalysisCategory) => void;
  clearFocus: () => void;
  analyze: () => void;
  runSimulation: () => void;
  updateSettings: (patch: Partial<AuditSettings>) => void;
  toggleSection: (id: string) => void;
  expandSections: (ids: string[]) => void;
  locate: (nodeIds: string[]) => void;
  applyFix: (fix: FixSuggestion) => void;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  nav: 'dashboard',
  status: 'idle',
  selection: { hasFrame: false, selectionCount: 0 },
  settings: DEFAULT_SETTINGS,
  report: null,
  experience: null,
  frameImage: null,
  error: null,
  progress: { message: '', percent: 0 },
  expandedSections: {},
  auditTab: 'overview',
  focusAnalyzerId: null,

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
          set({ error: null, progress: { message: 'Preparing…', percent: 10 } });
          break;
        case 'analysis-progress':
          set({ progress: { message: msg.message, percent: msg.percent } });
          break;
        case 'analysis-error':
          set({ error: msg.message, status: 'idle' });
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
            set({
              report,
              status: 'idle',
              nav: 'audit',
              progress: { message: 'Done', percent: 100 },
            });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : 'Analysis failed.',
              status: 'idle',
            });
          }
          break;
        }
        case 'simulation-ready': {
          set({ progress: { message: 'Building simulations…', percent: 85 } });
          try {
            const experience = runExperienceAnalysis(msg.snapshot, get().settings);
            set({
              experience,
              frameImage: msg.image,
              status: 'idle',
              nav: 'experience',
              progress: { message: 'Done', percent: 100 },
            });
          } catch (err) {
            set({
              error: err instanceof Error ? err.message : 'Simulation failed.',
              status: 'idle',
            });
          }
          break;
        }
        case 'fix-applied':
          break;
      }
    });
    bridge.post({ type: 'ui-ready' });
  },

  setNav: (nav) => set({ nav, error: null }),
  setAuditTab: (auditTab) => set({ auditTab }),
  clearFocus: () => set({ focusAnalyzerId: null }),

  openAuditCategory: (category) => {
    const report = get().report;
    if (!report) return;
    const ids = report.results
      .filter((r) => r.category === category)
      .map((r) => r.analyzerId);
    if (ids.length === 0) return;
    const expanded = { ...get().expandedSections };
    for (const id of ids) expanded[id] = true;
    set({
      nav: 'audit',
      auditTab: 'sections',
      expandedSections: expanded,
      focusAnalyzerId: ids[0] ?? null,
    });
  },

  analyze: () => {
    const { selection } = get();
    if (!selection.hasFrame) {
      set({ error: 'Select a frame to begin.' });
      return;
    }
    set({ error: null, status: 'auditing', progress: { message: 'Preparing…', percent: 5 } });
    bridge.post({ type: 'analyze' });
  },

  runSimulation: () => {
    const { selection } = get();
    if (!selection.hasFrame) {
      set({ error: 'Select a frame to begin.' });
      return;
    }
    set({
      error: null,
      status: 'simulating',
      progress: { message: 'Preparing…', percent: 5 },
    });
    bridge.post({ type: 'run-simulation' });
  },

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

  expandSections: (ids) =>
    set((s) => {
      const next = { ...s.expandedSections };
      for (const id of ids) next[id] = true;
      return { expandedSections: next };
    }),

  locate: (nodeIds) => {
    if (nodeIds.length === 0) return;
    bridge.post({ type: 'locate', nodeIds });
  },

  applyFix: (fix) => bridge.post({ type: 'apply-fix', fix }),
}));

function applyTheme(dark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', dark);
}
