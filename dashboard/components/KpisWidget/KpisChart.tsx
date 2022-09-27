import * as echarts from 'echarts'

import useChart from '../../lib/hooks/use-chart'
import { ChartValue } from '../../lib/types/charts'
import { KpiType, KPI_OPTIONS } from '../../lib/types/kpis'
import { colors } from '../../styles/theme'

type KPIsChartProps = {
  dates: string[]
  data: ChartValue[][]
  kpi: KpiType
}

export default function KPIsChart({ dates, data, kpi }: KPIsChartProps) {
  const [firstPoints, lastPoints] = data
  const ref = useChart({
    grid: {
      left: 50,
      top: 30,
      right: 50,
      bottom: 50,
    },
    xAxis: {
      boundaryGap: false,
      type: 'category',
      data: dates,
      axisLine: {
        show: false,
        lineStyle: {},
      },
      axisTick: {
        show: false,
      },
      splitLine: {},
      axisLabel: {
        fontSize: 11,
        fontWeight: 500,
        margin: 16,
        formatter: (value: string) => value.toUpperCase(),
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        fontWeight: 500,
      },
      splitLine: {
        lineStyle: {
          color: colors['neutral-08'],
        },
      },
    },
    series: [
      {
        data: firstPoints,
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors?.primary },
            { offset: 1, color: colors['neutral-01'] },
          ]),
          opacity: 0.1,
        },
        itemStyle: {
          opacity: 0,
        },
        lineStyle: {
          width: 4,
          cap: 'square',
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            borderWidth: 3,
          },
        },
        showSymbol: false,
      },
      {
        showSymbol: false,
        data: lastPoints,
        type: 'line',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors.primary },
            { offset: 1, color: colors['neutral-08'] },
          ]),
          opacity: 0.1,
        },
        itemStyle: {
          opacity: 0,
        },
        lineStyle: { type: 5, width: 4 },
        emphasis: {
          itemStyle: {
            opacity: 1,
            borderWidth: 3,
          },
        },
      },
    ],
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        animation: false,
        lineStyle: {
          opacity: 0,
        },
      },
      borderWidth: 0,
      backgroundColor: colors.secondary,
      textStyle: {
        color: colors['neutral-08'],
      },
      formatter: params => {
        const kpiOption = KPI_OPTIONS.find(({ value }) => value === kpi)
        if (!kpiOption || !Array.isArray(params)) return ''
        const [pastMarams, currentParams] = params
        const value = pastMarams?.value ?? currentParams?.value
        const index = pastMarams?.dataIndex ?? 0
        return `
        <span class="text-sm font-medium">${
          typeof value === 'number' ? kpiOption.formatter(value) : value
        } ${kpiOption.tooltip}</span>
        <br/>
        <span class="text-xs">${dates[index] ?? ''}</span>
      `
      },
    },
  })

  return (
    <div
      className="w-full bg-neutral-04 overflow-hidden h-full rounded-b-xl"
      ref={ref}
    />
  )
}
