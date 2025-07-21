'use client'

import React, { useEffect, useRef } from 'react'
import { useAIChat } from './AIChatProvider'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'
import { cn } from '@/lib/utils'
import { AskAiIcon } from '../ui/Icons'

export interface InsightCard {
  id: string
  title: string
  description: string
  question: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

interface InsightCardsProps {
  insights: InsightCard[]
  className?: string
  onCardClick?: () => void
  isLoading?: boolean
}

export function InsightCards({ insights, className, onCardClick, isLoading = false }: InsightCardsProps) {
  const { setInput, handleSubmit, setLastSubmittedQuestion, input, setMessages } = useAIChat()

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
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      } else {
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.FormEvent
        
        handleSubmit(syntheticEvent)
      }
    }, 200)
  }

  const getColorClasses = (color?: string) => {
    // Always use white background with border-02, regardless of color prop
    return 'bg-white border border-[var(--border-02-color)] hover:border-[var(--border-03-color)]'
  }

  return (
    <div className={cn('grid grid-flow-col auto-cols-[minmax(10rem,_1fr)] gap-4', className)}>
      {insights.map((insight) => (
        <button
          key={insight.id}
          onClick={() => handleCardClick(insight.question)}
          className={cn(
            'aspect-square min-w-40 min-h-40 rounded-lg transition-all duration-100',
            'flex flex-col justify-between p-5 items-start text-left',
            'hover:scale-[1.02] active:scale-[0.98]',
            getColorClasses(insight.color),
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Ask: ${insight.title}`}
          disabled={isLoading}
        >
          {/* Minichart placeholder */}
          <div className="mb-2 w-8 h-8 bg-[var(--background-02-color)] rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-[var(--text-blue-color)] rounded-sm"></div>
          </div>
          
          <div className="space-y-px flex flex-col">
            <Text 
              variant="displayxsmall" 
              color="default"
              className="font-semibold"
            >
              {insight.title}
            </Text>
            <Text 
              variant="body" 
              color="02"
              className="text-sm leading-tight"
            >
              {insight.description}
            </Text>
          </div>
        </button>
      ))}
    </div>
  )
} 