import Widget from '../Widget'
import KPIsTabs from './KpisTabs'
import KPIsChart from './KpisChart'
import useKpis from '../../lib/hooks/use-kpis'
import useKpiTotals from '../../lib/hooks/use-kpi-totals'

export default function KPIsWidget() {
  const { data, kpi, setKpi, warning, status } = useKpis()
  const { data: kpiTotals, warning: warningTotals } = useKpiTotals()

  return (
    <Widget noPadding height={620}>
      <Widget.Title isVisuallyHidden>KPIs</Widget.Title>
      <KPIsTabs value={kpi} onChange={setKpi} totals={kpiTotals} />
      <Widget.Content status={status}>
        {data?.dates.length && !warning ? (
          <KPIsChart kpi={kpi} {...data} />
        ) : (
          <Widget.NoData />
        )}
        {(!!warning || !!warningTotals) && (
          <Widget.Warning>{warning?.message ?? warningTotals}</Widget.Warning>
        )}
      </Widget.Content>
    </Widget>
  )
}
