import { formatNumber } from '@/lib/utils'
import { CSSProperties } from 'react'
import { Text } from './ui/Text'

export type PipeTableColumn = {
  label: string
  key: string
  align?: 'left' | 'right' | 'center'
  render?: (
    row: Record<string, any>,
    value: any,
    rowIndex: number
  ) => React.ReactNode
}

export function PipeTable({
  data = [],
  columns,
  title,
  style,
}: {
  data: Record<string, any>[]
  columns: PipeTableColumn[]
  title?: string
  style?: CSSProperties
}) {
  return (
    <div style={style} className="bg-white rounded-xl">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <table className="w-full text-left">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="border-b border-[var(--border-01-color)] align-middle pb-1"
                style={{ textAlign: col.align || 'left' }}
              >
                <Text variant="caption" color="01">
                  {col.label}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              {columns.map((col, j) => {
                const value = row[col.key]
                return (
                  <td
                    key={col.key}
                    className="py-2 pr-4 border-b border-[var(--border-01-color)]"
                    style={{ textAlign: col.align || 'left', fontWeight: j === 0 ? '600' : '400' }}
                  >
                    {col.render
                      ? col.render(row, value, i)
                      : typeof value === 'number'
                      ? formatNumber(value)
                      : value || '(none)'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
