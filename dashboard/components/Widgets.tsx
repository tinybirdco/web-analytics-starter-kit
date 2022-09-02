import { useId } from 'react'
import KPIsWidget from './KpisWidget'
import TopPagesWidget from './TopPagesWidget'
import TrendWidget from './TrendWidget'
import TopDevicesWidget from './TopDevicesWidget'
import TopSourcesWidget from './TopSourcesWidget'
import TopLocationsWidget from './TopLocationsWidget'
import BrowsersWidget from './BrowsersWidget'

const widgets = [
  TrendWidget,
  TopPagesWidget,
  TopLocationsWidget,
  TopSourcesWidget,
  TopDevicesWidget,
  BrowsersWidget,
]

export default function Widgets() {
  const id = useId()
  return (
    <div className="grid grid-cols-2 gap-5 sm:gap-10 grid-rows-3-auto">
      <div className="col-span-2">
        <KPIsWidget />
      </div>
      <div className="col-start-1 col-span-2 lg:col-span-1 grid grid-cols-1 gap-5 sm:gap-10 grid-rows-3-auto">
        <TrendWidget />
        <TopPagesWidget />
        <TopLocationsWidget />
      </div>
      <div className="col-start-1 col-span-2 lg:col-start-2 lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 sm:gap-10 grid-rows-2-auto lg:grid-rows-3-auto">
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <TopSourcesWidget />
        </div>
        <TopDevicesWidget />
        <BrowsersWidget />
      </div>
    </div>
  )
}
