import React from "react";

// Color mapping for performance categories
const CATEGORY_COLORS: Record<string, string> = {
  excellent: "#2a2aff", // blue
  good: "#a5a5ff",     // light blue
  poor: "#e5e7eb",     // gray
};

// Hardcoded thresholds for each metric (ms for all except CLS)
const METRIC_THRESHOLDS: Record<string, { excellent: number; good: number; poor: number }> = {
  TTFB: { excellent: 500, good: 1000, poor: 1000 },
  FCP: { excellent: 1800, good: 3000, poor: 3000 },
  LCP: { excellent: 2500, good: 4000, poor: 4000 },
  CLS: { excellent: 0.1, good: 0.25, poor: 0.25 },
  INP: { excellent: 200, good: 500, poor: 500 },
};

// Triangle SVG component
const Triangle = ({ color, style = {} }: { color: string; style?: React.CSSProperties }) => (
  <svg width="12" height="9" viewBox="0 0 16 10" style={style}>
    <polygon points="8,0 16,10 0,10" fill={color} />
  </svg>
);

interface MetricEntry {
  metric_name: string;
  performance_category: string;
  avg_value: number;
  measurement_count: number;
  percentage: number;
  total_measurements: number;
  score: number;
  units: string;
  thresholds: string;
  description: string;
  domain: string;
}

interface CoreVitalGaugeProps {
  metricEntries: MetricEntry[];
}

export const CoreVitalGauge: React.FC<CoreVitalGaugeProps> = ({ metricEntries }) => {
  // Loading/blank state
  if (!metricEntries || metricEntries.length === 0) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-xl animate-pulse">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg bg-gray-200 rounded w-16 h-6" />
          <span className="text-2xl font-bold bg-gray-200 rounded w-20 h-8" />
          <span className="rounded-full bg-gray-100 text-gray-400 px-3 py-1 text-sm font-semibold w-10 h-6" />
        </div>
        <div className="relative h-1 w-full mt-2 mb-2">
          <div className="flex h-full w-full rounded-full overflow-hidden">
            <div className="bg-gray-200 w-full h-full" />
          </div>
        </div>
        <div className="text-gray-300 text-sm mt-1 h-4 bg-gray-100 rounded w-3/4" />
      </div>
    );
  }

  const { metric_name, units, description } = metricEntries[0];

  const mainEntry = metricEntries.reduce((a, b) => (a.measurement_count > b.measurement_count ? a : b));
  const avgValue = mainEntry.avg_value;
  const score = mainEntry.score;

  const thresholds = METRIC_THRESHOLDS[metric_name.toUpperCase()] || { excellent: 1, good: 2, poor: 3 };
  const min = 0;
  const max = thresholds.poor;

  const segments = metricEntries.map((entry, i) => ({
    color: CATEGORY_COLORS[entry.performance_category] || '#e5e7eb',
    width: `${entry.percentage}%`,
    key: entry.performance_category + i,
    category: entry.performance_category,
  }));

  let leftPercent = ((avgValue - min) / (max - min)) * 100;
  leftPercent = Math.max(0, Math.min(100, leftPercent));
  const triangleLeft = `calc(${leftPercent}% - 8px)`;

  return (
    <div className="flex flex-col gap-2 w-full max-w-xl">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg">{metric_name}</span>
        <span className="text-2xl font-bold">{avgValue.toFixed(2)}<span className="text-base font-normal text-gray-500 ml-1">{units}</span></span>
        {/* <span className="rounded-full bg-green-50 text-green-700 px-3 py-1 text-sm font-semibold">{score}</span> */}
      </div>
      <div className="relative h-1 w-full mt-2 mb-2">
        <div className="flex h-full w-full rounded-full overflow-hidden">
          {segments.map((seg, i) => (
            <div key={seg.key} style={{ background: seg.color, width: seg.width }} />
          ))}
        </div>
        <div style={{ position: 'absolute', left: triangleLeft, top: -12, transform: 'rotate(180deg)' }}>
          <Triangle color="#2a2aff" />
        </div>
        <div style={{ position: 'absolute', left: triangleLeft, bottom: -12 }}>
          <Triangle color="#a5a5ff" />
        </div>
      </div>
      <div className="text-gray-500 text-sm mt-1">{description}</div>
    </div>
  );
};

export default CoreVitalGauge; 