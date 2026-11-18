import { useId, useMemo } from 'react';

interface WavePathSpec {
  id: number;
  d: string;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
}

const TOTAL_CURVES = 36;

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function generateWavePaths(gradientIds: {
  primary: string;
  secondary: string;
  muted: string;
}): WavePathSpec[] {
  const paths: WavePathSpec[] = [];

  for (let i = 0; i < TOTAL_CURVES; i++) {
    const t = i / (TOTAL_CURVES - 1);
    const ease = t * t * (3 - 2 * t);
    const harmonic = Math.sin(t * Math.PI);

    const x0 = -10;
    const y0 = lerp(186, 256, ease) - harmonic * 6;

    const c1x = lerp(64, 32, ease) + harmonic * 8;
    const c1y = lerp(146, 134, ease) - harmonic * 10;

    const c2x = lerp(148, 158, ease) - harmonic * 6;
    const c2y = lerp(12, 126, ease) + harmonic * 12;

    const x1 = 270;
    const y1 = lerp(24, 188, ease);

    const d = `M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;

    let stroke: string;
    let strokeWidth: number;
    let strokeOpacity: number;

    if (i < 6) {
      stroke = `url(#${gradientIds.primary})`;
      strokeWidth = Number(lerp(1.3, 1.0, i / 5).toFixed(2));
      strokeOpacity = Number(lerp(0.64, 0.44, i / 5).toFixed(2));
    } else if (i < 16) {
      const localT = (i - 6) / 10;
      stroke =
        i % 3 === 0
          ? `url(#${gradientIds.primary})`
          : `url(#${gradientIds.secondary})`;
      strokeWidth = Number(lerp(0.95, 0.82, localT).toFixed(2));
      strokeOpacity = Number(lerp(0.42, 0.28, localT).toFixed(2));
    } else {
      const localT = (i - 16) / (TOTAL_CURVES - 17);
      stroke =
        i % 5 === 0
          ? `url(#${gradientIds.secondary})`
          : `url(#${gradientIds.muted})`;
      strokeWidth = Number(lerp(0.82, 0.72, localT).toFixed(2));
      strokeOpacity = Number(lerp(0.3, 0.16, localT).toFixed(2));
    }

    paths.push({ id: i, d, stroke, strokeWidth, strokeOpacity });
  }

  return paths;
}

export function SidebarWaveDecoration() {
  const uid = useId().replace(/:/g, '');
  const gradientIds = useMemo(
    () => ({
      primary: `ht-wave-primary-${uid}`,
      secondary: `ht-wave-secondary-${uid}`,
      muted: `ht-wave-muted-${uid}`,
    }),
    [uid],
  );

  const wavePaths = useMemo(
    () => generateWavePaths(gradientIds),
    [gradientIds],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 bottom-[74px] w-full h-[32%] min-h-[200px] max-h-[320px] z-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 260 260"
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full block"
        fill="none"
      >
        <defs>
          <linearGradient
            id={gradientIds.primary}
            x1="0%"
            y1="85%"
            x2="100%"
            y2="15%"
          >
            <stop offset="0%" stopColor="#E2A425" stopOpacity="1" />
            <stop offset="45%" stopColor="#D27728" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B39A6C" stopOpacity="0.55" />
          </linearGradient>

          <linearGradient
            id={gradientIds.secondary}
            x1="0%"
            y1="80%"
            x2="100%"
            y2="20%"
          >
            <stop offset="0%" stopColor="#D27728" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#B39A6C" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8A8172" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient
            id={gradientIds.muted}
            x1="0%"
            y1="90%"
            x2="100%"
            y2="10%"
          >
            <stop offset="0%" stopColor="#B39A6C" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#8A8172" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8A8172" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {wavePaths.map((curve) => (
          <path
            key={curve.id}
            d={curve.d}
            fill="none"
            stroke={curve.stroke}
            strokeWidth={curve.strokeWidth}
            strokeOpacity={curve.strokeOpacity}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
