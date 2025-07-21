'use client'

import React, { useEffect, useRef } from 'react'
import { useAIChat } from './AIChatProvider'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'
import { cn } from '@/lib/utils'
import { AskAiIcon, ExplorationIcon, LineChartIcon, ListTreeIcon } from '../ui/Icons'
import { ListIcon } from 'lucide-react'

export interface InsightCard {
  id: string
  title: string
  description: string
  question: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
  metric?: string
  subtitle?: string
  isHighlighted?: boolean
  type?: 'chart' | 'list' | 'metric'
}

interface InsightCardsProps {
  insights: InsightCard[]
  className?: string
  onCardClick?: () => void
  isLoading?: boolean
}

export function InsightCards({
  insights,
  className,
  onCardClick,
  isLoading = false,
}: InsightCardsProps) {
  const {
    setInput,
    handleSubmit,
    setLastSubmittedQuestion,
    input,
    setMessages,
  } = useAIChat()

  const handleCardClick = (question: string) => {
    // Clear previous messages for one-off questions
    setMessages([])

    // Set the last submitted question as placeholder first
    setLastSubmittedQuestion(question)

    // Set the input with the question
    setInput(question)

    // Open the modal if callback is provided
    if (onCardClick) {
      onCardClick()
    }

    // Submit after a delay to allow the modal to open and input to be set
    setTimeout(() => {
      // Try to trigger the form submission by finding the form and submitting it
      const form = document.querySelector('form')
      if (form) {
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        )
      } else {
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.FormEvent

        handleSubmit(syntheticEvent)
      }
    }, 200)
  }

  const getColorClasses = (insight: InsightCard) => {
    // Use blue border for highlighted cards, otherwise use default border
    if (insight.isHighlighted) {
      return 'bg-white border-2 border-[var(--text-blue-color)] hover:border-[var(--text-blue-color)]'
    }
    return 'bg-white border border-[var(--border-02-color)] hover:border-[var(--border-03-color)]'
  }

  return insights.map(insight => (
    <button
      key={insight.id}
      onClick={() => handleCardClick(insight.question)}
      className={cn(
        '!aspect-square w-40 h-40 rounded-lg transition-all duration-100',
        'flex flex-col justify-between p-3.5 items-start text-left',
        'border-solid border-[var(--border-02-color)] focus:border- focus:border-[var(--border-03-color)]',
        getColorClasses(insight),
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={`Ask: ${insight.title}`}
      disabled={isLoading}
    >
      {/* Icon placeholder */}
      <div className="mb-2 w-8 h-8 bg-[var(--background-02-color)] rounded flex items-center justify-center">
        {insight.type === 'list' ? (
          <ListIcon size={18} />
        ) : (
          <LineChartIcon size={24} />
        )}
      </div>

      <div className="space-y-1 flex flex-col">
        {insight.metric ? (
          <>
            <Text variant="displayxsmall" color="default" className="font-bold text-2xl">
              {insight.metric}
            </Text>
            <Text variant="body" color="01" className="text-sm leading-tight line-clamp-2">
              {insight.subtitle || insight.description}
            </Text>
          </>
        ) : (
          <>
            <Text variant="displayxsmall" color="default" className="font-semibold">
              {insight.title}
            </Text>
            <Text variant="body" color="01" className="text-sm leading-tight line-clamp-2">
              {insight.description}
            </Text>
          </>
        )}
      </div>
    </button>
  ))
}
