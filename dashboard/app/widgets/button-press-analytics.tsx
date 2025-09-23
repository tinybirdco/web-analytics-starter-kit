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

type ButtonPressAnalyticsData = {
  date: string
  film_page: string
  button_name: string
  press_count: number
  previous_press_count?: number
  press_count_growth_percentage?: number
}

export const ButtonPressAnalytics = () => {
  const { data: buttonPressData } = useEndpoint<ButtonPressAnalyticsData[]>('button_press_analytics', {
    include_previous_period: true,
  })

  const maxPressCountWidth = maxCellWidth('press_count', buttonPressData || [])

  return (
    <Card maxHeight={400} viewAll>
      <PipeTable
        title="Button Press Analytics"
        data={buttonPressData || []}
        columns={[
          {
            label: 'Date',
            key: 'date',
            render: row => <TableCellText>{row.date}</TableCellText>,
          },
          {
            label: 'Film Page',
            key: 'film_page',
            render: row => <TableCellText>{row.film_page}</TableCellText>,
          },
          {
            label: 'Button Name',
            key: 'button_name',
            render: row => <TableCellText>{row.button_name}</TableCellText>,
          },
          {
            label: 'Press Count',
            key: 'press_count',
            align: 'left',
            maxWidth: 128,
            render: row => {
              const maxPressCount = Math.max(...(buttonPressData || []).map(p => p.press_count))
              return (
                <TableCellCombined>
                  <TableCellProgress value={row.press_count} max={maxPressCount} />
                  <TableCellMono width={maxPressCountWidth}>{row.press_count.toLocaleString()}</TableCellMono>
                  {row.press_count_growth_percentage !== undefined && (
                    <TableCellDelta
                      delta={Math.round(row.press_count_growth_percentage)}
                    />
                  )}
                </TableCellCombined>
              )
            },
          },
        ]}
      />
    </Card>
  )
}
