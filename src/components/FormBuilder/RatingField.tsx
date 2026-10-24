import { Slider } from '@/components/ui/slider';
import { getRatingBounds } from '@/lib/rating';

interface RatingFieldProps {
  settings?: unknown;
  label: string;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export default function RatingField({ settings, label, value, onChange, disabled }: RatingFieldProps) {
  const { min, max } = getRatingBounds(settings);
  const displayedValue = Math.min(max, Math.max(min, value ?? min));
  return (
    <div className="space-y-3 py-2" dir="ltr">
      <output className="block text-center text-2xl font-semibold tabular-nums text-primary" aria-live="polite">{displayedValue}</output>
      <Slider aria-label={label} min={min} max={max} step={1} value={[displayedValue]} disabled={disabled}
        onValueChange={values => { const next = values[0]; if (next !== undefined) onChange?.(next); }} />
      <div className="flex justify-between text-xs tabular-nums text-muted-foreground"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}