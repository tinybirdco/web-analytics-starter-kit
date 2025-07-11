'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { AIChatToolCall } from './AIChatToolCall'
import Markdown from 'react-markdown'

interface AIChatMessageProps {
  message: any
  messageIndex: number
}

export function AIChatMessage({ message, messageIndex }: AIChatMessageProps) {
  const reasoningParts: typeof message.parts = []
  const resultParts: typeof message.parts = []
  let hasFoundVisualization = false

  message.parts.forEach((part: any) => {
    if (
      part.type === 'tool-invocation' &&
      part.toolInvocation?.state === 'result' &&
      part.toolInvocation.toolName?.startsWith('render')
    ) {
      hasFoundVisualization = true
      resultParts.push(part)
    } else if (hasFoundVisualization) {
      resultParts.push(part)
    } else {
      reasoningParts.push(part)
    }
  })

  return (
    <div className="space-y-4">
      {reasoningParts.length > 0 && (
        <Card>
          {reasoningParts.map((part: any, partIndex: number) => {
            if (part.type === 'text') {
              return (
                <div
                  key={partIndex}
                  className="tiptap px-4"
                >
                  <Markdown>{part.text}</Markdown>
                </div>
              )
            }
            if (part.type === 'tool-invocation') {
              return (
                <AIChatToolCall
                  key={partIndex}
                  part={part}
                  partIndex={partIndex}
                  isResult={false}
                />
              )
            }
            return null
          })}
        </Card>
      )}

      {resultParts.length > 0 && (
        <Card blueBorder={true}>
          {resultParts.map((part: any, partIndex: number) => {
            if (part.type === 'text') {
              return (
                <div key={partIndex} className="tiptap px-4">
                  <Markdown>{part.text}</Markdown>
                </div>
              )
            }
            if (part.type === 'tool-invocation') {
              return (
                <AIChatToolCall
                  key={partIndex}
                  part={part}
                  partIndex={partIndex}
                  isResult={true}
                />
              )
            }
            return null
          })}
        </Card>
      )}
    </div>
  )
}
