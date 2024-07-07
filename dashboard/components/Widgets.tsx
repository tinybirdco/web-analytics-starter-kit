import InView from './InView'
import {
  AreaChart,
  BarChart,
  BarList,
  ChartProvider,
  DonutChart,
  PieChart,
} from '@tinybirdco/charts'
import { fetcher, getConfig } from '../lib/api'
import { useRouter } from 'next/router'
import useDateFilter from '../lib/hooks/use-date-filter'
import Loader from './Loader'
import KpisTabs from './KpisWidget/KpisTabs'
import useKpis from '../lib/hooks/use-kpis'
import useKpiTotals from '../lib/hooks/use-kpi-totals'

const enum WidgetHeight {
  XLarge = 588,
  Large = 472,
  Medium = 344,
  Small = 216,
}

export default function Widgets() {
  const { query } = useRouter()
  const { host, token } = getConfig(
    typeof query === 'string' ? query : undefined
  )
  function buildEndointUrl(host: string, endpoint: string) {
    const apiUrl =
      {
        'https://ui.tinybird.co': 'https://api.tinybird.co',
        'https://ui.us-east.tinybird.co': 'https://api.us-east.tinybird.co',
      }[host] ?? host

    return `${apiUrl}/v0/pipes/${endpoint}.json`
  }
  const topSourcesEndpoint = buildEndointUrl(host, 'top_sources')
  const topPagesEndpoint = buildEndointUrl(host, 'top_pages')
  const topDevicesEndpoint = buildEndointUrl(host, 'top_devices')
  const topBrowsersEndpoint = buildEndointUrl(host, 'top_browsers')
  const topLocationsEndpoint = buildEndointUrl(host, 'top_locations')
  const trendEndpoint = buildEndointUrl(host, 'trend')
  const kpisEndpoint = buildEndointUrl(host, 'kpis')
  const { startDate, endDate } = useDateFilter()
  const { kpi, setKpi } = useKpis()
  const { data: kpiTotals } = useKpiTotals()

  return (
    <ChartProvider
      queryConfig={{
        token,
        fetcher,
      }}
      styles={{
        borderRadius: 8,
        boxShadow:
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        padding: 24,
      }}
      fallbacks={{
        loading: <Loader />,
      }}
    >
      <div className="grid grid-cols-2 gap-5 sm:gap-10 grid-rows-3-auto">
        <div
          className="col-span-2 relative"
          style={{ height: WidgetHeight.XLarge }}
        >
          <div className="absolute top-0 left-0 right-0 z-10">
            <KpisTabs value={kpi} onChange={setKpi} totals={kpiTotals} />
          </div>
          <AreaChart
            endpoint={kpisEndpoint}
            index="date"
            categories={[kpi]}
            colorPalette={['#2675f4']}
            boxShadow="none"
            params={{
              start_date: startDate,
              end_date: endDate,
            }}
            height={WidgetHeight.XLarge}
            options={{
              grid: {
                left: '2%',
                right: '2%',
                top: 140,
                bottom: 0,
                containLabel: true,
              },
              yAxis: {
                splitNumber: 4,
                type: 'value',
                splitLine: {},
                axisLabel: {
                  fontSize: 12,
                },
              },
            }}
          />
        </div>
        <div className="col-start-1 col-span-2 lg:col-span-1 grid grid-cols-1 gap-5 sm:gap-10 grid-rows-3-auto">
          <InView height={WidgetHeight.Small}>
            <BarChart
              endpoint={trendEndpoint}
              index="t"
              categories={['visits']}
              title="Users in last 30 minutes"
              colorPalette={['#2675f4']}
              height={WidgetHeight.Small}
              options={{
                yAxis: { show: false },
                xAxis: { show: false },
              }}
              params={{
                start_date: startDate,
                end_date: endDate,
              }}
            />
          </InView>
          <InView height={WidgetHeight.Large}>
            <BarList
              endpoint={topPagesEndpoint}
              index="pathname"
              categories={['hits', 'visits']}
              title="Top Pages"
              params={{
                limit: 8,
                start_date: startDate,
                end_date: endDate,
              }}
              colorPalette={['#d4e7fe']}
              height={WidgetHeight.Large}
            />
          </InView>
          <InView height={WidgetHeight.Large}>
            <BarList
              endpoint={topLocationsEndpoint}
              index="location"
              categories={['hits', 'visits']}
              title="Top Locations"
              params={{
                limit: 8,
                start_date: startDate,
                end_date: endDate,
              }}
              colorPalette={['#d4e7fe']}
              height={WidgetHeight.Large}
            />
          </InView>
        </div>
        <div className="col-start-1 col-span-2 lg:col-start-2 lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 sm:gap-10 grid-rows-2-auto lg:grid-rows-3-auto">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <InView height={WidgetHeight.Large}>
              <BarList
                endpoint={topSourcesEndpoint}
                index="referrer"
                categories={['hits', 'visits']}
                title="Top Sources"
                params={{
                  limit: 8,
                  start_date: startDate,
                  end_date: endDate,
                }}
                colorPalette={['#d4e7fe']}
                height={WidgetHeight.Large}
              />
            </InView>
          </div>
          <InView height={WidgetHeight.Medium}>
            <DonutChart
              endpoint={topDevicesEndpoint}
              index="device"
              categories={['hits', 'visits']}
              title="Top Devices"
              params={{
                limit: 8,
                start_date: startDate,
                end_date: endDate,
              }}
              colorPalette={['#2675f4', '#009be5', '#00aece', '#00aece']}
              height={WidgetHeight.Medium}
              showLegend
              options={{
                yAxis: { show: false },
              }}
            />
          </InView>
          <InView height={WidgetHeight.Medium}>
            <PieChart
              endpoint={topBrowsersEndpoint}
              index="browser"
              categories={['hits', 'visits']}
              title="Top Browsers"
              params={{
                limit: 8,
                start_date: startDate,
                end_date: endDate,
              }}
              colorPalette={['#2675f4', '#009be5', '#00aece', '#00aece']}
              height={WidgetHeight.Medium}
              showLegend
              options={{
                yAxis: { show: false },
              }}
            />
          </InView>
        </div>
      </div>
    </ChartProvider>
  )
}
