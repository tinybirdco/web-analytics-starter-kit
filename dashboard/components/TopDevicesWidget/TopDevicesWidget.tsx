import { Fragment } from 'react'
import Widget from '../Widget'
import TopDevicesChart from './TopDevicesChart'
import useTopDevices from '../../lib/hooks/use-top-devices'
import { formatNumber } from '../../lib/utils'

export default function TopDevicesWidget() {
  const { data, warning, status } = useTopDevices()

  return (
    <Widget height={312}>
      <Widget.Title className="mb-7">Top Devices</Widget.Title>
      <Widget.Content status={status}>
        {data?.length && !warning ? (
          <div
            className="w-full h-full grid"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            <TopDevicesChart data={data} />
            <div className="justify-self-end">
              <div
                className="grid gap-y-1 gap-4"
                style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
              >
                <div className="text-xs tracking-widest font-medium uppercase text-center truncate">
                  Device
                </div>
                <div className="text-xs tracking-widest font-medium uppercase text-right truncate">
                  Visitors
                </div>
                {data.map(({ device, visits, opacity }) => (
                  <Fragment key={device}>
                    <div className="flex items-center gap-2 text-sm leading-5 text-neutral-64 h-9 px-4 py-2 rounded-md z-10">
                      <div className="bg-primary h-4 w-4" style={{ opacity }} />
                      <span>{device}</span>
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
