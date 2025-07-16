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

export const CoreVitals = () => {
  const { data: coreVitals } = useEndpoint<
    {
      metric_name: string
      avg_value: number
      avg_delta: number
      measurements: number
      score: number
      status: string
      units: string
      description: string
      thresholds: string
    }[]
  >('web_vitals_current')

  return (
    <Card className="col-span-2">
      <Text variant="displayxsmall">Core Vitals</Text>
      <div className="flex flex-row gap-8 mb-6 justify-center h-full items-center">
        <CoreVitalGauge
          metric="ttfb"
          value={
            coreVitals?.find(v => v.metric_name === 'TTFB')?.avg_value || 0
          }
        />
        <CoreVitalGauge
          metric="fcp"
          value={
            (coreVitals?.find(v => v.metric_name === 'FCP')?.avg_value ??
              0) / 1000 || 0
          }
        />
        <CoreVitalGauge
          metric="lcp"
          value={
            (coreVitals?.find(v => v.metric_name === 'LCP')?.avg_value ??
              0) / 1000 || 0
          }
        />
        <CoreVitalGauge
          metric="cls"
          value={
            coreVitals?.find(v => v.metric_name === 'CLS')?.avg_value || 0
          }
        />
        <CoreVitalGauge
          metric="inp"
          value={
            coreVitals?.find(v => v.metric_name === 'INP')?.avg_value || 0
          }
        />
      </div>
    </Card>
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
    useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
      'top_devices'
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
