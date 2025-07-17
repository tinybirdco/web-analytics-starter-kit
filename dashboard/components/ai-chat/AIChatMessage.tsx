'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { AIChatToolCall } from './AIChatToolCall'
import Markdown from 'react-markdown'
import { motion, useDragControls } from 'motion/react'
interface AIChatMessageProps {
  message: any
  messageIndex: number
}

export function AIChatMessage({ message, messageIndex }: AIChatMessageProps) {
  const reasoningParts: typeof message.parts = []
  const resultParts: typeof message.parts = []

  let hasFoundVisualization = false

  const scrollRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(16)
  const dragControls = useDragControls()

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

  const latestReasoningToolInvocation = reasoningParts.findLast(
    (part: any) =>
      part.type === 'tool-invocation' &&
      !part.toolInvocation.toolName.includes('render')
  )

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.children[0]?.scrollTo(0, 9999)
    }
  }, [message])

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '75vh',
        }}
      >
        {reasoningParts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, translateY: 32, scale: 1 }}
            exit={{ opacity: 0, translateY: 32 }}
            onClick={() => {
              setOffset((scrollRef?.current?.scrollHeight || 220) + 16)
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              top: 0,
              zIndex: 0,
              scaleX: resultParts?.length > 0 && offset < 24 ? 0.97 : 1,
              scaleY: resultParts?.length > 0 && offset < 24 ? 0.97 : 1,
            }}
            transition={{
              duration: 0.1,
              delay: 0.1,
              scale: { type: 'inertia', visualDuration: 0.2 },
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '220px',
              borderRadius: '8px',
              transformOrigin: 'top center',
              listStyle: 'none',
              cursor: 'pointer',
            }}
          >
            <Card
              variant={resultParts?.length === 0 ? 'loading' : 'default'}
              className="!max-h-[420px] overflow-y-auto scroll-smooth space-y-3"
              ref={scrollRef}
            >
              {latestReasoningToolInvocation && (
                <AIChatToolCall
                  part={latestReasoningToolInvocation}
                  partIndex={0}
                  isResult={false}
                />
              )}

              {reasoningParts.map((part: any, partIndex: number) =>
                part.type === 'text' ? (
                  <div key={partIndex} className="tiptap">
                    <Markdown>{part.text}</Markdown>
                  </div>
                ) : null
              )}
            </Card>
          </motion.div>
        )}

        {resultParts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, translateY: 32 }}
            exit={{ opacity: 0, translateY: 32 }}
            animate={{
              opacity: 1,
              translateY: 0,
              top: offset,
              scale: 1,
              zIndex: 1,
            }}
            transition={{
              duration: 0.1,
              delay: 0.1,
              scale: { type: 'decay', visualDuration: 0.2 },
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '220px',
              borderRadius: '8px',
              transformOrigin: 'top center',
              listStyle: 'none',
            }}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            drag={'y'}
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
    </div>
  )
}
