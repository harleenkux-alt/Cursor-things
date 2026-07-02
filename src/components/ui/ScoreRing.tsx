import { motion } from 'framer-motion';
import { scoreColor } from '@/components/ui/scoreColor';

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

/** Animated circular progress indicator for scores (0–100). */
export function ScoreRing({
  score,
  size = 140,
  stroke = 12,
  label,
  sublabel,
}: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold leading-none"
          style={{ color }}
        >
          {Math.round(clamped)}
        </span>
        {label && (
          <span className="mt-1 text-sm font-semibold" style={{ color }}>
            {label}
          </span>
        )}
        {sublabel && <span className="mt-0.5 text-[11px] text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
