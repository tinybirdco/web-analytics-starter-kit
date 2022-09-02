import Widget from '../Widget'
import TrendChart from './TrendChart'
import useTrend from '../../lib/hooks/use-trend'

export default function TrendWidget() {
  const { data, status, warning } = useTrend()

  return (
    <Widget className="pb-0" height={151}>
      <Widget.Title className="mb-0">Users in last 30 minutes</Widget.Title>
      <Widget.Content status={status} loaderSize={40}>
        <h3 className="text-neutral-64 font-normal text-2xl leading-5 mt-4 mb-2">
          {data?.totalVisits ?? 0}
        </h3>
        {data?.visits.length && !warning ? (
          <TrendChart {...data} />
        ) : (
          <Widget.NoData />
        )}
        {!!warning && <Widget.Warning>{warning.message}</Widget.Warning>}
      </Widget.Content>
    </Widget>
  )
}
