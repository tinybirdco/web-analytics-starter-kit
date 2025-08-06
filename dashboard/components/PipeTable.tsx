import { cn, formatNumber } from '@/lib/utils'
import { CSSProperties } from 'react'
import { Text } from './ui/Text'
import { Skeleton } from './ui/Skeleton'

export type PipeTableColumn = {
  label: string
  key: string
  align?: 'left' | 'right' | 'center'
  maxWidth?: number
  isNumeric?: boolean
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
  maxHeight,
}: {
  data: Record<string, any>[]
  columns: PipeTableColumn[]
  title?: string
  style?: CSSProperties
  maxHeight?: number
}) {
  return (
    <div style={style} className="bg-white rounded-xl">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div 
        className={maxHeight ? "overflow-auto CustomScrollArea relative" : ""}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        <table className="w-full text-left">
          <thead className={cn("bg-white z-20", maxHeight ? "sticky top-0" : "")}>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="border-b border-[var(--border-01-color)] align-middle pb-1 bg-white"
                  style={{ 
                    textAlign: col.align || 'left',
                    maxWidth: col.maxWidth ? `${col.maxWidth}px` : undefined,
                    width: col.maxWidth ? `${col.maxWidth}px` : undefined
                  }}
                >
                  <Text variant="caption" color="01">
                    {col.label}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
        <tbody>
          {data.length === 0 && columns.length > 0
            ? // Show 3 skeleton rows if loading or no data
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {columns.map((col, j) => (
                    <td
                      key={col.key}
                      className="py-3 border-b border-[var(--border-01-color)] bg-white"
                      style={{
                        textAlign: col.align || 'left',
                        fontWeight: j === 0 ? '600' : '400',
                        maxWidth: col.maxWidth ? `${col.maxWidth}px` : (j === 0 ? '200px' : undefined),
                        width: col.maxWidth ? `${col.maxWidth}px` : (j === 0 ? '200px' : undefined),
                        overflow: (col.maxWidth || j === 0) ? 'hidden' : undefined,
                        textOverflow: (col.maxWidth || j === 0) ? 'ellipsis' : undefined,
                        whiteSpace: (col.maxWidth || j === 0) ? 'nowrap' : undefined
                      }}
                    >
                      <Skeleton height={16} width={j === 0 ? '60%' : '40%'} />
                    </td>
                  ))}
                </tr>
              ))
            : data.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {columns.map((col, j) => {
                    const value = row[col.key]
                    return (
                      <td
                        key={col.key}
                        className="py-2 border-b border-[var(--border-01-color)] bg-white"
                        style={{
                          textAlign: col.align || 'left',
                          fontWeight: j === 0 ? '600' : '400',
                          justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                          paddingLeft: col.align === 'left' || j === 0 ? '0px' : '16px',
                          paddingRight: col.align === 'right' || j === columns.length - 1 ? '0px' : '16px',
                          maxWidth: col.maxWidth ? `${col.maxWidth}px` : (j === 0 ? '200px' : undefined),
                          width: col.maxWidth ? `${col.maxWidth}px` : (j === 0 ? '200px' : undefined),
                          overflow: (col.maxWidth || j === 0) ? 'hidden' : undefined,
                          textOverflow: (col.maxWidth || j === 0) ? 'ellipsis' : undefined,
                          whiteSpace: (col.maxWidth || j === 0) ? 'nowrap' : undefined,
                          fontFamily: col.isNumeric ? 'var(--font-family-mono)' : undefined
                        }}
                      >
                        {col.render
                          ? col.render(row, value, i)
                          : typeof value === 'number'
                          ? formatNumber(value)
                          : value || value === 0
                          ? value
                          : '(none)'}
                      </td>
                    )
                  })}
                </tr>
              ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
