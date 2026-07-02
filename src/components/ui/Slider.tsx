import * as RSlider from '@radix-ui/react-slider';

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  ariaLabel,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  ariaLabel?: string;
}) {
  return (
    <RSlider.Root
      className="relative flex h-5 w-40 touch-none select-none items-center"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onValueChange(v ?? min)}
      aria-label={ariaLabel}
    >
      <RSlider.Track className="relative h-1.5 grow rounded-full bg-[var(--border)]">
        <RSlider.Range className="absolute h-full rounded-full bg-brand-600" />
      </RSlider.Track>
      <RSlider.Thumb className="block h-4 w-4 rounded-full border-2 border-brand-600 bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]" />
    </RSlider.Root>
  );
}
