import { SqlChart } from '@/components/ui/SqlChart'
import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { Card } from '@/components/ui/Card'

export const TrafficByHour = () => {
  const { data, error, isLoading } = useEndpoint<
    { hour: number; visits: number; pageviews: number }[]
  >('traffic_by_hour')

  // Format hour labels (0 -> 12am, 13 -> 1pm, etc.)
  const formattedData = data?.map((item) => ({
    ...item,
    hourLabel: formatHour(item.hour),
  }))

  return (
    <Card>
      <SqlChart
        title={'Traffic by Hour'}
        data={formattedData || []}
        error={error?.message}
        isLoading={isLoading}
        summaryValue={'visits'}
        xAxisKey="hourLabel"
        yAxisKey="visits"
        type="bar"
      />
    </Card>
  )
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  if (hour < 12) return `${hour}am`
  return `${hour - 12}pm`
}
