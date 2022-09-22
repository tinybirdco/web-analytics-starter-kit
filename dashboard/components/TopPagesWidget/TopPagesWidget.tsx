import Widget from '../Widget'
import TopPagesChart from './TopPagesChart'
import useTopPages from '../../lib/hooks/use-top-pages'

export default function TopPagesWidget() {
  const { data, status, warning } = useTopPages()

  return (
    <Widget status={status}>
      <Widget.Title className="mb-6">Top Pages</Widget.Title>
      <Widget.Content className="flex flex-col">
        {data?.pages.length && !warning ? (
          <TopPagesChart {...data} />
        ) : (
          <Widget.NoData />
        )}
        {!!warning && <Widget.Warning>{warning.message}</Widget.Warning>}
      </Widget.Content>
    </Widget>
  )
}
