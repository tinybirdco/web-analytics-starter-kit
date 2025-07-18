import { SqlChart } from '@/components/ui/SqlChart'
import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellText,
  TableCellMono,
  TableCellCountry,
  TableCellBrowser,
  TableCellDevice,
} from '@/components/table/TableCells'
import { CoreVitalGauge } from '@/components/ui/CoreVitalGauge'
import { Card } from '@/components/ui/Card'
import React from 'react'

export const CoreVitals = () => {
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
    'web_vitals_distribution'
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

export const Widgets = () => {
  const { data, error, isLoading } =
    useEndpoint<{ visits: number; pageviews: number }[]>('kpis')

  const { data: topSources } =
    useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
      'top_sources'
    )

  const { data: topDevices } =
    useEndpoint<{ device: string; visits: number; hits: number }[]>(
      'top_devices'
    )

  // New endpoints
  const { data: topPages } =
    useEndpoint<{ pathname: string; visits: number; hits: number }[]>(
      'top_pages'
    )

  const { data: topLocations } =
    useEndpoint<{ location: string; visits: number; hits: number }[]>(
      'top_locations'
    )

  const { data: topBrowsers } =
    useEndpoint<{ browser: string; visits: number; hits: number }[]>(
      'top_browsers'
    )

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

        {/* Top Pages */}
        <Card maxHeight={400}>
          <PipeTable
            title="Top pages"
            data={topPages?.slice(0, 10) || []}
            columns={[
              {
                label: 'Pathname',
                key: 'pathname',
                render: row => <TableCellText>{row.pathname}</TableCellText>,
              },
              {
                label: 'Visitors',
                key: 'visits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
                ),
              },
              {
                label: 'Views',
                key: 'hits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
                ),
              },
            ]}
          />
        </Card>

        {/* Top Locations */}
        <Card maxHeight={400}>
          <PipeTable
            title="Top locations"
            data={topLocations?.slice(0, 10) || []}
            columns={[
              {
                label: 'Location',
                key: 'location',
                render: row => <TableCellCountry code={row.location} />,
              },
              {
                label: 'Visitors',
                key: 'visits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
                ),
              },
              {
                label: 'Views',
                key: 'hits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
                ),
              },
            ]}
          />
        </Card>

        {/* Top Sources (already present) */}
        <Card maxHeight={400}>
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
                align: 'right',
                render: row => (
                  <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
                ),
              },
              {
                label: 'Views',
                key: 'hits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
                ),
              },
            ]}
          />
        </Card>

        {/* Top Devices (already present) */}
        <Card maxHeight={400}>
          <PipeTable
            title="Top devices"
            data={topDevices?.slice(0, 10) || []}
            columns={[
              {
                label: 'Device',
                key: 'device',
                render: row => <TableCellDevice code={row.device} />,
              },
              {
                label: 'Visitors',
                key: 'visits',
                align: 'right',
                render: row => (
                  <TableCellMono>
                    {row.visits?.toLocaleString?.()}
                  </TableCellMono>
                ),
              },
              {
                label: 'Views',
                key: 'hits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
                ),
              },
            ]}
          />
        </Card>

        {/* Top Browsers */}
        <Card maxHeight={400}>
          <PipeTable
            title="Top browsers"
            data={topBrowsers?.slice(0, 10) || []}
            columns={[
              {
                label: 'Browser',
                key: 'browser',
                render: row => <TableCellBrowser code={row.browser} />,
              },
              {
                label: 'Visitors',
                key: 'visits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
                ),
              },
              {
                label: 'Views',
                key: 'hits',
                align: 'right',
                render: row => (
                  <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </>
  )
}
