'use client'

import React, { useRef } from 'react'
import { useAIChat } from './AIChatProvider'
import { FormatIcon } from '@/components/ui/Icons'
import { Loader } from '../ui/Loader'
import { motion } from 'motion/react'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'

interface AIChatFormProps {
  placeholder?: string
  className?: string
}

export function AIChatForm({
  placeholder = 'Are there any bounce rate trends for my blog pages?',
  className = '',
}: AIChatFormProps) {
  const { input, handleInputChange, handleSubmit, isLoading, error } =
    useAIChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e)
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.1,
        delay: 0.1,
        scale: { type: 'inertia', visualDuration: 0.2 },
      }}
      style={{
        scale: 1,
      }}
    >
      <div className={className}>
        <form onSubmit={onSubmit} className="flex flex-col gap-2 mb-6">
          <label htmlFor="ai-chat-input" className="font-medium mb-1 sr-only">
            Ask a question about your analytics data
          </label>
          <div className="relative bg-white rounded-xl border border-[var(--border-01-color)] focus-within:border-[var(--border-02-color)] flex min-h-20 py-4 px-5 items-center transition-colors">
            <input
              id="ai-chat-input"
              className="flex-1 resize-none text-lg !bg-none placeholder:text-[var(--text-02-color)] disabled:bg-white"
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="aspect-square color-white bg-[var(--alternative-color)] size-12 rounded-lg inline-flex justify-center items-center hover:opacity-75"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader color="white" />
              ) : (
                <FormatIcon color="white" />
              )}
            </button>
          </div>
          {error && (
            <Card variant="error">
              <Text variant="bodysemibold" color="error">
                An error occurred while processing your request.
              </Text>
              <div className="text-red-500 text-sm">
                {JSON.stringify(error)}
              </div>
            </Card>
          )}
        </form>
        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  )
}
