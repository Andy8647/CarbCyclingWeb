import { useState, useCallback, useEffect, useRef, useId } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface DistributionRingProps {
  highPercent: number;
  midPercent: number;
  lowPercent: number;
  onHighChange: (value: number, isDragging?: boolean) => void;
  onMidChange: (value: number, isDragging?: boolean) => void;
  onLowChange: (value: number, isDragging?: boolean) => void;
  label: string;
  colors?: {
    high: string;
    mid: string;
    low: string;
  };
}

export function DistributionRing({
  highPercent,
  midPercent,
  lowPercent,
  onHighChange,
  onMidChange,
  onLowChange,
  label,
  colors = {
    high: '#ef4444',
    mid: '#f59e0b',
    low: '#10b981',
  },
}: DistributionRingProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const dragTypeRef = useRef<'high-mid' | 'mid-low' | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dragValuesRef = useRef({
    high: highPercent,
    mid: midPercent,
    low: lowPercent,
  });
  const ringMaskId = useId();
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = 80;
  const innerRadius = 55;

  // Convert percentage to angle (0% at top, clockwise)
  const percentToAngle = (percent: number) => {
    return -90 + (percent / 100) * 360;
  };

  // Create SVG donut segment path
  const createDonutSegment = (startPercent: number, endPercent: number) => {
    // Normalize to [0, 100) range
    const normalizedStart = ((startPercent % 100) + 100) % 100;
    const normalizedEnd = ((endPercent % 100) + 100) % 100;

    // Calculate sweep percentage with wrap-around
    const sweepPercent =
      (((normalizedEnd - normalizedStart) % 100) + 100) % 100;

    // Ensure we don't have zero-length arcs
    const EPS = 0.0001;
    if (Math.abs(sweepPercent) < EPS || Math.abs(sweepPercent - 100) < EPS) {
      return '';
    }

    const startAngle = percentToAngle(startPercent);
    const endAngle = percentToAngle(endPercent);

    // Calculate outer arc points
    const outerStartX =
      centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180);
    const outerStartY =
      centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180);
    const outerEndX =
      centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180);
    const outerEndY =
      centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180);

    // Calculate inner arc points
    const innerStartX =
      centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const innerStartY =
      centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
    const innerEndX =
      centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
    const innerEndY =
      centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);

    // Use sweep percentage for largeArc flag
    const largeArc = sweepPercent > 50 ? 1 : 0;

    return `
      M ${outerStartX} ${outerStartY}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  };

  const handlePosition = (percent: number) => {
    const angle = percentToAngle(percent);
    const radius = (outerRadius + innerRadius) / 2;
    return {
      x: centerX + radius * Math.cos((angle * Math.PI) / 180),
      y: centerY + radius * Math.sin((angle * Math.PI) / 180),
    };
  };

  const handlePointerDown = (
    type: 'high-mid' | 'mid-low',
    event: ReactPointerEvent<SVGCircleElement>
  ) => {
    dragTypeRef.current = type;
    dragValuesRef.current = {
      high: highPercent,
      mid: midPercent,
      low: lowPercent,
    };
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (
        !dragTypeRef.current ||
        !svgRef.current ||
        pointerIdRef.current === null ||
        event.pointerId !== pointerIdRef.current
      ) {
        return;
      }

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        if (!dragTypeRef.current || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = size / rect.width;
        const scaleY = size / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const dx = x - centerX;
        const dy = y - centerY;

        // 计算鼠标相对于圆心的角度（从顶部顺时针）
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        angle = (angle + 90 + 360) % 360;
        const targetPercent = (angle / 360) * 100;

        const currentValues = dragValuesRef.current;

        if (dragTypeRef.current === 'high-mid') {
          // 限制在合理范围内，并确保mid不会太小
          const minHigh = 5;
          const maxHigh = 100 - currentValues.low - 5; // 确保mid至少5%
          const newHigh = Math.max(minHigh, Math.min(maxHigh, targetPercent));
          const newMid = 100 - newHigh - currentValues.low;

          dragValuesRef.current = {
            ...currentValues,
            high: newHigh,
            mid: newMid,
          };
          onHighChange(newHigh, true);
          onMidChange(newMid, true);
        } else if (dragTypeRef.current === 'mid-low') {
          // targetPercent代表high+mid的总和
          const minTotal = currentValues.high + 5; // mid至少5%
          const maxTotal = 95; // low至少5%
          const totalHighMid = Math.max(
            minTotal,
            Math.min(maxTotal, targetPercent)
          );
          const newMid = totalHighMid - currentValues.high;
          const newLow = 100 - totalHighMid;

          dragValuesRef.current = {
            ...currentValues,
            mid: newMid,
            low: newLow,
          };
          onMidChange(newMid, true);
          onLowChange(newLow, true);
        }
      });
    },
    [centerX, centerY, onHighChange, onMidChange, onLowChange, size]
  );

  const handlePointerUp = useCallback((event: PointerEvent) => {
    if (
      pointerIdRef.current !== null &&
      event.pointerId !== pointerIdRef.current
    ) {
      return;
    }

    // Cancel any pending RAF
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    dragTypeRef.current = null;
    pointerIdRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const highMidPos = handlePosition(highPercent);
  const midLowPos = handlePosition(highPercent + midPercent);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="select-none"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Mask ensures we render a clean ring */}
          <mask id={ringMaskId}>
            <circle cx={centerX} cy={centerY} r={outerRadius} fill="white" />
            <circle cx={centerX} cy={centerY} r={innerRadius} fill="black" />
          </mask>
        </defs>

        {/* Segments compose the full ring */}
        <g mask={`url(#${ringMaskId})`}>
          {/* High segment */}
          <path d={createDonutSegment(0, highPercent)} fill={colors.high} />
          {/* Mid segment */}
          <path
            d={createDonutSegment(highPercent, highPercent + midPercent)}
            fill={colors.mid}
          />
          {/* Low segment */}
          <path
            d={createDonutSegment(highPercent + midPercent, 100)}
            fill={colors.low}
          />
        </g>

        {/* High-Mid handle */}
        <circle
          cx={highMidPos.x}
          cy={highMidPos.y}
          r="10"
          fill="white"
          stroke="#64748b"
          strokeWidth="2"
          className="cursor-grab active:cursor-grabbing hover:drop-shadow-lg"
          onPointerDown={(event) => handlePointerDown('high-mid', event)}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        />

        {/* Mid-Low handle */}
        <circle
          cx={midLowPos.x}
          cy={midLowPos.y}
          r="10"
          fill="white"
          stroke="#64748b"
          strokeWidth="2"
          className="cursor-grab active:cursor-grabbing hover:drop-shadow-lg"
          onPointerDown={(event) => handlePointerDown('mid-low', event)}
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        />

        {/* Center label */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold fill-slate-600 dark:fill-slate-400 pointer-events-none"
        >
          {label}
        </text>
      </svg>

      <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.high }}
          />
          <span className="font-medium">
            {t('nutrition.distributionRing.high')}: {Math.round(highPercent)}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.mid }}
          />
          <span className="font-medium">
            {t('nutrition.distributionRing.mid')}: {Math.round(midPercent)}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.low }}
          />
          <span className="font-medium">
            {t('nutrition.distributionRing.low')}: {Math.round(lowPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}
