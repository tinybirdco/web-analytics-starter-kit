'use client'

import React, { createContext, useContext, ReactNode, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useSearchParams } from 'next/navigation'

interface AIChatContextType {
  messages: any[]
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  status: string
  isLoading: boolean
  error: any
  setMessages: (messages: any[] | ((messages: any[]) => any[])) => void
  lastSubmittedQuestion: string
  setLastSubmittedQuestion: (question: string) => void
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined)

interface AIChatProviderProps {
  children: ReactNode
  maxSteps?: number
}

export function AIChatProvider({
  children,
  maxSteps = 30,
}: AIChatProviderProps) {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  const host = searchParams?.get('host')

  // Build the API URL with query parameters
  const apiUrl =
    token && host
      ? `${
          process.env.NEXT_PUBLIC_ASK_TINYBIRD_ENDPOINT
        }?token=${encodeURIComponent(token)}&host=${encodeURIComponent(host)}`
      : `${process.env.NEXT_PUBLIC_ASK_TINYBIRD_ENDPOINT}`

  const chatState = useChat({
    api: apiUrl,
    maxSteps,
  })
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState('')

  return (
    <AIChatContext.Provider
      value={{
        ...chatState,
        lastSubmittedQuestion,
        setLastSubmittedQuestion,
      }}
    >
      {children}
    </AIChatContext.Provider>
  )
}

export function useAIChat() {
  const context = useContext(AIChatContext)
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider')
  }
  return context
}
