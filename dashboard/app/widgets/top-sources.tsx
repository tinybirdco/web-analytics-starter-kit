import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellText,
  TableCellMono,
  TableCellCombined,
  TableCellProgress,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'

export const TopSources = () => {
  const { data: topSources } =
    useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
      'top_sources'
    )

  return (
    <Card maxHeight={400} viewAll>
      <PipeTable
        title="Top sources"
        data={topSources || []}
        columns={[
          {
            label: 'Path',
            key: 'referrer',
            render: row => <TableCellText>{row.referrer}</TableCellText>,
          },
          {
            label: 'Visitors',
            key: 'visits',
            align: 'left',
            maxWidth: 64,
            render: row => {
              const maxVisits = Math.max(...(topSources || []).map(p => p.visits))
              return (
                <TableCellCombined>
                  <TableCellProgress value={row.visits} max={maxVisits} />
                  <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
                </TableCellCombined>
              )
            },
          },
          {
            label: 'Views',
            key: 'hits',
            align: 'right',
            maxWidth: 64,
            render: row => (
              <TableCellMono>{row.hits.toLocaleString()}</TableCellMono>
            ),
          },
        ]}
      />
    </Card>
  )
} 