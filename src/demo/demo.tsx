import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/ui/App';
import { useAuditStore } from '@/store/useAuditStore';
import { runAnalysis } from '@/core/analysisRunner';
import { runExperienceAnalysis } from '@/simulations';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { buildDemoSnapshot } from './buildDemoSnapshot';
import { SAMPLE_FRAME_BYTES, SAMPLE_FRAME_HEIGHT, SAMPLE_FRAME_WIDTH } from './sampleFrame';
import '@/ui/index.css';

/**
 * Demo harness — renders the REAL plugin UI populated with real analyzer output
 * over a synthetic frame, plus a sample exported image for the visual
 * simulator. Used by the screenshot/video capture script; not part of the
 * shipped plugin.
 */
declare global {
  interface Window {
    __demoReady?: boolean;
  }
}

async function boot() {
  const snapshot = buildDemoSnapshot();
  const report = await runAnalysis(snapshot, DEFAULT_SETTINGS);
  const experience = runExperienceAnalysis(snapshot, DEFAULT_SETTINGS);

  useAuditStore.setState({
    report,
    experience,
    frameImage: {
      bytes: SAMPLE_FRAME_BYTES,
      width: SAMPLE_FRAME_WIDTH,
      height: SAMPLE_FRAME_HEIGHT,
      scale: 1,
    },
    selection: {
      hasFrame: true,
      frameName: 'Home / Luxury Living',
      frameId: 'demo-root',
      selectionCount: 1,
    },
    nav: 'dashboard',
    status: 'idle',
  });

  const container = document.getElementById('root')!;
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

  // Signal readiness to the capture script after first paint.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__demoReady = true;
  }));
}

void boot();
