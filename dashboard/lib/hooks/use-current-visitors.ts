import useSWR from 'swr'
import { querySQL, queryPipe, getConfig } from '../api'

async function getCurrentVisitors(): Promise<number> {
  const { token } = getConfig();
  let data;
  if (token && token.startsWith('p.ey')) {
    ({ data } = await querySQL<{ visits: number }>(
      `SELECT uniq(session_id) AS visits FROM analytics_hits
        WHERE timestamp >= (now() - interval 5 minute) FORMAT JSON`
    ));
  } else {
    ({ data } = await queryPipe<{ visits: number }>('current_visitors'));
  }
  const [{ visits }] = data
  return visits
}

export default function useCurrentVisitors() {
  const { data } = useSWR('currentVisitors', getCurrentVisitors)
  return data ?? 0
}
