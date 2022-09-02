import useChart from '../../lib/hooks/use-chart'
import { TopDevice } from '../../lib/types/top-devices'

type TopDevicesChartProps = {
  data: TopDevice[]
}

export default function TopDevicesChart({ data }: TopDevicesChartProps) {
  const ref = useChart({
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
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
        data: data.map(({ device, opacity, visits }) => ({
          value: visits,
          name: device,
          itemStyle: {
            opacity,
          },
        })),
        radius: ['80%', '100%'],
      },
    ],
  })
  return <div className="w-full h-full" ref={ref} />
}
