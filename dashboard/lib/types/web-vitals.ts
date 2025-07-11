export type WebVitalMetric = 'LCP' | 'TTFB' | 'FCP' | 'INP' | 'CLS'

export interface WebVitalCurrent {
  metric_name: WebVitalMetric
  avg_value: number
  avg_delta: number
  measurements: number
  score: number
  status: string
  units: string
  description: string
  thresholds: string
}

export interface WebVitalDistribution {
  metric_name: WebVitalMetric
  performance_category: 'excellent' | 'good' | 'poor'
  avg_value: number
  measurement_count: number
  percentage: number
  total_measurements: number
  score: number
  units: string
  thresholds: string
  description: string
}

export interface WebVitalRoute {
  route: string
  overall_score: number
  lcp_avg: number
  ttfb_avg: number
  fcp_avg: number
  inp_avg: number
  cls_avg: number
  lcp_score: number
  ttfb_score: number
  fcp_score: number
  inp_score: number
  cls_score: number
  metric_units: string
  analysis_type: 'routes' | 'pathnames'
}