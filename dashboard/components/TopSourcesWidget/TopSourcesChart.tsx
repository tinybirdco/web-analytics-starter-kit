import { Fragment } from 'react'
import { cx, formatNumber } from '../../lib/utils'
import { TopSource } from '../../lib/types/top-sources'
import useBarChart from '../../lib/hooks/use-bar-chart'

type TopSourcesChartProps = {
  visits: number[]
  refs: string[]
  data: TopSource[]
}

export default function TopSourcesChart({
  refs,
  visits,
  data,
}: TopSourcesChartProps) {
  const ref = useBarChart(visits, refs)

  return (
    <>
      <div className="grid gap-x-4 mb-4 grid-cols-[4fr,1fr]">
        <div className="text-xs tracking-widest font-medium uppercase text-left truncate">
          Refs
        </div>
        <div className="text-xs tracking-widest font-medium uppercase truncate text-right hover:text-primary">
          Visitors
        </div>
      </div>
      <div className="grid gap-y-1 gap-x-4 relative grid-cols-[2fr,1fr] sm:grid-cols-[4fr,1fr]">
        {data.map(({ referrer, href, visits }) => {
          const Component = href ? 'a' : 'div'
          return (
            <Fragment key={referrer}>
              <Component
                className={cx(
                  'flex items-center text-sm leading-5 text-primary h-9 px-4 py-2 rounded-md z-10 overflow-hidden',
                  href && 'hover:underline'
                )}
                href={href}
                target={href ? '_blank' : undefined}
                rel={href ? 'noreferrer' : undefined}
              >
                <span className="truncate">{referrer}</span>
              </Component>
              <div className="flex items-center justify-end text-neutral-64 h-9">
                {formatNumber(visits)}
              </div>
            </Fragment>
          )
        })}
        <div className="grid gap-y-1 gap-x-4 absolute inset-0 z-0 grid-cols-2 sm:grid-cols-[4fr,1fr]">
          <div className="w-full h-full" ref={ref} />
        </div>
      </div>
    </>
  )
}
