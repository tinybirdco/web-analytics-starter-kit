import useChart from '../../lib/hooks/use-chart'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig) as any
const colors = fullConfig?.theme?.colors ?? {}

type TrendChartProps = {
  visits: number[]
  dates: string[]
}

export default function TrendChart({ dates, visits }: TrendChartProps) {
  const ref = useChart({
    xAxis: {
      data: dates,
      axisLabel: {
        padding: 0,
        margin: 0,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      axisLabel: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: '',
        type: 'bar',
        data: visits,
        barGap: '0%',
        barCategoryGap: '3%',
        barWidth: '97%',
        barMinHeight: 2,
      },
    ],
    tooltip: {
      show: true,
      borderWidth: 0,
      backgroundColor: colors?.secondary,
      textStyle: {
        color: colors['neutral-01'],
      },
      formatter: `{c} visitors<br/>{b}`,
    },
  })

  return <div className="h-10 w-full" ref={ref} />
}
