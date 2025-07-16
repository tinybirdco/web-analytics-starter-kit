'use client'

import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { AIChatToolCall } from './AIChatToolCall'
import Markdown from 'react-markdown'
import { motion } from 'motion/react'
interface AIChatMessageProps {
  message: any
  messageIndex: number
}

export function AIChatMessage({ message, messageIndex }: AIChatMessageProps) {
  const reasoningParts: typeof message.parts = []
  const resultParts: typeof message.parts = []
  let hasFoundVisualization = false

  const scrollRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.children[0]?.scrollTo(0, 9999)
    }
  }, [message])

  return (
    <div className="space-y-4">
      {reasoningParts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          exit={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            duration: 0.1,
            delay: 0.1,
            scale: { type: 'inertia', visualDuration: 0.2 },
          }}
        >
          <Card
            variant="default"
            className="!max-h-[420px] overflow-y-auto scroll-smooth"
            ref={scrollRef}
          >
            {reasoningParts.map((part: any, partIndex: number) => {
              if (part.type === 'text') {
                return (
                  <div key={partIndex} className="tiptap">
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
        </motion.div>
      )}

      {resultParts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, translateY: 12 }}
          exit={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            duration: 0.1,
            delay: 0.1,
            scale: { type: 'inertia', visualDuration: 0.2 },
          }}
        >
          <Card variant="result">
            {resultParts.map((part: any, partIndex: number) => {
              if (part.type === 'text') {
                return (
                  <div key={partIndex} className="tiptap">
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
        </motion.div>
      )}
    </div>
  )
}
