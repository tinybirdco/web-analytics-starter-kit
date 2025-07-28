import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellMono,
  TableCellDevice,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'

export const TopDevices = () => {
  const { data: topDevices } =
    useEndpoint<{ device: string; visits: number; hits: number }[]>(
      'top_devices'
    )

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
            align: 'right',
            maxWidth: 64,
            render: row => (
              <TableCellMono>
                {row.visits?.toLocaleString?.()}
              </TableCellMono>
            ),
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