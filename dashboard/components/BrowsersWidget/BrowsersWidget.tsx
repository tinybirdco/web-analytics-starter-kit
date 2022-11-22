import { Fragment } from 'react'
import Widget from '../Widget'
import BrowsersChart from './BrowsersChart'
import useBrowsers from '../../lib/hooks/use-top-browsers'
import { formatNumber } from '../../lib/utils'

export default function BrowsersWidget() {
  const { data, status, warning } = useBrowsers()

  return (
    <Widget status={status} noData={!data?.length} warning={warning?.message}>
      <Widget.Title>Top Browsers</Widget.Title>
      <Widget.Content>
        <div className="w-full h-full grid grid-cols-2 items-center">
          <BrowsersChart data={data ?? []} />
          <div className="justify-self-end">
            <div className="grid gap-y-1 gap-4 grid-cols-2">
              <div className="text-xs tracking-widest font-medium uppercase text-center truncate">
                Browser
              </div>
              <div className="text-xs tracking-widest font-medium uppercase text-right truncate">
                Visitors
              </div>
              {(data ?? []).map(({ browser, visits, opacity }) => (
                <Fragment key={browser}>
                  <div className="flex items-center gap-2 text-sm leading-5 text-neutral-64 h-9 px-4 py-2 rounded-md z-10">
                    <div
                      className="bg-primary h-4 min-w-[1rem]"
                      style={{ opacity }}
                    />
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
      </Widget.Content>
    </Widget>
  )
}
