import useChart from './use-chart'
import resolveConfig from 'tailwindcss/resolveConfig'

import tailwindConfig from '../../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig) as any
const colors = fullConfig?.theme?.colors ?? {}

export default function useBarChart(xData: number[], yData: string[]) {
  return useChart({
    color: colors.primaryLight,
    grid: { left: 0, top: 0, right: 0, bottom: 0 },
    xAxis: {
      max: 'dataMax',
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'category',
      data: yData,
      inverse: true,
      animationDuration: 300,
      animationDurationUpdate: 300,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        type: 'bar',
        data: xData,
        label: {
          show: false,
        },
        itemStyle: {
          borderRadius: 4,
        },
        barWidth: 36,
        emphasis: { disabled: true },
      },
    ],
  })
}
