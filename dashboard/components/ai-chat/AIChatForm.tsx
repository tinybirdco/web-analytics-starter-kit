'use client'

import React, { useRef } from 'react'
import { useAIChat } from './AIChatProvider'
import { FormatIcon } from '@/components/ui/Icons'
import { LoaderIcon } from 'lucide-react'
import { Loader } from '../ui/Loader'

interface AIChatFormProps {
  placeholder?: string
  className?: string
}

export function AIChatForm({
  placeholder = 'e.g. What are the top pages by bounce rate last week?',
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
    <div className={className}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 mb-6">
        <label htmlFor="ai-chat-input" className="font-medium mb-1 sr-only">
          Ask a question about your analytics data
        </label>
        <div className="relative bg-white rounded-xl border border-[var(--border-02-color)] focus-within:border-[var(--border-03-color)] flex min-h-20 p-4 items-center transition-colors">
          <textarea
            id="ai-chat-input"
            className="flex-1 resize-none text-lg !bg-none placeholder:text-[var(--text-02-color)]"
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
          <div className="text-red-500 text-sm">{JSON.stringify(error)}</div>
        )}
      </form>
      <div ref={messagesEndRef} />
    </div>
  )
}
