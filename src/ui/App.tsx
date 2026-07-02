import { useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditStore } from '@/store/useAuditStore';
import { HomeScreen } from '@/components/home/HomeScreen';
import { AnalyzingScreen } from '@/components/analyzing/AnalyzingScreen';
import { ResultScreen } from '@/components/result/ResultScreen';
import { SettingsScreen } from '@/components/settings/SettingsScreen';

export function App() {
  const view = useAuditStore((s) => s.view);
  const init = useAuditStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex h-full flex-col bg-[var(--bg)] text-[var(--text)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {view === 'home' && <HomeScreen />}
            {view === 'analyzing' && <AnalyzingScreen />}
            {view === 'result' && <ResultScreen />}
            {view === 'settings' && <SettingsScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Tooltip.Provider>
  );
}
