import { SqlChart } from '@/components/SqlChart'
import { Stack } from '@/components/Stack'
import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'

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

  return (
    <div>
      <Stack direction="row" gap={16}>
        <SqlChart
          title={'Visitors'}
          data={data || []}
          error={error?.message}
          isLoading={isLoading}
          summaryValue={'visits'}
          xAxisKey="date"
          yAxisKey="visits"
        />

        <SqlChart
          title={'Pageviews'}
          data={data || []}
          error={error?.message}
          isLoading={isLoading}
          summaryValue={'pageviews'}
          xAxisKey="date"
          yAxisKey="pageviews"
        />
      </Stack>

      <Stack direction="row" gap={16}>
        <PipeTable
          title="Top sources"
          data={topSources?.slice(0, 10) || []}
          columns={[
            { label: 'Path', key: 'referrer' },
            { label: 'Visitors', key: 'visits', align: 'right' },
            { label: 'Views', key: 'hits', align: 'right' },
          ]}
        />

        <PipeTable
          title="Top devices"
          data={topDevices?.slice(0, 10) || []}
          columns={[
            { label: 'Device', key: 'device' },
            { label: 'Visitors', key: 'visits', align: 'right' },
          ]}
        />
      </Stack>
    </div>
  )
}
