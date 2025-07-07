import { formatNumber } from '@/lib/utils'
import { CSSProperties } from 'react'

export type PipeTableColumn = {
  label: string
  key: string
  align?: 'left' | 'right' | 'center'
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
    <div style={style} className="bg-white rounded-xl border p-6">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="text-secondary text-xs font-semibold pb-2"
                style={{ textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              {columns.map(col => {
                const value = row[col.key]
                return (
                  <td
                    key={col.key}
                    className="py-1 pr-4"
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {typeof value === 'number'
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