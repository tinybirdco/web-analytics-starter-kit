'use client'

import { Node, QueryData } from '@/lib/types'
import { cn, formatBytes, formatMilliseconds, formatNumber } from '@/lib/utils'
import { format as formatDate } from 'date-fns'
import { SquareCodeIcon } from 'lucide-react'
import { CSSProperties, Fragment, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './Chart'
import { BarChartIcon, LineChartIcon } from './Icons'
import { Skeleton } from './Skeleton'
import styles from './SqlChart.module.css'
import { Stack } from './Stack'
import { Text, TextColor } from './Text'
import { Tooltip } from './Tooltip'

export function SqlChart({
  data,
  error,
  isLoading,
  xAxisKey,
  yAxisKey,
  color = yAxisKey === 'errors' ? '#DE1616' : '#2D27F7',
  title,
  summaryValue,
  summaryValueLong,
  summaryValueColor,
  unit = '',
  tooltipDateFormat = 'yyyy-MM-dd HH:mm',
  axisDateFormat = 'HH:mm',
  style,
  type = 'line',
  height = 240,
  allowDecimals = true,
  sqlOnExplore,
  limit,
}: {
  data: QueryData | undefined
  error: string | undefined
  isLoading: boolean
  xAxisKey: string
  yAxisKey: string | string[]
  color?: string | string[]
  title?: string
  summaryValue?: string | number
  summaryValueLong?: string | number
  summaryValueColor?: string
  unit?: string
  variant?: 'table' | 'widget'
  tooltipDateFormat?: string
  axisDateFormat?: string
  style?: CSSProperties
  type?: 'line' | 'bar'
  height?: number
  allowDecimals?: boolean
  sqlOnExplore?: { sql?: string; name?: string; nodes?: Partial<Node>[] }
  limit?: number | number[]
}) {
  const [isHovered, setIsHovered] = useState(false)
  const yAxisKeys = Array.isArray(yAxisKey) ? yAxisKey : [yAxisKey]
  const colors = Array.isArray(color)
    ? color
    : [color, yAxisKeys.includes('errors') ? '#DE1616' : '#2D27F7']

  const limits = Array.isArray(limit) ? limit : limit ? [limit] : []

  const baseStyle: CSSProperties = {
    backgroundColor: '#fff',
    height,
    ...style,
  }

  if (error)
    return (
      <Stack direction="column" align="center" style={baseStyle}>
        <Text
          as="p"
          variant="captioncode"
          color="error"
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all',
          }}
        >
          {error}
        </Text>
      </Stack>
    )

  if (isLoading)
    return (
      <Skeleton style={{ ...baseStyle, border: '1px solid transparent' }} />
    )

  const limitColors = ['#DE1616', '#FF631A']

  const handleClick = (index: number) => {
    if (sqlOnExplore) {
      /** DROP THIS */
    }
  }

  // Compute summary value if it's a string (key)
  let computedSummaryValue: string | number | undefined = summaryValue
  if (typeof summaryValue === 'string' && data && Array.isArray(data)) {
    computedSummaryValue = data.reduce((acc, row) => {
      const v = row[summaryValue]
      if (typeof v === 'number') return acc + v
      if (typeof v === 'string' && !isNaN(Number(v))) return acc + Number(v)
      return acc
    }, 0)
  }

  return (
    <Stack
      direction="column"
      gap={32}
      style={baseStyle}
      className={cn(styles.sqlChartCard, sqlOnExplore && styles.clickable)}
      onMouseEnter={sqlOnExplore ? () => setIsHovered(true) : undefined}
      onMouseLeave={sqlOnExplore ? () => setIsHovered(false) : undefined}
    >
      {(title || computedSummaryValue !== undefined) && (
        <Stack direction="column" gap={4} width="100%">
          <Stack width="100%" justify="space-between" gap={16}>
            {title && (
              <Tooltip
                content={sqlOnExplore ? 'Open in Explorations' : undefined}
                side="top"
              >
                <Text
                  as={sqlOnExplore ? 'button' : 'span'}
                  variant="displayxsmall"
                  style={{
                    textDecoration: isHovered ? 'underline' : 'none',
                    cursor: sqlOnExplore ? 'pointer' : 'default',
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                  }}
                  onClick={() => handleClick(0)}
                >
                  {isHovered ? (
                    <SquareCodeIcon size={16} />
                  ) : type === 'line' ? (
                    <LineChartIcon color={colors[0]} />
                  ) : (
                    <BarChartIcon color={colors[0]} />
                  )}
                  {title}
                </Text>
              </Tooltip>
            )}
            {computedSummaryValue !== undefined && (
              <Tooltip content={summaryValueLong} side="top">
                <Text
                  variant="displayxsmall"
                  color={summaryValueColor as TextColor}
                  style={{ marginInlineStart: 'auto' }}
                >
                  {(() => {
                    if (computedSummaryValue === '--') return '--'
                    if (unit === '%') {
                      return `${formatNumber(Number(computedSummaryValue), '0.[00]a')}%`
                    }
                    if (unit === 'ms') {
                      return formatMilliseconds(Number(computedSummaryValue))
                    }
                    if (unit === 'bytes') {
                      return formatBytes(Number(computedSummaryValue))
                    }
                    if (
                      typeof computedSummaryValue === 'number' &&
                      computedSummaryValue > 0 &&
                      computedSummaryValue < 0.001
                    ) {
                      return formatNumber(computedSummaryValue, '.[00000]')
                    }
                    return `${formatNumber(Number(computedSummaryValue), '0.[000]a')}${unit || ''}`
                  })()}
                </Text>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      )}
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          font: 'var(--font-caption-code)',
        }}
      >
        <ChartContainer config={{}} style={{ height: '100%', width: '100%' }}>
          {type === 'line' ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: -8, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                horizontal={true}
                strokeDasharray={4}
                stroke="#E8E9ED"
              />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={true}
                stroke="#636679"
                strokeOpacity={0.5}
                tickMargin={8}
                minTickGap={16}
                tickFormatter={value => {
                  try {
                    return formatDate(value, axisDateFormat)
                  } catch {
                    return value
                  }
                }}
              />
              <YAxis
                type="number"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={true}
                tickFormatter={value => yAxisFormatter(value, unit)}
                mirror={true}
                minTickGap={0}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={value => formatter(Number(value), unit)}
                labelFormatter={value => {
                  try {
                    return `${formatDate(value, tooltipDateFormat)} (UTC)`
                  } catch {
                    return value
                  }
                }}
              />
              {limits.length > 0 &&
                limits.map((limit, index) => {
                  const startX = (data?.[0]?.[xAxisKey] as number) ?? 0
                  const endX =
                    (data?.[Math.floor(data?.length * 0.9) - 1]?.[
                      xAxisKey
                    ] as number) ?? 0

                  return (
                    <Fragment key={index}>
                      {/* This line is hidden, but it's used to always print the limit
                          https://github.com/recharts/recharts/issues/3379 */}
                      <ReferenceLine
                        y={limit}
                        strokeOpacity={0}
                        ifOverflow="extendDomain"
                      />
                      <ReferenceLine
                        stroke={limitColors[index]}
                        strokeWidth={1}
                        strokeOpacity={1}
                        strokeDasharray="3 3"
                        segment={[
                          { x: startX, y: limit },
                          { x: endX, y: limit },
                        ]}
                      />
                    </Fragment>
                  )
                })}
              {yAxisKeys.map((key, index) => (
                <Area
                  key={key}
                  dataKey={key}
                  type="linear"
                  fill={colors[index]}
                  stroke={colors[index]}
                  fillOpacity={0.1}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: -8, left: 8, bottom: 0 }}
              barGap={0}
            >
              <CartesianGrid
                vertical={false}
                horizontal={true}
                strokeDasharray={4}
                stroke="#E8E9ED"
              />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={true}
                stroke="#636679"
                strokeOpacity={0.5}
                tickMargin={8}
                minTickGap={16}
                tickFormatter={value => {
                  try {
                    return formatDate(value, axisDateFormat)
                  } catch {
                    return value
                  }
                }}
              />
              <YAxis
                type="number"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={true}
                tickFormatter={value => yAxisFormatter(value, unit)}
                mirror={true}
                minTickGap={0}
                allowDecimals={allowDecimals}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={value => formatter(Number(value), unit)}
                labelFormatter={value => {
                  try {
                    return `${formatDate(value, tooltipDateFormat)} (UTC)`
                  } catch {
                    return value
                  }
                }}
              />
              {yAxisKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index]}
                  opacity={0.1}
                  activeBar={
                    <SqlChartRectangle
                      stroke={colors[index]}
                      fill={colors[index]}
                    />
                  }
                  shape={
                    <SqlChartRectangle
                      stroke={colors[index]}
                      fill={colors[index]}
                      opacity={0.1}
                    />
                  }
                />
              ))}
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </Stack>
  )
}

function formatter(value: number, unit: string) {
  if (unit === '%') {
    return `${formatNumber(value, '0.[00]a')}%`
  }

  if (unit === 'ms') {
    return formatMilliseconds(value)
  }

  if (unit === 'bytes') {
    return `${formatBytes(value)}`
  }

  if (value > 0 && value < 0.001) {
    return formatNumber(value, '.[00000]')
  }

  return `${formatNumber(value, '0.[000]a')}${unit || ''}`
}

function SqlChartRectangle(props: {
  stroke: string
  fill: string
  x?: number
  y?: number
  width?: number
  value?: number
  opacity?: number
}) {
  const { x, y, width, value, stroke, fill, opacity = 1 } = props
  return (
    <>
      {!!value && (
        <path
          d={`M ${x} ${y} h ${width}`}
          stroke={stroke}
          strokeWidth={1.5}
          fill="none"
        />
      )}
      <Rectangle {...props} fill={fill} stroke="none" />
    </>
  )
}

function yAxisFormatter(value: number, unit: string) {
  if (value === 0) return ''
  return formatter(value, unit)
}
