import useChart from '../../lib/hooks/use-chart'
import { TopBrowser } from '../../lib/types/top-browsers'

type BrowsersChartProps = {
  data: TopBrowser[]
}

export default function BrowsersChart({ data }: BrowsersChartProps) {
  const ref = useChart({
    grid: { left: 0, top: 0, right: 0, bottom: 0 },
    series: [
      {
        type: 'pie',
        label: {
          show: false,
        },
        emphasis: {
          disabled: true,
        },
        tooltip: {
          show: true,
        },
        data: data.map(({ browser, opacity, visits }) => ({
          value: visits,
          name: browser,
          itemStyle: {
            opacity,
          },
        })),
        radius: '100%',
      },
    ],
  })
  return <div className="w-full h-full" ref={ref} />
}
