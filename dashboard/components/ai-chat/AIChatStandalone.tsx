'use client'

import React from 'react'
import { AIChatProvider, AIChatContainer } from './index'

interface AIChatStandaloneProps {
  placeholder?: string
  className?: string
  maxSteps?: number
}

/**
 * Standalone AI Chat component that can be embedded anywhere
 * 
 * Usage:
 * ```tsx
 * <AIChatStandalone 
 *   placeholder="Ask about your data..."
 *   className="my-custom-styles"
 *   maxSteps={30}
 * />
 * ```
 */
export function AIChatStandalone({ 
  placeholder,
  className = "",
  maxSteps = 30
}: AIChatStandaloneProps) {
  return (
    <div className={className}>
      <AIChatProvider maxSteps={maxSteps}>
        <AIChatContainer placeholder={placeholder} />
      </AIChatProvider>
    </div>
  )
} 