import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellMono,
  TableCellDevice,
  TableCellCombined,
  TableCellDelta,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'
import { maxCellWidth } from '@/lib/utils'

type TopDevicesData = {
  device: string
  visits: number
  hits: number
  previous_visits?: number
  previous_hits?: number
  visits_growth_percentage?: number
  hits_growth_percentage?: number
}

export const TopDevices = () => {
  const { data: topDevices } =
    useEndpoint<TopDevicesData[]>('top_devices', {
      include_previous_period: true,
    })

  const maxVisitsWidth = maxCellWidth('visits', topDevices || [])
  const maxHitsWidth = maxCellWidth('hits', topDevices || [])

  return (
    <Card maxHeight={400} viewAll>
      <PipeTable
        title="Top devices"
        data={topDevices || []}
        columns={[
          {
            label: 'Device',
            key: 'device',
            render: row => <TableCellDevice code={row.device} />,
          },
          {
            label: 'Visitors',
            key: 'visits',
            align: 'left',
            maxWidth: 128,
            render: row => (
              <TableCellCombined>
                <TableCellMono width={maxVisitsWidth}>
                  {row.visits?.toLocaleString?.()}
                </TableCellMono>
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