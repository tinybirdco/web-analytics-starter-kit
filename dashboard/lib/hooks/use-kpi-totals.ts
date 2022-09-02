import { querySQL } from '../api'
import { KpiTotals, KpiType } from '../types/kpis'
import useDateFilter from './use-date-filter'
import useQuery from './use-query'
import { QueryError } from '../types/api'

async function getKpiTotals(
  date_from?: string,
  date_to?: string
): Promise<KpiTotals> {
  const { data } = await querySQL<Record<KpiType, number>>(
    `SELECT 
      sum(visits) as visits, 
      sum(pageviews) as pageviews, 
      avg(avg_session_sec) as avg_session_sec, 
      avg(bounce_rate) as bounce_rate
      FROM kpis 
      WHERE date between 
      ${
        date_from ? `'${date_from}'` : 'timestampAdd(today(), interval -7 day)'
      } 
      AND
      ${date_to ? `'${date_to}'` : 'today()'}
    FORMAT JSON`
  )

  const { data: previousData } = await querySQL<Record<KpiType, number>>(
    `SELECT 
      sum(visits) as visits, 
      sum(pageviews) as pageviews, 
      avg(avg_session_sec) as avg_session_sec, 
      avg(bounce_rate) as bounce_rate
      FROM kpis 
      WHERE date between ${`timestampAdd(toDate('${date_from}'), interval -${
        date_from ? '7' : '14'
      } day)`} AND ${`toDate('${date_to}')`} 
      FORMAT JSON`
  )

  const { bounce_rate, avg_session_sec, pageviews, visits } = data[0]

  return {
    avg_session_sec: avg_session_sec,
    pageviews: pageviews,
    visits: visits,
    bounce_rate: bounce_rate,
  }
}

function getNotFoundColumnsWarning(warning: QueryError | null): string | null {
  if (!warning) return null
  try {
    // parsing the error message to get the columns that are not found
    const rawColumns = warning.message
      .split('required columns:')[1]
      .trim()
      .split("'")
      .map(part => part.trim())
      .filter(Boolean)
      .join()
      .split(',')
      .slice(0, -1)
    const columns = Array.from(new Set(rawColumns))
    const formatter = new Intl.ListFormat('en', {
      style: 'long',
      type: 'conjunction',
    })
    return `${formatter.format(columns)} column${
      columns.length ? 's' : ''
    } at the analytics_events data source cannot be found`
  } catch (error) {
    return null
  }
}

export default function useKpiTotals() {
  const { startDate, endDate } = useDateFilter()
  const { warning, ...query } = useQuery(
    [startDate, endDate, 'kpiTotals'],
    getKpiTotals
  )
  return { ...query, warning: getNotFoundColumnsWarning(warning) }
}
