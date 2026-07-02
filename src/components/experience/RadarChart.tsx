import type { ExperienceCategoryScore } from '@/types/experience';

/** Lightweight SVG radar chart for the experience category scores. */
export function RadarChart({
  categories,
  size = 260,
}: {
  categories: ExperienceCategoryScore[];
  size?: number;
}) {
  const n = categories.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 42;
  const levels = 4;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => ({
    x: cx + Math.cos(angleFor(i)) * r,
    y: cy + Math.sin(angleFor(i)) * r,
  });

  const gridPolys = Array.from({ length: levels }, (_, l) => {
    const r = (radius * (l + 1)) / levels;
    return Array.from({ length: n }, (_, i) => {
      const p = point(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
  });

  const dataPoints = categories.map((c, i) => point(i, (radius * c.score) / 100));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} className="mx-auto">
      {gridPolys.map((poly, i) => (
        <polygon
          key={i}
          points={poly}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}
      {categories.map((_, i) => {
        const p = point(i, radius);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth={1} />
        );
      })}
      <polygon
        points={dataPath}
        fill="rgba(0,95,204,0.18)"
        stroke="#005FCC"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#005FCC" />
      ))}
      {categories.map((c, i) => {
        const p = point(i, radius + 16);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--text-muted)]"
            style={{ fontSize: 9 }}
          >
            {c.label}
          </text>
        );
      })}
    </svg>
  );
}
