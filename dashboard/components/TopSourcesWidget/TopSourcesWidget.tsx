import { BarList } from '@tremor/react'
import Widget from '../Widget'
import useTopSources from '../../lib/hooks/use-top-sources'
import { formatNumber } from '../../lib/utils'
import { useMemo } from 'react'

export default function TopSourcesWidget() {
  const { data, status, warning } = useTopSources()
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.referrer,
        value: d.visits,
      })),
    [data?.data]
  )

  return (
    <Widget>
      <Widget.Title>Top Sources</Widget.Title>
      <Widget.Content
        status={status}
        noData={!chartData?.length}
        warning={warning?.message}
      >
        <div className="grid gap-x-4 grid-cols-[4fr,1fr] mb-4">
          <div className="text-xs tracking-widest font-medium uppercase text-left truncate">
            Refs
          </div>
          <div className="text-xs tracking-widest font-medium uppercase truncate text-right hover:text-primary">
            Visitors
          </div>
        </div>
        <BarList data={chartData} valueFormatter={formatNumber} />
      </Widget.Content>
    </Widget>
  )
}
