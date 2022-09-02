import { Fragment } from 'react'
import { cx, formatNumber } from '../../lib/utils'
import { TopPagesData, TopPagesSorting } from '../../lib/types/top-pages'
import useBarChart from '../../lib/hooks/use-bar-chart'
import useParams from '../../lib/hooks/use-params'
import useDomain from '../../lib/hooks/use-domain'

type TopPagesChartProps = {
  labels: number[]
  pages: string[]
  data: TopPagesData[]
}

export default function TopPagesChart({
  pages,
  labels,
  data,
}: TopPagesChartProps) {
  const ref = useBarChart(labels, pages)
  const [sorting, setSorting] = useParams({
    key: 'top_pages_sorting',
    values: Object.values(TopPagesSorting),
  })
  const { domain } = useDomain()
  return (
    <>
      <div className="grid gap-x-4 mb-4 grid-cols-[2fr,1fr,1fr] sm:grid-cols-[4fr,1fr,1fr]">
        <div className="text-xs tracking-widest font-medium uppercase text-left truncate">
          Content
        </div>
        <button
          className={cx(
            'text-xs tracking-widest font-medium uppercase truncate text-right hover:text-primary',
            sorting === TopPagesSorting.Visitors && 'text-primary'
          )}
          onClick={() => setSorting(TopPagesSorting.Visitors)}
        >
          Visitors
        </button>
        <button
          className={cx(
            'text-xs tracking-widest font-medium uppercase truncate text-right hover:text-primary',
            sorting === TopPagesSorting.Pageviews && 'text-primary'
          )}
          onClick={() => setSorting(TopPagesSorting.Pageviews)}
        >
          Pageviews
        </button>
      </div>
      <div className="grid gap-y-1 gap-x-4 relative grid-cols-[2fr,1fr,1fr] sm:grid-cols-[4fr,1fr,1fr]">
        {data.map(({ hits, pathname, visits }) => (
          <Fragment key={pathname}>
            <div className="flex items-center text-sm leading-5 text-primary h-9 px-4 py-2 rounded-md z-10 overflow-hidden">
              <a
                className="truncate hover:underline"
                target="_blank"
                href={`https://${domain}${pathname}`}
                rel="noreferrer"
              >
                {pathname}
              </a>
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
