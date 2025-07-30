'use client'

import React from 'react'
import { useAIChat } from './AIChatProvider'
import { AIChatForm } from './AIChatForm'
import { AIChatMessage } from './AIChatMessage'
import { cn } from '@/lib/utils'
import { Text } from '../ui/Text'
import { motion } from 'motion/react'
import { Card } from '../ui/Card'
import { Loader } from '../ui/Loader'

interface AIChatContainerProps {
  placeholder?: string
  className?: string
  showForm?: boolean
}

const AIChatCredits = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <a href="https://tinybird.co" target="_blank" rel="noopener noreferrer">
        <div className="flex items-center gap-2 justify-end pr-4 mb-2">
          <img src="/icon.svg" alt="Tinybird" width={16} height={16} />
          <Text variant="caption" color="01">
            Powered by Tinybird
          </Text>
        </div>
      </a>
    </motion.div>
  )
}

const AnalyzingCard = () => {
  const REASONING_HEIGHT = 220
  const ANIMATION_CONFIG = {
    duration: 0.1,
    delay: 0.1,
    scale: { type: 'inertia' as const, visualDuration: 0.2 },
  }

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
        <motion.div
          initial={{ opacity: 0, translateY: 6, scale: 1 }}
          animate={{ opacity: 1, translateY: 0, top: 0, zIndex: 0 }}
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
            variant="loading"
            className="scroll-smooth space-y-3"
            maxHeight={REASONING_HEIGHT + 10}
          >
            <div className="text-xs flex items-center gap-x-2.5 py-0.5">
              <Loader className={'text-[var(--icon-color)]'} />
              <Text variant="body" color="01">
                Analyzing your question…
              </Text>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export function AIChatContainer({
  placeholder,
  className = '',
  showForm = true,
}: AIChatContainerProps) {
  const { messages, isLoading,  error, status } = useAIChat()

  const cards = messages
    .filter(
      (message: any) =>
        message.role === 'system' || message.role === 'assistant'
    )
    .map((message: any, index: number) => ({
      message,
      index,
    }))

  return (
    <div className={cn('CustomScrollArea', className)}>
      <AIChatCredits />

      {showForm && <AIChatForm placeholder={placeholder} />}

      <div>
        {cards.map(({ message, index }) => {
          return (
            <AIChatMessage key={index} message={message} messageIndex={index} status={status} />
          )
        })}
        
        {/* Show analyzing card only when loading and no messages yet */}
        {isLoading && cards.length === 0 && <AnalyzingCard />}
      </div>
    </div>
  )
}
