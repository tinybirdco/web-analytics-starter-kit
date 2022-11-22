import Widget from '../Widget'
import useTopPages from '../../lib/hooks/use-top-pages'
import { BarList } from '@tremor/react'
import { useMemo } from 'react'
import { cx, formatNumber } from '../../lib/utils'
import { TopPagesSorting } from '../../lib/types/top-pages'
import useParams from '../../lib/hooks/use-params'

export default function TopPagesWidget() {
  const { data, status, warning } = useTopPages()
  const [sorting, setSorting] = useParams({
    key: 'top_pages_sorting',
    values: Object.values(TopPagesSorting),
  })
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: d.pathname,
        value: d[sorting],
      })),
    [data?.data, sorting]
  )

  return (
    <Widget
      status={status}
      warning={warning?.message}
      noData={!chartData.length}
    >
      <Widget.Title>Top Pages</Widget.Title>
      <Widget.Content>
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-3 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Content
          </div>
          <div
            className={cx(
              'col-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopPagesSorting.Visitors && 'text-primary'
            )}
            onClick={() => setSorting(TopPagesSorting.Visitors)}
          >
            Visits
          </div>
          <div
            className={cx(
              'col-span-1 row-span-1 font-semibold text-xs text-right tracking-widest uppercase cursor-pointer h-5',
              sorting === TopPagesSorting.Pageviews && 'text-primary'
            )}
            onClick={() => setSorting(TopPagesSorting.Pageviews)}
          >
            Pageviews
          </div>

          <div className="col-span-3">
            <BarList
              data={chartData}
              color="blue"
              showAnimation={true}
              valueFormatter={_ => ''}
            />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ pathname, visits }) => (
              <div
                key={pathname}
                className="flex items-center justify-end w-full font-bold h-9"
              >
                {formatNumber(visits ?? 0)}
              </div>
            ))}
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ pathname, hits }) => (
              <div
                key={pathname}
                className="flex items-center justify-end w-full font-bold h-9"
              >
                {formatNumber(hits)}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
