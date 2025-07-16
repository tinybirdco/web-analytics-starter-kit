import React from "react";

const CATEGORY_COLORS: Record<string, string> = {
  excellent: "#2a2aff", // blue
  good: "#a5a5ff",     // light blue
  poor: "#e5e7eb",     // gray
};

const METRIC_THRESHOLDS: Record<string, { excellent: number; good: number; poor: number }> = {
  TTFB: { excellent: 500, good: 1000, poor: 1000 },
  FCP: { excellent: 1800, good: 3000, poor: 3000 },
  LCP: { excellent: 2500, good: 4000, poor: 4000 },
  CLS: { excellent: 0.1, good: 0.25, poor: 0.25 },
  INP: { excellent: 200, good: 500, poor: 500 },
};

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
  if (!metricEntries || metricEntries.length === 0) return null;

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
      </div>
      <div className="relative h-1 w-full mt-2 mb-2">

        <div className="flex h-full w-full rounded-full overflow-hidden">
          {segments.map((seg, i) => (
            <div key={seg.key} style={{ background: seg.color, width: seg.width }} />
          ))}
        </div>

        <div style={{ position: 'absolute', left: triangleLeft, top: -12  ,transform: 'rotate(180deg)' }}>
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