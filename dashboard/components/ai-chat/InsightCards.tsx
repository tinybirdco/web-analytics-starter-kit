'use client'

import React from 'react'
import { useAIChat } from './AIChatProvider'
import { Text } from '../ui/Text'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '@/lib/utils'
import {
  InsightIncreaseIcon,
  InsightListIcon,
} from '../ui/Icons'

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
  isLoading?: boolean
}

interface InsightCardsProps {
  insights: InsightCard[]
  className?: string
  onCardClick?: () => void
  isLoading?: boolean
}

export function InsightCards({
  insights,
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
    return 'bg-white border border-[var(--border-02-color)] hover:border-[var(--border-03-color)] focus:outline active:outline outline-[3px] outline-[var(--alternative-color)] outline-offset-[3px]'
  }

  return insights.map(insight => (
    <button
      key={insight.id}
      onClick={() => handleCardClick(insight.question)}
      className={cn(
        '!aspect-square w-40 h-40 rounded-lg transition-all duration-100',
        'flex flex-col justify-between p-[15px] items-start text-left',
        'border-solid border-[var(--border-02-color)] focus:border- focus:border-[var(--border-03-color)]',
        getColorClasses(insight),
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={`Ask: ${insight.title}`}
      disabled={isLoading}
    >
      {/* Icon placeholder */}
      <div>
        {insight.type === 'list' ? (
          <InsightListIcon />
        ) : (
          <InsightIncreaseIcon />
        )}
      </div>

      <div className="flex flex-col justify-between">
        {insight.isLoading ? (
          <>
            <Skeleton width="60px" height="24px" />
            <Skeleton width="100px" height="16px" />
          </>
        ) : insight.metric ? (
          <>
            <Text
              variant="displayxsmall"
              color="default"
            >
              {insight.metric}
            </Text>
            <Text
              variant="body"
              color="01"
              className="text-sm leading-tight line-clamp-2"
            >
              {insight.subtitle || insight.description}
            </Text>
          </>
        ) : (
          <>
            <Text
              variant="displayxsmall"
              color="default"
            >
              {insight.title}
            </Text>
            <Text
              variant="body"
              color="01"
              className="text-sm leading-tight line-clamp-2"
            >
              {insight.description}
            </Text>
          </>
        )}
      </div>
    </button>
  ))
}
