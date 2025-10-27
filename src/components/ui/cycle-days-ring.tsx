import { useState, useEffect } from 'react';
import { SnapRing } from './snap-ring';
import { useTranslation } from 'react-i18next';

interface CycleDaysRingProps {
  value: number; // cycleDays
  min?: number; // default 4
  max?: number; // default 7
  onChange: (days: number) => void;
  size?: number;
}

export function CycleDaysRing({
  value,
  min = 4,
  max = 7,
  onChange,
}: CycleDaysRingProps) {
  const { t } = useTranslation();
  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));
  const EPS = 0.001;

  const percentFromDays = (days: number) => {
    const clamped = clamp(days || min, min, max);
    // 0..100 scaled by max; keep within (EPS,100-EPS) to keep handle visible
    const p = (clamped / max) * 100;
    return clamp(p, EPS, 100 - EPS);
  };

  const [percent, setPercent] = useState<number>(percentFromDays(value));
  const [dragging, setDragging] = useState(false);

  // Sync from external value when not dragging
  useEffect(() => {
    if (!dragging) {
      const clamped = Math.max(min, Math.min(max, value || min));
      const p = (clamped / max) * 100;
      const EPS = 0.001;
      setPercent(Math.min(100 - EPS, Math.max(EPS, p)));
    }
  }, [value, dragging, min, max]);

  const nodes = Array.from(
    { length: max - min + 1 },
    (_, i) => (min + i) / max
  );

  return (
    <SnapRing
      value={percent / 100}
      nodes={nodes}
      onInput={(r) => {
        setDragging(true);
        setPercent(clamp(r * 100, EPS, 100 - EPS));
      }}
      onChange={(r) => {
        const days = clamp(Math.round(r * max), min, max);
        setDragging(false);
        setPercent(percentFromDays(days));
        if (days !== value) onChange(days);
      }}
      size={140}
      thickness={0.25}
      colorActive="var(--primary)"
      colorRest="var(--muted)"
      handleColor="#ffffff"
      label={`${value || min}${t('activity.days')}`}
      showMarkers={true}
    />
  );
}
