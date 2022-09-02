import { Fragment } from 'react'
import { cx, formatNumber } from '../../lib/utils'
import useBarChart from '../../lib/hooks/use-bar-chart'
import { TopLocation, TopLocationsSorting } from '../../lib/types/top-locations'
import useParams from '../../lib/hooks/use-params'

type TopLocationsChartProps = {
  labels: number[]
  locations: string[]
  data: TopLocation[]
}

export default function TopLocationsChart({
  locations,
  labels,
  data,
}: TopLocationsChartProps) {
  const ref = useBarChart(labels, locations)
  const [sorting, setSorting] = useParams({
    key: 'top_locations_sorting',
    values: Object.values(TopLocationsSorting),
  })
  return (
    <>
      <div className="grid gap-x-4 mb-4 grid-cols-[2fr,1fr,1fr] sm:grid-cols-[4fr,1fr,1fr]">
        <div className="text-xs tracking-widest font-medium uppercase text-left truncate">
          Country
        </div>
        <button
          className={cx(
            'text-xs tracking-widest font-medium uppercase truncate text-right hover:text-primary',
            sorting === TopLocationsSorting.Visitors && 'text-primary'
          )}
          onClick={() => setSorting(TopLocationsSorting.Visitors)}
        >
          Visitors
        </button>
        <button
          className={cx(
            'text-xs tracking-widest font-medium uppercase truncate text-right hover:text-primary',
            sorting === TopLocationsSorting.Pageviews && 'text-primary'
          )}
          onClick={() => setSorting(TopLocationsSorting.Pageviews)}
        >
          Pageviews
        </button>
      </div>
      <div className="grid gap-y-1 gap-x-4 relative grid-cols-[2fr,1fr,1fr] sm:grid-cols-[4fr,1fr,1fr]">
        {data.map(({ hits, location, shortLocation, visits }) => (
          <Fragment key={location}>
            <div className="flex items-center text-sm leading-5 text-primary h-9 px-4 py-2 rounded-md z-10 overflow-hidden">
              <span className="hidden sm:block truncate">{location}</span>
              <span className="block sm:hidden truncate">{shortLocation}</span>
            </div>
            <div className="flex items-center justify-end text-neutral-64 h-9">
              {formatNumber(visits)}
            </div>
            <div className="flex items-center justify-end text-neutral-64 h-9">
              {formatNumber(hits)}
            </div>
          </Fragment>
        ))}
        <div className="grid gap-y-1 gap-x-4 absolute inset-0 z-0 grid-cols-[2fr,1fr,1fr] sm:grid-cols-[4fr,1fr,1fr]">
          <div className="w-full h-full" ref={ref} />
        </div>
      </div>
    </>
  )
}
