import { useEndpoint } from '@/lib/hooks/use-endpoint'
import { PipeTable } from '@/components/PipeTable'
import {
  TableCellMono,
  TableCellBrowser,
} from '@/components/table/TableCells'
import { Card } from '@/components/ui/Card'

export const TopBrowsers = () => {
  const { data: topBrowsers } =
    useEndpoint<{ browser: string; visits: number; hits: number }[]>(
      'top_browsers'
    )

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
            align: 'right',
            maxWidth: 64,
            render: row => (
              <TableCellMono>{row.visits.toLocaleString()}</TableCellMono>
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