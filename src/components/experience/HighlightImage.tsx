interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HighlightItem {
  bounds: Bounds;
  order: number;
  active: boolean;
  status?: 'ok' | 'warn';
}

/**
 * Displays the exported frame with numbered highlight boxes overlaid using
 * normalized (0..1) bounds — used by the screen-reader and keyboard tabs to
 * visualize reading/focus order.
 */
export function HighlightImage({
  url,
  items,
}: {
  url: string;
  items: HighlightItem[];
}) {
  return (
    <div className="relative inline-block max-w-full overflow-hidden rounded-lg border border-[var(--border)]">
      <img src={url} alt="Frame preview" className="block h-auto max-w-full" />
      <div className="pointer-events-none absolute inset-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute rounded-[3px] border-2 transition-all"
            style={{
              left: `${item.bounds.x * 100}%`,
              top: `${item.bounds.y * 100}%`,
              width: `${item.bounds.width * 100}%`,
              height: `${item.bounds.height * 100}%`,
              borderColor: item.active
                ? '#005FCC'
                : item.status === 'warn'
                  ? 'rgba(245,158,11,0.7)'
                  : 'rgba(91,141,239,0.4)',
              background: item.active ? 'rgba(0,95,204,0.12)' : 'transparent',
              boxShadow: item.active ? '0 0 0 2px rgba(0,95,204,0.25)' : 'none',
            }}
          >
            <span
              className="absolute -left-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[3px] px-1 text-[9px] font-bold text-white"
              style={{ background: item.active ? '#005FCC' : '#5B8DEF' }}
            >
              {item.order}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
