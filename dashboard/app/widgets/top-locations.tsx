import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellMono,
  TableCellCountry,
  TableCellCombined,
  TableCellProgress,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'

export const TopLocations = () => {
  const { data: topLocations } =
    useEndpoint<{ location: string; visits: number; hits: number }[]>(
      'top_locations'
    )

  return (
    <Card maxHeight={400} viewAll>
      <PipeTable
        title="Top locations"
        data={topLocations || []}
        columns={[
          {
            label: 'Location',
            key: 'location',
            render: row => <TableCellCountry code={row.location} />,
          },
          {
            label: 'Visitors',
            key: 'visits',
            align: 'left',
            maxWidth: 64,
            render: row => {
              const maxVisits = Math.max(...(topLocations || []).map(p => p.visits))
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