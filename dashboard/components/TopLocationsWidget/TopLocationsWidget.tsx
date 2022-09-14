import Widget from '../Widget'
import TopLocationsChart from './TopLocationsChart'
import useTopLocations from '../../lib/hooks/use-top-locations'

export default function TopLocationsWidget() {
  const { data, status, warning } = useTopLocations()
  return (
    <Widget status={status}>
      <Widget.Title className="mb-6">Top Locations</Widget.Title>
      <Widget.Content>
        {data?.locations.length && !warning ? (
          <TopLocationsChart {...data} />
        ) : (
          <Widget.NoData />
        )}
        {!!warning && <Widget.Warning>{warning.message}</Widget.Warning>}
      </Widget.Content>
    </Widget>
  )
}
