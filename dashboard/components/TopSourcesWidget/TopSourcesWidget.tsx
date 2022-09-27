import Widget from '../Widget'
import TopSourcesChart from './TopSourcesChart'
import useTopSources from '../../lib/hooks/use-top-sources'

export default function TopSourcesWidget() {
  const { data, status, warning } = useTopSources()

  return (
    <Widget status={status}>
      <Widget.Title className="mb-6">Top Sources</Widget.Title>
      <Widget.Content className="flex flex-col">
        {data?.refs.length && !warning ? (
          <TopSourcesChart {...data} />
        ) : (
          <Widget.NoData />
        )}
        {!!warning && <Widget.Warning>{warning.message}</Widget.Warning>}
      </Widget.Content>
    </Widget>
  )
}
