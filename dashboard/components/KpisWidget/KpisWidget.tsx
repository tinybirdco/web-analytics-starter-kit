import Widget from '../Widget'
import KPIsTabs from './KpisTabs'
import KPIsChart from './KpisChart'
import useKpis from '../../lib/hooks/use-kpis'
import useKpiTotals from '../../lib/hooks/use-kpi-totals'

export default function KPIsWidget() {
  const { data, kpi, setKpi, warning, status } = useKpis()
  const { data: kpiTotals, warning: warningTotals } = useKpiTotals()

  return (
    <Widget noPadding>
      <Widget.Title isVisuallyHidden>KPIs</Widget.Title>
      <KPIsTabs value={kpi} onChange={setKpi} totals={kpiTotals} />
      <Widget.Content style={{ height: 494, position: 'relative' }}>
        {data?.dates.length && !warning ? (
          <KPIsChart kpi={kpi} {...data} />
        ) : status === 'success' ? (
          <Widget.NoData />
        ) : (
          <Widget.Loading />
        )}
        {(!!warning || !!warningTotals) && (
          <Widget.Warning>{warning?.message ?? warningTotals}</Widget.Warning>
        )}
      </Widget.Content>
    </Widget>
  )
}
