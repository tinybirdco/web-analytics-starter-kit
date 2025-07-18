'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useChat } from '@ai-sdk/react'

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
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined)

interface AIChatProviderProps {
  children: ReactNode
  maxSteps?: number
}

export function AIChatProvider({ children, maxSteps = 30 }: AIChatProviderProps) {
  const chatState = useChat({
    maxSteps,
  })

  return (
    <AIChatContext.Provider value={{ ...chatState }}>
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