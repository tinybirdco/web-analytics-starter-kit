// Metric thresholds for Core Web Vitals (ms for all except CLS)
export const METRIC_THRESHOLDS: Record<string, { excellent: number; good: number; poor: number }> = {
  TTFB: { excellent: 500, good: 1000, poor: 1000 },
  FCP: { excellent: 1800, good: 3000, poor: 3000 },
  LCP: { excellent: 2500, good: 4000, poor: 4000 },
  CLS: { excellent: 0.1, good: 0.25, poor: 0.25 },
  INP: { excellent: 200, good: 500, poor: 500 },
};

// Helper function to get limits array [excellent, good] for charts
export const getMetricLimits = (metricName: string): [number, number] => {
  const thresholds = METRIC_THRESHOLDS[metricName.toUpperCase()];
  if (!thresholds) {
    return [1000, 2000]; // fallback values
  }
  return [thresholds.good, thresholds.excellent];
}; 