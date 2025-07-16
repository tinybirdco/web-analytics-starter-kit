import { SqlChart } from '@/components/ui/SqlChart'
import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellText,
  TableCellMono,
  TableCellProgress,
  TableCellDelta,
  TableCellCombined,
} from '@/components/table/TableCells'
import { CoreVitalGauge } from '@/components/ui/CoreVitalGauge'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import React from 'react'

export const CoreVitals = ({ domain }: { domain?: string }) => {
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

  const { data: coreVitals } = useEndpoint<MetricEntry[]>(
    'web_vitals_distribution',
    domain && domain !== 'ALL' ? { domain } : {}
  )

  // Group by metric_name (and optionally domain if needed)
  const grouped: Record<string, MetricEntry[]> = {}
  if (coreVitals) {
    for (const entry of coreVitals) {
      if (!grouped[entry.metric_name]) grouped[entry.metric_name] = []
      grouped[entry.metric_name].push(entry)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {['TTFB', 'FCP', 'LCP', 'CLS', 'INP'].map(metric => (
        <Card key={metric}>
          <CoreVitalGauge
            key={metric}
            metricEntries={grouped?.[metric] ?? []}
          />
        </Card>
      ))}
    </div>
  )
}

export const Widgets = ({ domain }: { domain?: string }) => {
  const { data, error, isLoading } =
    useEndpoint<{ visits: number; pageviews: number }[]>('kpis', domain && domain !== 'ALL' ? { domain } : {})

  const { data: topSources } =
    useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
      'top_sources',
      domain && domain !== 'ALL' ? { domain } : {}
    )

  const { data: topDevices } =
    useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
      'top_devices',
      domain && domain !== 'ALL' ? { domain } : {}
    )

  // Demo: calculate max and deltas for progress and delta columns
  const maxVisitors =
    topSources?.reduce((max, row) => Math.max(max, row.visits), 0) || 1

  const maxViews =
    topSources?.reduce((max, row) => Math.max(max, row.hits), 0) || 1

  const getDelta = (row: any) =>
    row.referrer === 'google.com' ? -2 : row.referrer === '(none)' ? -2 : 6

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {/* Core Vitals moved to CoreVitals component */}
        <Card>
          <SqlChart
            title={'Visitors'}
            data={data || []}
            error={error?.message}
            isLoading={isLoading}
            summaryValue={'visits'}
            xAxisKey="date"
            yAxisKey="visits"
          />
        </Card>

        <Card>
          <SqlChart
            title={'Pageviews'}
            data={data || []}
            error={error?.message}
            isLoading={isLoading}
            summaryValue={'pageviews'}
            xAxisKey="date"
            yAxisKey="pageviews"
          />
        </Card>

        <Card>
          <PipeTable
            title="Top sources"
            data={topSources?.slice(0, 10) || []}
            columns={[
              {
                label: 'Path',
                key: 'referrer',
                render: row => <TableCellText>{row.referrer}</TableCellText>,
              },
              {
                label: 'Visitors',
                key: 'visits',
                align: 'left',
                render: row => (
                  <TableCellCombined>
                    <TableCellProgress value={row.visits} max={maxVisitors} />
                    <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
                    <TableCellDelta delta={getDelta(row)} />
                  </TableCellCombined>
                ),
              },
              {
                label: 'Views',
                key: 'hits',
                align: 'left',
                render: row => (
                  <TableCellCombined>
                    <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
                    <TableCellDelta delta={getDelta(row)} />
                  </TableCellCombined>
                ),
              },
            ]}
          />
        </Card>

        <Card>
          <PipeTable
            title="Top devices"
            data={topDevices?.slice(0, 10) || []}
            columns={[
              { label: 'Device', key: 'device' },
              { label: 'Visitors', key: 'visits', align: 'right' },
            ]}
          />
        </Card>
      </div>
    </>
  )
}
