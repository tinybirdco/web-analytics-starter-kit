import Widget from '../Widget'
import TopLocationsChart from './TopLocationsChart'
import useTopLocations from '../../lib/hooks/use-top-locations'

export default function TopLocationsWidget() {
  const { data, status, warning } = useTopLocations()
  return (
    <Widget height={472}>
      <Widget.Title className="mb-6">Top Locations</Widget.Title>
      <Widget.Content status={status}>
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
