import { useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditStore } from '@/store/useAuditStore';
import { useNav, useStatus } from '@/hooks/useAudit';
import { NavRail } from '@/components/shell/NavRail';
import { DashboardScreen } from '@/components/dashboard/DashboardScreen';
import { AnalyzingScreen } from '@/components/analyzing/AnalyzingScreen';
import { ResultScreen } from '@/components/result/ResultScreen';
import { ColorsScreen } from '@/components/result/ColorsScreen';
import { ReportsScreen } from '@/components/result/ReportsScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import { ExperiencePage } from '@/components/experience/ExperiencePage';

export function App() {
  const nav = useNav();
  const status = useStatus();
  const init = useAuditStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  const busy = status !== 'idle';

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex h-full bg-[var(--bg)] text-[var(--text)]">
        <NavRail />
        <main className="relative flex min-w-0 flex-1 flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={busy ? 'busy' : nav}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {busy ? (
                <AnalyzingScreen />
              ) : (
                <>
                  {nav === 'dashboard' && <DashboardScreen />}
                  {nav === 'audit' && <ResultScreen />}
                  {nav === 'experience' && <ExperiencePage />}
                  {nav === 'colors' && <ColorsScreen />}
                  {nav === 'reports' && <ReportsScreen />}
                  {nav === 'settings' && <SettingsScreen />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </Tooltip.Provider>
  );
}
