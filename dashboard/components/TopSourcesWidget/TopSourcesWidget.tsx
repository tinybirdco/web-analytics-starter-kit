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
        href: d.href,
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
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-4 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Refs
          </div>
          <div className="col-span-1 font-semibold text-xs text-right tracking-widest uppercase h-5">
            Visitors
          </div>

          <div className="col-span-4">
            <BarList data={chartData} valueFormatter={_ => ''} />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ referrer, visits }) => (
              <div
                key={referrer}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {formatNumber(visits ?? 0)}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
