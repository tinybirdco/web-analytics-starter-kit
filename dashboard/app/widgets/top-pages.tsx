import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellText,
  TableCellMono,
  TableCellCombined,
  TableCellProgress,
  TableCellDelta,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'
import { maxCellWidth } from '@/lib/utils'

type TopPagesData = {
  pathname: string
  visits: number
  hits: number
  previous_visits?: number
  previous_hits?: number
  visits_growth_percentage?: number
  hits_growth_percentage?: number
}

export const TopPages = () => {
  const { data: topPages } = useEndpoint<TopPagesData[]>('top_pages', {
    include_previous_period: true,
  })

  const maxVisitsWidth = maxCellWidth('visits', topPages || [])
  const maxHitsWidth = maxCellWidth('hits', topPages || [])

  return (
    <Card maxHeight={400} viewAll>
      <PipeTable
        title="Top pages"
        data={topPages || []}
        columns={[
          {
            label: 'Path',
            key: 'pathname',
            render: row => <TableCellText>{row.pathname}</TableCellText>,
          },
          {
            label: 'Visitors',
            key: 'visits',
            align: 'left',
            maxWidth: 128,
            render: row => {
              const maxVisits = Math.max(...(topPages || []).map(p => p.visits))
              return (
                <TableCellCombined>
                  <TableCellProgress value={row.visits} max={maxVisits} />
                  <TableCellMono width={maxVisitsWidth}>{row.visits.toLocaleString()}</TableCellMono>
                  {row.visits_growth_percentage !== undefined && (
                    <TableCellDelta
                      delta={Math.round(row.visits_growth_percentage)}
                    />
                  )}
                </TableCellCombined>
              )
            },
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
