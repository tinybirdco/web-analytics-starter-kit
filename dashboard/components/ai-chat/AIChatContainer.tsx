'use client'

import React from 'react'
import { useAIChat } from './AIChatProvider'
import { AIChatForm } from './AIChatForm'
import { AIChatMessage } from './AIChatMessage'
import { cn } from '@/lib/utils'
import { Text } from '../ui/Text'
import { motion } from 'motion/react'

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

export function AIChatContainer({
  placeholder,
  className = '',
  showForm = true,
}: AIChatContainerProps) {
  const { messages } = useAIChat()

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
            <AIChatMessage key={index} message={message} messageIndex={index} />
          )
        })}
      </div>
    </div>
  )
}
