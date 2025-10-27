import { useCallback, useEffect, useRef, useState, useId } from 'react';

interface SnapRingProps {
  // Current value as a ratio [0,1]
  value: number;
  // Discrete snap nodes (ratios in [0,1])
  nodes: number[];
  // Called continuously during drag with raw ratio (not snapped)
  onInput?: (ratio: number) => void;
  // Called on drag end with snapped ratio
  onChange: (ratio: number) => void;
  size?: number; // px
  thickness?: number; // ring thickness
  colorActive?: string;
  colorRest?: string;
  handleColor?: string;
  label?: string;
  showMarkers?: boolean; // enable markers feature
  markersOnDrag?: boolean; // show markers only while dragging (default true)
}

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function SnapRing({
  value,
  nodes,
  onInput,
  onChange,
  size = 160,
  thickness = 0.25, // fraction of radius
  colorActive = '#3b82f6',
  colorRest = '#e5e7eb',
  handleColor = '#ffffff',
  label,
  showMarkers = true,
  markersOnDrag = true,
}: SnapRingProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ratio, setRatio] = useState<number>(clamp(value, 0, 1));
  const pointerIdRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const EPS = 0.001;
  const filterId = useId();

  useEffect(() => {
    if (!dragging) setRatio(clamp(value, 0, 1));
  }, [value, dragging]);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size / 2) * (1 - 0.05); // padding 5%
  const innerR = outerR * (1 - thickness);

  const angleFromRatio = (r: number) => -90 + r * 360; // top origin
  const ratioFromAngle = (a: number) => ((a + 90 + 360) % 360) / 360;

  const pointOnRing = (r: number) => {
    const a = (angleFromRatio(r) * Math.PI) / 180;
    const rad = (outerR + innerR) / 2;
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
  };

  const arcPath = (r0: number, r1: number) => {
    // Ensure not degenerate
    const startA = angleFromRatio(r0);
    const endA = angleFromRatio(r1);
    const largeArc = (r1 - r0 + 1) % 1 > 0.5 ? 1 : 0;
    const sx = cx + outerR * Math.cos((startA * Math.PI) / 180);
    const sy = cy + outerR * Math.sin((startA * Math.PI) / 180);
    const ex = cx + outerR * Math.cos((endA * Math.PI) / 180);
    const ey = cy + outerR * Math.sin((endA * Math.PI) / 180);
    const six = cx + innerR * Math.cos((startA * Math.PI) / 180);
    const siy = cy + innerR * Math.sin((startA * Math.PI) / 180);
    const eix = cx + innerR * Math.cos((endA * Math.PI) / 180);
    const eiy = cy + innerR * Math.sin((endA * Math.PI) / 180);
    return `M ${sx} ${sy}
            A ${outerR} ${outerR} 0 ${largeArc} 1 ${ex} ${ey}
            L ${eix} ${eiy}
            A ${innerR} ${innerR} 0 ${largeArc} 0 ${six} ${siy}
            Z`;
  };

  const endPos = pointOnRing(clamp(ratio, EPS, 1 - EPS));

  const onPointerMove = useCallback(
    (ev: PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = svgRef.current!.getBoundingClientRect();
        const x = ev.clientX - rect.left - cx;
        const y = ev.clientY - rect.top - cy;
        const angle = Math.atan2(y, x) * (180 / Math.PI);
        const r = clamp(ratioFromAngle(angle), 0, 1);
        setRatio(r);
        onInput?.(r);
      });
    },
    [dragging, cx, cy, onInput]
  );

  const onPointerUp = useCallback(
    (ev: PointerEvent) => {
      if (
        pointerIdRef.current !== null &&
        ev.pointerId !== pointerIdRef.current
      )
        return;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setDragging(false);
      pointerIdRef.current = null;
      // snap to nearest node
      if (nodes && nodes.length > 0) {
        const nearest = nodes.reduce(
          (best, n) =>
            Math.abs(n - ratio) < Math.abs(best - ratio) ? n : best,
          nodes[0]
        );
        const snapped = clamp(nearest, 0, 1);
        setRatio(snapped);
        onChange(snapped);
      } else {
        onChange(clamp(ratio, 0, 1));
      }
    },
    [ratio, nodes, onChange]
  );

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, onPointerMove, onPointerUp]);

  const markersOpacity =
    showMarkers && (markersOnDrag ? dragging : true) ? 1 : 0;

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      style={{ touchAction: 'none' }}
      onPointerDown={(e) => {
        pointerIdRef.current = e.pointerId;
        (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
        setDragging(true);
      }}
    >
      {/* Drop shadow filter for markers */}
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          {/* soft glow (dark theme) */}
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="1.5"
            floodColor="#ffffff"
            floodOpacity="0.45"
          />
          {/* subtle shadow (light theme) */}
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="1.5"
            floodColor="#000000"
            floodOpacity="0.25"
          />
        </filter>
      </defs>
      {/* Rest arc */}
      <path d={arcPath(clamp(ratio, EPS, 1 - EPS), 1 - EPS)} fill={colorRest} />
      {/* Active arc from top (0) to ratio */}
      <path d={arcPath(EPS, clamp(ratio, EPS, 1 - EPS))} fill={colorActive} />

      {/* Markers with fade transition */}
      <g style={{ opacity: markersOpacity, transition: 'opacity 180ms ease' }}>
        {showMarkers &&
          nodes.map((n, i) => {
            const p = pointOnRing(clamp(n, EPS, 1 - EPS));
            return (
              <circle
                key={`mark-${i}`}
                cx={p.x}
                cy={p.y}
                r={3.5}
                fill="var(--foreground)"
                stroke="none"
                filter={`url(#${filterId})`}
                pointerEvents="none"
              />
            );
          })}
      </g>

      {/* Handle */}
      <circle
        cx={endPos.x}
        cy={endPos.y}
        r={10}
        fill={handleColor}
        stroke="#64748b"
        strokeWidth={2}
      />

      {/* Center label */}
      {label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-bold fill-slate-600 dark:fill-slate-400 pointer-events-none"
        >
          {label}
        </text>
      )}
    </svg>
  );
}
