import useSWR from 'swr'
import { querySQL, queryPipe, getConfig } from '../api'
import { useSearchParams } from 'next/navigation'

async function getCurrentVisitors(domainParam?: string): Promise<number> {
  const { token } = getConfig();
  let data;
  const domainFilter = domainParam && domainParam !== 'ALL' ? { domain: domainParam } : {}
  if (token && token.startsWith('p.ey')) {
    let where = 'timestamp >= (now() - interval 5 minute)'
    if (domainParam && domainParam !== 'ALL') {
      where += ` AND domain = '${domainParam}'`
    }
    const sql = `SELECT uniq(session_id) AS visits FROM analytics_hits WHERE ${where} FORMAT JSON`
    data = (await querySQL<{ visits: number }[]>(sql)).data;
  } else {
    data = (await queryPipe<{ visits: number }[]>('current_visitors', domainFilter)).data;
  }
  const [row] = data || []
  return row?.visits ?? 0
}

export default function useCurrentVisitors() {
  const searchParams = useSearchParams()
  const domainParam = searchParams.get('domain') || undefined
  const { data } = useSWR(['current_visitors', domainParam], () => getCurrentVisitors(domainParam))
  return data ?? 0
}
