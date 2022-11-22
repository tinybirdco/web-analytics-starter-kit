import { BarChart } from '@tremor/react'
import Widget from '../Widget'
import useTrend from '../../lib/hooks/use-trend'
import { useMemo } from 'react'
import moment from 'moment'

export default function TrendWidget() {
  const { data, status, warning } = useTrend()
  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        Date: moment(d.t).format('HH:mm'),
        'Number of visits': d.visits,
      })),
    [data]
  )

  return (
    <Widget
      status={status}
      loaderSize={40}
      warning={warning?.message}
      noData={!chartData.length}
    >
      <div className="flex items-center justify-between">
        <Widget.Title>Users in last 30 minutes</Widget.Title>
        <h3 className="text-neutral-64 font-normal text-xl">
          {data?.totalVisits ?? 0}
        </h3>
      </div>
      <Widget.Content>
        <BarChart
          data={chartData}
          dataKey="Date"
          categories={['Number of visits']}
          colors={['blue']}
          height="h-32"
          showXAxis={false}
          showYAxis={false}
        />
      </Widget.Content>
    </Widget>
  )
}
