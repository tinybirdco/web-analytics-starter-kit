import { SqlChart } from '@/components/ui/SqlChart'
import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { useTimeRange } from '@/lib/hooks/use-time-range'
import { CoreVitalGauge } from '@/components/ui/CoreVitalGauge'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { getMetricLimits } from '@/lib/constants'
import React, { useState } from 'react'

// Import all the individual widgets
import {
  Visitors,
  Pageviews,
  TopPages,
  TopLocations,
  TopSources,
  TopDevices,
  TopBrowsers,
  ButtonPressAnalytics,
} from './widgets/index'

// Helper function to determine date format based on time range
const getAxisDateFormat = (timeRange: string): string => {
  // For today or yesterday, show time format (9:15pm)
  if (timeRange === 'today' || timeRange === 'yesterday') {
    return 'p'
  }
  // For all other ranges, show date format (Jun 3)
  return 'MMM d'
}

export const CoreVitals = () => {
  const [selectedPercentile, setSelectedPercentile] = useState<'p75' | 'p90' | 'p95' | 'p99'>('p75')
  const { value: timeRange } = useTimeRange()

  // Original gauge chart data structure
  type MetricEntry = {
    metric_name: string
    performance_category: string
    avg_value: number
    measurement_count: number
    percentage: number
    total_measurements: number
    score: number
    units: string
    thresholds: string
    description: string
    domain: string
  }

  // Time series data structure
  type TimeSeriesEntry = {
    hour: string
    metric_name: string
    p75: number
    p90: number
    p95: number
    p99: number
    measurements: number
    domain: string
  }

  const { data: coreVitals } = useEndpoint<MetricEntry[]>(
    'web_vitals_distribution'
  )

  const { data: coreVitalsTimeseries, error, isLoading } = useEndpoint<TimeSeriesEntry[]>(
    'web_vitals_timeseries'
  )

  // Group by metric_name for gauge charts
  const grouped: Record<string, MetricEntry[]> = {}
  if (coreVitals) {
    for (const entry of coreVitals) {
      if (!grouped[entry.metric_name]) grouped[entry.metric_name] = []
      grouped[entry.metric_name].push(entry)
    }
  }

  // Group by metric_name for time series charts
  const groupedTimeseries: Record<string, TimeSeriesEntry[]> = {}
  if (coreVitalsTimeseries) {
    for (const entry of coreVitalsTimeseries) {
      if (!groupedTimeseries[entry.metric_name]) groupedTimeseries[entry.metric_name] = []
      groupedTimeseries[entry.metric_name].push(entry)
    }
  }

  // Define metric configurations for time series charts
  const metricConfigs = {
    'TTFB': { title: 'Time to First Byte', unit: 'ms', color: '#2D27F7', limit: getMetricLimits('TTFB') },
    'FCP': { title: 'First Contentful Paint', unit: 'ms', color: '#2D27F7', limit: getMetricLimits('FCP') },
    'LCP': { title: 'Largest Contentful Paint', unit: 'ms', color: '#2D27F7', limit: getMetricLimits('LCP') },
    'CLS': { title: 'Cumulative Layout Shift', unit: '', color: '#2D27F7', limit: getMetricLimits('CLS') },
    'INP': { title: 'Interaction to Next Paint', unit: 'ms', color: '#2D27F7', limit: getMetricLimits('INP') }
  }

  return (
    <div className="relative">
      {/* Percentile Selection Tabs - Absolutely positioned on the right */}
      <div className="absolute -top-[56px] right-0 z-10">
        <Tabs value={selectedPercentile} onValueChange={(value) => setSelectedPercentile(value as any)} variant="pill">
          <TabsList>
            <TabsTrigger value="p75">P75</TabsTrigger>
            <TabsTrigger value="p90">P90</TabsTrigger>
            <TabsTrigger value="p95">P95</TabsTrigger>
            <TabsTrigger value="p99">P99</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['TTFB', 'FCP', 'LCP', 'CLS', 'INP'].map(metric => (
          <Card key={metric}>
            <div className="space-y-4">
              {/* Gauge Chart */}
              <CoreVitalGauge
                key={metric}
                metricEntries={grouped?.[metric] ?? []}
                timeseriesData={groupedTimeseries[metric] || []}
                selectedPercentile={selectedPercentile}
              />
              
              {/* Time Series Chart */}
              <SqlChart
                title=""
                data={groupedTimeseries[metric] || []}
                error={error?.message}
                isLoading={isLoading}
                xAxisKey="hour"
                yAxisKey={selectedPercentile}
                limit={metricConfigs[metric as keyof typeof metricConfigs]?.limit || undefined}
                color={metricConfigs[metric as keyof typeof metricConfigs]?.color || '#2D27F7'}
                unit={metricConfigs[metric as keyof typeof metricConfigs]?.unit || ''}
                tooltipDateFormat="yyyy-MM-dd HH:mm"
                axisDateFormat={getAxisDateFormat(timeRange)}
                height={220}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export const Widgets = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {/* Import widgets from the new structure */}
        <Visitors />
        <Pageviews />
        <TopPages />
        <TopLocations />
        <TopSources />
        <TopDevices />
        <TopBrowsers />
        <ButtonPressAnalytics />
      </div>
    </>
  )
}

