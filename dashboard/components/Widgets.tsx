import dynamic from 'next/dynamic'
import InView from './InView'
import Widget from './Widget'

const enum WidgetHeight {
  XLarge = 620,
  Large = 472,
  Medium = 312,
  Small = 152,
}

function WidgetLoading({ size }: { size?: number }) {
  return (
    <Widget>
      <Widget.Content>
        <Widget.Loading loaderSize={size} />
      </Widget.Content>
    </Widget>
  )
}
const KPIsWidget = dynamic(() => import('./KpisWidget'), {
  loading: () => <WidgetLoading />,
})
const BrowsersWidget = dynamic(() => import('./BrowsersWidget'), {
  loading: () => <WidgetLoading />,
})
const TopPagesWidget = dynamic(() => import('./TopPagesWidget'), {
  loading: () => <WidgetLoading />,
})
const TrendWidget = dynamic(() => import('./TrendWidget'), {
  loading: () => <WidgetLoading size={40} />,
})
const TopDevicesWidget = dynamic(() => import('./TopDevicesWidget'), {
  loading: () => <WidgetLoading />,
})
const TopSourcesWidget = dynamic(() => import('./TopSourcesWidget'), {
  loading: () => <WidgetLoading />,
})
const TopLocationsWidget = dynamic(() => import('./TopLocationsWidget'), {
  loading: () => <WidgetLoading />,
})

export default function Widgets() {
  return (
    <div className="grid grid-cols-2 gap-5 sm:gap-10 grid-rows-3-auto">
      <div className="col-span-2" style={{ height: WidgetHeight.XLarge }}>
        <KPIsWidget />
      </div>
      <div className="col-start-1 col-span-2 lg:col-span-1 grid grid-cols-1 gap-5 sm:gap-10 grid-rows-3-auto">
        <InView height={WidgetHeight.Small}>
          <TrendWidget />
        </InView>
        <InView height={WidgetHeight.Large}>
          <TopPagesWidget />
        </InView>
        <InView height={WidgetHeight.Large}>
          <TopLocationsWidget />
        </InView>
      </div>
      <div className="col-start-1 col-span-2 lg:col-start-2 lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 sm:gap-10 grid-rows-2-auto lg:grid-rows-3-auto">
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <InView height={WidgetHeight.Large}>
            <TopSourcesWidget />
          </InView>
        </div>
        <InView height={WidgetHeight.Medium}>
          <TopDevicesWidget />
        </InView>
        <InView height={WidgetHeight.Medium}>
          <BrowsersWidget />
        </InView>
      </div>
    </div>
  )
}
