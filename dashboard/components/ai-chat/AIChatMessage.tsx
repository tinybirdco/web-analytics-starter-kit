'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { AIChatToolCall } from './AIChatToolCall'
import Markdown from 'react-markdown'
import { motion } from 'motion/react'

// Constants
const OFFSET_CLOSED = 6
const OFFSET_HOVER = 10
const OFFSET_EXPANDED = 24
const REASONING_HEIGHT = 220
const CONTAINER_HEIGHT = '75vh'
const SCALE_COMPRESSED = 0.973

// Animation configurations
const ANIMATION_CONFIG = {
  duration: 0.1,
  delay: 0.1,
  scale: { type: 'inertia' as const, visualDuration: 0.2 },
  scaleDecay: { type: 'decay' as const, visualDuration: 0.2 },
}

const REASONING_ANIMATION = {
  initial: { opacity: 0, translateY: 6, scale: 1 },
  exit: { opacity: 0, translateY: 6 },
  animate: (offset: number, hasResults: boolean) => ({
    opacity: 1,
    translateY: 0,
    top: 0,
    zIndex: 0,
    scaleX: hasResults && offset < OFFSET_EXPANDED ? SCALE_COMPRESSED : 1,
    scaleY: hasResults && offset < OFFSET_EXPANDED ? SCALE_COMPRESSED : 1,
  }),
}

const RESULT_ANIMATION = {
  initial: { opacity: 0, translateY: 18 },
  exit: { opacity: 0, translateY: 18 },
  animate: (offset: number) => ({
    opacity: 1,
    translateY: 0,
    top: offset,
    scale: 1,
    zIndex: 1,
  }),
}

interface AIChatMessageProps {
  message: any
  messageIndex: number
}

export function AIChatMessage({ message, messageIndex }: AIChatMessageProps) {
  const reasoningParts: typeof message.parts = []
  const resultParts: typeof message.parts = []

  let hasFoundVisualization = false

  const scrollRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [offset, setOffset] = useState(OFFSET_CLOSED)

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
      scrollRef.current.scrollTo({
        top: 1999,
        behavior: 'smooth',
      })
    }
  }, [message])

  const handleMouseEnter = () => {
    if (offset === OFFSET_CLOSED) {
      setOffset(OFFSET_HOVER)
    }
  }

  const handleMouseLeave = () => {
    if (offset === OFFSET_HOVER) {
      setOffset(OFFSET_CLOSED)
    }
  }

  const handleReasoningClick = () => {
    const newOffset = (scrollRef?.current?.parentElement?.scrollHeight || REASONING_HEIGHT) + 8
    setOffset(newOffset)
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div
      ref={listRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          height: CONTAINER_HEIGHT,
        }}
      >
        {reasoningParts.length > 0 && (
          <motion.div
            {...REASONING_ANIMATION}
            animate={REASONING_ANIMATION.animate(offset, resultParts.length > 0)}
            onClick={handleReasoningClick}
            transition={ANIMATION_CONFIG}
            style={{
              position: 'absolute',
              width: '100%',
              height: `${REASONING_HEIGHT}px`,
              borderRadius: '8px',
              transformOrigin: 'top center',
              listStyle: 'none',
              cursor: 'pointer',
            }}
          >
            <Card
              variant="dark"
              className="scroll-smooth space-y-3"
              maxHeight={REASONING_HEIGHT + 10}
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
            {...RESULT_ANIMATION}
            animate={RESULT_ANIMATION.animate(offset)}
            transition={{
              ...ANIMATION_CONFIG,
              scale: ANIMATION_CONFIG.scaleDecay,
            }}
            style={{
              position: 'absolute',
              width: '100%',
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
              <div className="CustomScrollArea space-y-4">
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
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
