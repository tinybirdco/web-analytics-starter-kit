import Widget from '../Widget'
import useTopLocations from '../../lib/hooks/use-top-locations'
import { BarList } from '@tremor/react'
import { useMemo } from 'react'
import useParams from '../../lib/hooks/use-params'
import { TopLocationsSorting } from '../../lib/types/top-locations'
import { cx } from '../../lib/utils'

export default function TopLocationsWidget() {
  const { data, status, warning } = useTopLocations()
  const [sorting, setSorting] = useParams({
    key: 'top_locations_sorting',
    values: Object.values(TopLocationsSorting),
  })
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.location,
        value: d[sorting],
      })),
    [data?.data, sorting]
  )

  return (
    <Widget>
      <Widget.Title>Top Pages</Widget.Title>
      <Widget.Content
        status={status}
        noData={!data?.data?.length}
        warning={warning?.message}
      >
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-3 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Country
          </div>
          <div
            className={cx(
              'col-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopLocationsSorting.Visitors && 'text-primary'
            )}
            onClick={() => setSorting(TopLocationsSorting.Visitors)}
          >
            Visits
          </div>
          <div
            className={cx(
              'col-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopLocationsSorting.Pageviews && 'text-primary'
            )}
            onClick={() => setSorting(TopLocationsSorting.Pageviews)}
          >
            Pageviews
          </div>

          <div className="col-span-3">
            <BarList data={chartData} valueFormatter={_ => ''} />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ location, visits }) => (
              <div
                key={location}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {visits}
              </div>
            ))}
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ location, hits }) => (
              <div
                key={location}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {hits}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
