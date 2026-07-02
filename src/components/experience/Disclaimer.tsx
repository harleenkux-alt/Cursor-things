import { SIMULATION_DISCLAIMER } from '@/types/experience';
import { Icon } from '@/components/ui/Icon';

/** Persistent, non-dismissable educational disclaimer for all simulations. */
export function Disclaimer() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2">
      <span className="mt-0.5 text-warning">
        <Icon name="Info" size={14} />
      </span>
      <p className="text-[11px] leading-relaxed text-[var(--text)]">
        {SIMULATION_DISCLAIMER}
      </p>
    </div>
  );
}
