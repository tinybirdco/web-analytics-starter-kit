import { BarList, Flex, SelectBox, SelectBoxItem } from '@tremor/react'
import Widget from '../Widget'
import useTopSources from '../../lib/hooks/use-top-sources'
import { OptionType } from '../../lib/types/options'
import { UTMFilter } from '../../lib/types/top-sources'
import { formatNumber } from '../../lib/utils'
import { useMemo } from 'react'

const utmFilterOptions: OptionType<UTMFilter>[] = [
  { text: 'All', value: UTMFilter.All },
  { text: 'UTM Medium', value: UTMFilter.Medium },
  { text: 'UTM Source', value: UTMFilter.Source },
  { text: 'UTM Campaign', value: UTMFilter.Campaign },
  { text: 'UTM Content', value: UTMFilter.Content },
  { text: 'UTM Term', value: UTMFilter.Term },
]

export default function TopSourcesWidget() {
  const { utmFilter, setUtmFilter, data, status, warning } = useTopSources()

  const chartData = useMemo(
    () =>
      (data?.data ?? []).map(d => ({
        name: (d.referrer || d.utm_filter) as string,
        value: d.visits,
        href: d.href,
      })),
    [data?.data]
  )

  return (
    <Widget>
      <Flex justifyContent="justify-between">
        <Widget.Title>Top Sources</Widget.Title>
        <SelectBox
          maxWidth="max-w-fit"
          value={utmFilter}
          onValueChange={setUtmFilter}
        >
          {utmFilterOptions.map(({ value, text }) => (
            <SelectBoxItem key={value} value={value} text={text} />
          ))}
        </SelectBox>
      </Flex>
      <Widget.Content
        status={status}
        noData={!chartData?.length}
        warning={warning?.message}
      >
        <div className="grid grid-cols-5 gap-x-4 gap-y-2">
          <div className="col-span-4 text-xs font-semibold tracking-widest text-gray-500 uppercase h-5">
            Refs
          </div>
          <div className="col-span-1 font-semibold text-xs text-right tracking-widest uppercase h-5">
            Visitors
          </div>

          <div className="col-span-4">
            <BarList data={chartData} valueFormatter={_ => ''} />
          </div>
          <div className="flex flex-col col-span-1 row-span-4 gap-2">
            {(data?.data ?? []).map(({ referrer, visits }) => (
              <div
                key={referrer}
                className="flex items-center justify-end w-full text-neutral-64 h-9"
              >
                {formatNumber(visits ?? 0)}
              </div>
            ))}
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
