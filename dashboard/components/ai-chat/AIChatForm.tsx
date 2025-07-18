'use client'

import React, { useRef } from 'react'
import { useAIChat } from './AIChatProvider'
import { FormatIcon } from '@/components/ui/Icons'
import { Loader } from '../ui/Loader'
import { motion, type MotionValue, useTime, useTransform } from 'motion/react'
import { Card } from '../ui/Card'
import { Text } from '../ui/Text'

interface AIChatFormProps {
  placeholder?: string
  className?: string
}

const InputWrapper = ({
  children,
  isLoading,
  background,
}: {
  children: React.ReactNode
  isLoading: boolean
  background: MotionValue<string>
}) => {
  if (isLoading) {
    return (
      <motion.div
        className="relative rounded-[13px] p-px overflow-hidden"
        style={{ backgroundImage: background }}
      >
        <div className="relative bg-white rounded-xl flex min-h-[78px] py-3 px-5 pr-3.5 items-center">
          {children}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative bg-white rounded-xl border border-[var(--border-02-color)] focus-within:border-[var(--border-02-color)] flex min-h-20 py-3.5 px-5 pr-3.5 items-center transition-colors">
      {children}
    </div>
  )
}

export function AIChatForm({
  placeholder = 'Are there any bounce rate trends for my blog pages?',
  className = '',
}: AIChatFormProps) {
  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    setInput,
  } = useAIChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const time = useTime()

  // Animated conic-gradient for loading border
  const background = useTransform(
    () =>
      `conic-gradient(from ${
        time.get() * 0.25
      }deg, var(--border-01-color), var(--border-03-color), var(--border-01-color))`
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const savedInput = input // Save the current input value
    setMessages([])
    handleSubmit(e)
    setTimeout(() => {
      setInput(savedInput) // Restore the input value after handleSubmit clears it
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 10)
  }

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 6 }}
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
        <form onSubmit={onSubmit} className="flex flex-col gap-2 mb-2">
          <label htmlFor="ai-chat-input" className="font-medium mb-1 sr-only">
            Ask a question about your analytics data
          </label>
          <InputWrapper isLoading={isLoading} background={background}>
            <input
              id="ai-chat-input"
              className="flex-1 resize-none text-lg !bg-none placeholder:text-[var(--text-02-color)] disabled:bg-white pr-3"
              placeholder={placeholder}
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="aspect-square color-white bg-[var(--alternative-color)] size-12 rounded-lg inline-flex justify-center items-center hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader color="white" />
              ) : (
                <FormatIcon color="white" />
              )}
            </button>
          </InputWrapper>
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
