import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellMono,
  TableCellBrowser,
  TableCellCombined,
  TableCellDelta,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'
import { maxCellWidth } from '@/lib/utils'

type TopBrowsersData = {
  browser: string
  visits: number
  hits: number
  previous_visits?: number
  previous_hits?: number
  visits_growth_percentage?: number
  hits_growth_percentage?: number
}

export const TopBrowsers = () => {
  const { data: topBrowsers } =
    useEndpoint<TopBrowsersData[]>('top_browsers', {
      include_previous_period: true,
    })

  const maxVisitsWidth = maxCellWidth('visits', topBrowsers || [])
  const maxHitsWidth = maxCellWidth('hits', topBrowsers || [])

  return (
    <Card maxHeight={400} viewAll>
      <PipeTable
        title="Top browsers"
        data={topBrowsers || []}
        columns={[
          {
            label: 'Browser',
            key: 'browser',
            render: row => <TableCellBrowser code={row.browser} />,
          },
          {
            label: 'Visitors',
            key: 'visits',
            align: 'left',
            maxWidth: 128,
            render: row => (
              <TableCellCombined>
                <TableCellMono width={maxVisitsWidth}>{row.visits.toLocaleString()}</TableCellMono>
                {row.visits_growth_percentage !== undefined && (
                  <TableCellDelta
                    delta={Math.round(row.visits_growth_percentage)}
                  />
                )}
              </TableCellCombined>
            ),
          },
          {
            label: 'Views',
            key: 'hits',
            align: 'left',
            maxWidth: 80,
            render: row => (
              <TableCellCombined>
                <TableCellMono width={maxHitsWidth}>{row.hits.toLocaleString()}</TableCellMono>
                {row.hits_growth_percentage !== undefined && (
                  <TableCellDelta
                    delta={Math.round(row.hits_growth_percentage)}
                  />
                )}
              </TableCellCombined>
            ),
          },
        ]}
      />
    </Card>
  )
} 