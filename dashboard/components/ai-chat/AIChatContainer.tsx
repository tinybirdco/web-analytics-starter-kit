'use client'

import React from 'react'
import { useAIChat } from './AIChatProvider'
import { AIChatForm } from './AIChatForm'
import { AIChatMessage } from './AIChatMessage'
import { motion } from 'motion/react'

interface AIChatContainerProps {
  placeholder?: string
  className?: string
  showForm?: boolean
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
    <div className={className}>
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
