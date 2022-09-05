import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import resolveConfig from 'tailwindcss/resolveConfig'

import tailwindConfig from '../../tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig) as any
const colors = fullConfig?.theme?.colors ?? {}

export default function useChart(option: echarts.EChartsOption) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chart.setOption({
      color: colors.primary,
      textStyle: {
        fontSize: 11,
        fontWeight: 400,
        color: colors.secondary,
        fontFamily: 'Inter var',
      },
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
      animationDuration: 300,
      animationDurationUpdate: 300,
      ...option,
    })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
