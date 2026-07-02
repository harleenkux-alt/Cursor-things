import { motion } from 'framer-motion';
import { useProgress } from '@/hooks/useAudit';
import { Icon } from '@/components/ui/Icon';

export function AnalyzingScreen() {
  const progress = useProgress();

  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft-lg"
      >
        <Icon name="ScanLine" size={30} />
      </motion.div>

      <h2 className="text-lg font-semibold">Auditing your screen</h2>
      <p className="mt-1 text-sm text-muted">{progress.message || 'Working…'}</p>

      <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--border)]">
        <motion.div
          className="h-full rounded-full bg-brand-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>
      <span className="mt-2 text-xs font-medium text-muted">{progress.percent}%</span>
    </div>
  );
}
