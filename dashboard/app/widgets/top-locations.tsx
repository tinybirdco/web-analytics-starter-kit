import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellMono,
  TableCellCountry,
  TableCellCombined,
  TableCellProgress,
  TableCellDelta,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'
import { maxCellWidth } from '@/lib/utils'

type TopLocationsData = {
  location: string
  visits: number
  hits: number
  previous_visits?: number
  previous_hits?: number
  visits_growth_percentage?: number
  hits_growth_percentage?: number
}

export const TopLocations = () => {
  const { data: topLocations } =
    useEndpoint<TopLocationsData[]>('top_locations', {
      include_previous_period: true,
    })

  const maxVisitsWidth = maxCellWidth('visits', topLocations || [])
  const maxHitsWidth = maxCellWidth('hits', topLocations || [])

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
            maxWidth: 128,
            render: row => {
              const maxVisits = Math.max(...(topLocations || []).map(p => p.visits))
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