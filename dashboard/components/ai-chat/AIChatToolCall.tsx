'use client'

import React from 'react'
import { SqlChart } from '@/components/ui/SqlChart'
import { PipeTable } from '@/components/PipeTable'
import { Loader } from '@/components/ui/Loader'
import { CheckIcon } from '@/components/ui/Icons'
import { Text } from '@/components/ui/Text'

interface AIChatToolCallProps {
  part: any
  partIndex: number
  isResult?: boolean
}

export function AIChatToolCall({ part, partIndex, isResult = false }: AIChatToolCallProps) {
  const getToolLabel = (tool: string) => {
    switch (tool) {
      case 'explore_data':
        return 'Exploring your data'
      case 'list_endpoints':
        return 'Listing available endpoints'
      case 'list_datasources':
        return 'Listing your datasources'
      case 'list_service_datasources':
        return 'Listing service datasources'
      case 'text_to_sql':
        return 'Generating SQL query'
      case 'execute_query':
        return 'Running SQL query'
      default:
        return `Calling ${tool.split('_').join(' ')}`
    }
  }

  if (part.type === 'tool-invocation') {
    const toolName = part.toolInvocation.toolName
    const result = part.toolInvocation?.result
    const state = part.toolInvocation?.state

    if (toolName === 'renderSqlChart' && result) {
      return (
        <div className="my-2">
          <SqlChart
            data={result.data}
            error={undefined}
            isLoading={false}
            xAxisKey={result.xAxisKey}
            yAxisKey={result.yAxisKey}
            title={result.title}
            unit={result.unit}
            style={isResult ? { border: 'none', padding: 0 } : undefined}
          />
        </div>
      )
    }

    if (toolName === 'renderPipeTable' && result) {
      return (
        <div className="my-2">
          <PipeTable
            data={result.data}
            columns={result.columns}
            title={result.title}
          />
        </div>
      )
    }

    return (
      <div className="my-2 text-xs flex items-center gap-x-2.5">
        {state !== 'result' ? (
          <Loader />
        ) : (
          <CheckIcon />
        )}
        <Text>{getToolLabel(toolName)}</Text>
      </div>
    )
  }

  return null
} 