import { SqlChart } from '@/components/ui/SqlChart'
import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { useTimeRange } from '@/lib/hooks/use-time-range'
import { Card } from '@/components/ui/Card'

// Helper function to determine date format based on time range
const getAxisDateFormat = (timeRange: string): string => {
  // For today or yesterday, show time format (9:15pm)
  if (timeRange === 'today' || timeRange === 'yesterday') {
    return 'p'
  }
  // For all other ranges, show date format (Jun 3)
  return 'MMM d'
}

export const Visitors = () => {
  const { value: timeRange } = useTimeRange()
  const { data, error, isLoading } = useEndpoint<
    { visits: number; pageviews: number }[]
  >('kpis', { include_previous_period: true })

  return (
    <Card>
      <SqlChart
        title={'Visitors'}
        data={data || []}
        error={error?.message}
        isLoading={isLoading}
        summaryValue={'visits'}
        deltaValueKey={'visits_growth_percentage'}
        xAxisKey="date"
        yAxisKey="visits"
        axisDateFormat={getAxisDateFormat(timeRange)}
      />
    </Card>
  )
}
