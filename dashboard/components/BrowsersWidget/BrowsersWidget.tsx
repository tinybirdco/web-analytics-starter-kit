import { Fragment } from 'react'
import Widget from '../Widget'
import BrowsersChart from './BrowsersChart'
import useBrowsers from '../../lib/hooks/use-top-browsers'
import { formatNumber } from '../../lib/utils'

export default function BrowsersWidget() {
  const { data, status, warning } = useBrowsers()

  return (
    <Widget height={312}>
      <Widget.Title className="mb-7">Top Browsers</Widget.Title>
      <Widget.Content status={status}>
        {data?.length && !warning ? (
          <div
            className="w-full h-full grid"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            <BrowsersChart data={data} />
            <div className="justify-self-end">
              <div
                className="grid gap-y-1 gap-4"
                style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
              >
                <div className="text-xs tracking-widest font-medium uppercase text-center truncate">
                  Browser
                </div>
                <div className="text-xs tracking-widest font-medium uppercase text-right truncate">
                  Visitors
                </div>
                {data.map(({ browser, visits, opacity }) => (
                  <Fragment key={browser}>
                    <div className="flex items-center gap-2 text-sm leading-5 text-neutral-64 h-9 px-4 py-2 rounded-md z-10">
                      <div className="bg-primary h-4 w-4" style={{ opacity }} />
                      <span>{browser}</span>
                    </div>
                    <div className="flex items-center justify-end text-neutral-64 h-9">
                      {formatNumber(visits)}
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Widget.NoData />
        )}
        {!!warning && <Widget.Warning>{warning.message}</Widget.Warning>}
      </Widget.Content>
    </Widget>
  )
}
