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

export const METRIC_DESCRIPTIONS = {
  TTFB: {
    name: 'Time to First Byte',
    unit: 'ms',
    description: 'Server latency, or time from request to first byte received by the browser.',
  },
  FCP: {
    name: 'First Contentful Paint',
    unit: 'ms',
    description: 'Time until any DOM content (e.g. text, image) is rendered on screen.',
  },
  LCP: {
    name: 'Largest Contentful Paint',
    unit: 'ms',
    description: 'Render time of the largest visible element.',
  },
  CLS: {
    name: 'Cumulative Layout Shift',
    unit: '',
    description: 'Visual stability, sum of unexpected layout shifts during load.',
  },
  INP: {
    name: 'Interaction to Next Paint',
    unit: 'ms',
    description: 'End-to-end latency for user input, from interaction to visual feedback.',
  },
  FID: {
    name: 'First Input Delay',
    unit: 'ms',
    description: 'Input responsiveness, delay between first interaction and handler execution.',
  },
}
