import { useMemo, useState, type ReactNode } from 'react';
import type {
  ColorExperienceResult,
  CvdType,
  DyslexiaSettings,
  FrameImage,
  VisualConditionId,
  VisualFilterId,
} from '@/types/experience';
import { DEFAULT_DYSLEXIA } from '@/types/experience';
import {
  CVD_LABELS,
  CVD_PREVALENCE,
  VISUAL_CONDITIONS,
  VISUAL_CONDITION_ORDER,
} from '@/simulations';
import { CanvasPreview } from './CanvasPreview';
import { useLoadedImage } from './useLoadedImage';
import { SidePanel } from './SidePanel';
import { SimStatusPill } from './SimStatusPill';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

const CVD_TYPES: CvdType[] = [
  'protanopia',
  'protanomaly',
  'deuteranopia',
  'deuteranomaly',
  'tritanopia',
  'tritanomaly',
  'achromatopsia',
  'achromatomaly',
];

const ZOOMS = [1, 1.5, 2, 3];

function isCvd(f: VisualFilterId): f is CvdType {
  return (CVD_TYPES as string[]).includes(f);
}

export function VisualTab({
  frameImage,
  color,
}: {
  frameImage: FrameImage;
  color: ColorExperienceResult;
}) {
  const image = useLoadedImage(frameImage);
  const [active, setActive] = useState<VisualFilterId>('lowVision');
  const [zoom, setZoom] = useState(1);
  const [renderMs, setRenderMs] = useState(0);
  const [dyslexia, setDyslexia] = useState<DyslexiaSettings>(DEFAULT_DYSLEXIA);

  const condition: VisualConditionId | undefined = isCvd(active) ? 'normal' : active;
  const cvd: CvdType | undefined = isCvd(active) ? active : undefined;

  const description = useMemo(() => {
    if (isCvd(active))
      return `${CVD_LABELS[active]} — ${CVD_PREVALENCE[active]}. Colors are transformed using an accepted CVD matrix.`;
    return VISUAL_CONDITIONS[active].description;
  }, [active]);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[190px_1fr_230px]">
      {/* Left: simulation selector */}
      <div className="space-y-3">
        <Selector
          title="Vision"
          items={VISUAL_CONDITION_ORDER.map((id) => ({
            id,
            label: VISUAL_CONDITIONS[id].label,
          }))}
          active={active}
          onSelect={(id) => setActive(id as VisualFilterId)}
        />
        <Selector
          title="Color Vision Deficiency"
          items={CVD_TYPES.map((id) => ({ id, label: CVD_LABELS[id] }))}
          active={active}
          onSelect={(id) => setActive(id as VisualFilterId)}
        />
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-2">
          <div className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Zoom
          </div>
          <div className="flex gap-1">
            {ZOOMS.map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={cn(
                  'flex-1 rounded-md py-1 text-[11px] font-medium transition-colors',
                  zoom === z
                    ? 'bg-brand-600 text-white'
                    : 'text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
                )}
              >
                {z * 100}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center: side-by-side preview */}
      <div className="min-w-0">
        {image ? (
          <div className="grid grid-cols-2 gap-3">
            <PreviewColumn label="Original">
              <CanvasPreview
                image={image}
                width={frameImage.width}
                height={frameImage.height}
                zoom={zoom}
              />
            </PreviewColumn>
            <PreviewColumn label="Simulation" badge={renderMs ? `${renderMs.toFixed(0)}ms` : undefined}>
              <CanvasPreview
                image={image}
                width={frameImage.width}
                height={frameImage.height}
                condition={condition}
                cvd={cvd}
                zoom={zoom}
                onRendered={setRenderMs}
              />
            </PreviewColumn>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-muted">
            Decoding preview…
          </div>
        )}

        <DyslexiaPreview settings={dyslexia} onChange={setDyslexia} />
      </div>

      {/* Right: notes */}
      <div className="space-y-3">
        <SidePanel title="About this simulation" icon="Info">
          <p className="text-xs leading-relaxed text-muted">{description}</p>
        </SidePanel>

        <SidePanel title="Color combinations" icon="Contrast">
          {color.pairs.length === 0 ? (
            <p className="text-xs text-muted">No key color pairs detected.</p>
          ) : (
            <div className="space-y-1.5">
              {color.pairs.slice(0, 8).map((pair, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Swatch hex={pair.fgHex} />
                    <span className="text-[10px] text-muted">on</span>
                    <Swatch hex={pair.bgHex} />
                    <span className="ml-1 font-mono text-[10px] text-muted">
                      {pair.normalRatio}:1
                    </span>
                  </div>
                  <SimStatusPill status={pair.status} />
                </div>
              ))}
            </div>
          )}
        </SidePanel>
      </div>
    </div>
  );
}

function Selector({
  title,
  items,
  active,
  onSelect,
}: {
  title: string;
  items: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-2">
      <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
              active === item.id
                ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                : 'text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
            )}
          >
            <span
              className={cn(
                'flex h-3 w-3 shrink-0 items-center justify-center rounded-full border',
                active === item.id ? 'border-brand-600' : 'border-[var(--border)]',
              )}
            >
              {active === item.id && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewColumn({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
        {badge && (
          <span className="rounded bg-success/10 px-1.5 text-[10px] font-medium text-success">
            {badge}
          </span>
        )}
      </div>
      <div className="max-h-[360px] overflow-auto rounded-lg border border-[var(--border)] bg-[repeating-conic-gradient(#0000000a_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] p-1">
        {children}
      </div>
    </div>
  );
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      className="h-4 w-4 rounded border border-black/10"
      style={{ backgroundColor: hex }}
      title={hex}
    />
  );
}

function DyslexiaPreview({
  settings,
  onChange,
}: {
  settings: DyslexiaSettings;
  onChange: (s: DyslexiaSettings) => void;
}) {
  const fontStack =
    settings.font === 'default'
      ? undefined
      : `'${settings.font}', 'Comic Sans MS', system-ui, sans-serif`;
  const fonts: DyslexiaSettings['font'][] = [
    'default',
    'OpenDyslexic',
    'Atkinson Hyperlegible',
    'Lexend',
  ];

  return (
    <div className="mt-3 rounded-card border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon name="Type" size={15} className="text-brand-600" />
        Dyslexia-friendly preview
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {fonts.map((f) => (
          <button
            key={f}
            onClick={() => onChange({ ...settings, font: f })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
              settings.font === f
                ? 'bg-brand-600 text-white'
                : 'bg-black/[0.04] text-muted hover:text-[var(--text)] dark:bg-white/[0.06]',
            )}
          >
            {f === 'default' ? 'Default' : f}
          </button>
        ))}
      </div>
      <p
        className="rounded-lg bg-[var(--bg)] p-3 text-sm text-[var(--text)]"
        style={{
          fontFamily: fontStack,
          letterSpacing: `${settings.letterSpacing}em`,
          lineHeight: settings.lineSpacing,
          wordSpacing: `${settings.wordSpacing}em`,
        }}
      >
        Readable typography helps everyone. Generous spacing and clear letterforms
        reduce crowding and make text easier to follow.
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <SpacingSlider
          label="Letter"
          value={settings.letterSpacing}
          min={0}
          max={0.2}
          step={0.01}
          onChange={(v) => onChange({ ...settings, letterSpacing: v })}
        />
        <SpacingSlider
          label="Line"
          value={settings.lineSpacing}
          min={1}
          max={2.4}
          step={0.1}
          onChange={(v) => onChange({ ...settings, lineSpacing: v })}
        />
        <SpacingSlider
          label="Word"
          value={settings.wordSpacing}
          min={0}
          max={0.5}
          step={0.02}
          onChange={(v) => onChange({ ...settings, wordSpacing: v })}
        />
      </div>
      <p className="mt-2 text-[10px] text-muted">
        Preview only — your Figma design is not modified. Fonts render if installed locally.
      </p>
    </div>
  );
}

function SpacingSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-600"
      />
    </label>
  );
}
