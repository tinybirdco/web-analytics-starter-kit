'use client'

import React from 'react'
import { SqlChart } from '@/components/ui/SqlChart'
import { PipeTable } from '@/components/PipeTable'
import { CoreVitalGauge } from '@/components/ui/CoreVitalGauge'
import { Loader } from '@/components/ui/Loader'
import { CheckIcon } from '@/components/ui/Icons'
import { Text } from '@/components/ui/Text'

interface AIChatToolCallProps {
  part: any
  partIndex: number
  isResult?: boolean
}

export function AIChatToolCall({
  part,
  isResult = false,
}: AIChatToolCallProps) {
  const getToolLabel = (tool: string) => {
    switch (tool) {
      case 'explore_data':
        return 'Exploring your data'
      case 'list_endpoints':
        return 'Scanning your datasources'
      case 'list_datasources':
        return 'Scanning your endpoints'
      case 'list_service_datasources':
        return 'Scanning your datasources'
      case 'text_to_sql':
        return 'Running SQL query'
      case 'execute_query':
        return 'Running SQL query'
      default:
        return `Querying your data`
    }
  }

  if (part.type === 'tool-invocation') {
    const toolName = part.toolInvocation.toolName
    const result = part.toolInvocation?.result
    const state = part.toolInvocation?.state

    if (toolName === 'renderSqlChart' && result) {
      return (
        <SqlChart
          data={result.data}
          error={undefined}
          isLoading={false}
          xAxisKey={result.xAxisKey}
          yAxisKey={result.yAxisKey}
          title={result.title}
          unit={result.unit}
          style={isResult ? { border: 'none', padding: 0 } : undefined}
          type={result.type}
        />
      )
    }

    if (toolName === 'renderPipeTable' && result) {
      return (
        <PipeTable
          data={result.data}
          columns={result.columns}
          title={result.title}
          style={{
            padding: 0,
            border: 0,
          }}
        />
      )
    }

    if (toolName === 'renderCoreVitalGauge' && result) {
      return (
        <CoreVitalGauge
          metricEntries={result.metricEntries}
          timeseriesData={result.timeseriesData}
          selectedPercentile={result.selectedPercentile}
        />
      )
    }

    return (
      <div className="text-xs flex items-center gap-x-2.5 py-0.5">
        {state !== 'result' ? (
          <Loader className={'text-[var(--icon-color)]'} />
        ) : (
          <CheckIcon className={'text-[var(--icon-color)]'} />
        )}
        <Text variant="body" color="01">
          {getToolLabel(toolName)}
        </Text>
      </div>
    )
  }

  return null
}
