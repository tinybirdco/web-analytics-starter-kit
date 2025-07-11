'use client'

import React from 'react'
import { useAIChat } from './AIChatProvider'
import { AIChatForm } from './AIChatForm'
import { AIChatMessage } from './AIChatMessage'

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

      <div className="space-y-4">
        {cards.map(({ message, index }) => (
          <AIChatMessage key={index} message={message} messageIndex={index} />
        ))}
      </div>
    </div>
  )
}
