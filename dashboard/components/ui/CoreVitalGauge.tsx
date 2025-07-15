import React from "react";

// Hardcoded config for each core web vital
const CORE_VITALS = {
  ttfb: {
    label: "TTFB",
    unit: "ms",
    min: 0,
    pass: 800,
    warn: 1800,
    max: 3000,
    // green, yellow, red
    colors: ["#22c55e", "#facc15", "#ef4444"],
  },
  lcp: {
    label: "LCP",
    unit: "s",
    min: 0,
    pass: 2.5,
    warn: 4,
    max: 8,
    colors: ["#22c55e", "#facc15", "#ef4444"],
  },
  cls: {
    label: "CLS",
    unit: "score",
    min: 0,
    pass: 0.1,
    warn: 0.25,
    max: 1,
    colors: ["#22c55e", "#facc15", "#ef4444"],
  },
  inp: {
    label: "INP",
    unit: "ms",
    min: 0,
    pass: 200,
    warn: 500,
    max: 2000,
    colors: ["#22c55e", "#facc15", "#ef4444"],
  },
  fcp: {
    label: "FCP",
    unit: "s",
    min: 0,
    pass: 1.8,
    warn: 3,
    max: 6,
    colors: ["#22c55e", "#facc15", "#ef4444"],
  },
};

type MetricKey = keyof typeof CORE_VITALS;

interface CoreVitalGaugeProps {
  metric: MetricKey;
  value: number;
}

function getColor(value: number, config: typeof CORE_VITALS[MetricKey]) {
  if (value <= config.pass) return config.colors[0];
  if (value <= config.warn) return config.colors[1];
  return config.colors[2];
}

function getScore(value: number, config: typeof CORE_VITALS[MetricKey]) {
  // 100 if value <= pass, 50 if value == warn, 0 if value >= max, linear in between
  if (value <= config.pass) return 100;
  if (value >= config.max) return 0;
  if (value <= config.warn) {
    // Between pass and warn: 100 -> 50
    return 100 - ((value - config.pass) / (config.warn - config.pass)) * 50;
  }
  // Between warn and max: 50 -> 0
  return 50 - ((value - config.warn) / (config.max - config.warn)) * 50;
}

const RADIUS = 36;
const STROKE = 8;
const CIRCUM = 2 * Math.PI * RADIUS;

export const CoreVitalGauge: React.FC<CoreVitalGaugeProps> = ({ metric, value }) => {
  const config = CORE_VITALS[metric];
  if (!config) return null;
  const color = getColor(value, config);
  const score = Math.round(getScore(value, config));
  // Clamp arc to [0, 100]
  const arcLen = Math.max(0, Math.min(1, score / 100)) * CIRCUM;

  return (
    <div className="flex flex-col items-center w-32">
      <div className="relative w-20 h-20">
        <svg width={80} height={80} className="block">
          {/* Background circle */}
          <circle
            cx={40}
            cy={40}
            r={RADIUS}
            stroke="#e5e7eb"
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Foreground arc for score */}
          <circle
            cx={40}
            cy={40}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${arcLen} ${CIRCUM - arcLen}`}
            strokeDashoffset={CIRCUM}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            className="transition-all duration-500"
          />
        </svg>
        {/* Score in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-black">{score}</span>
        </div>
      </div>
      {/* Value and unit */}
      <div className="mt-2 text-lg font-semibold text-gray-700 flex items-baseline">
        {value?.toFixed(2)}
        {config.unit && <span className="text-base text-gray-400 ml-1">{config.unit}</span>}
      </div>
      {/* Label */}
      <div className="text-base text-gray-400 font-medium mt-0.5 tracking-wide uppercase">
        {config.label}
      </div>
    </div>
  );
};

export default CoreVitalGauge; 