// Example usage of AI Chat components

import React from 'react'
import { 
  AIChatStandalone, 
  AIChatProvider, 
  AIChatForm, 
  AIChatContainer 
} from './index'

// Example 1: Simple standalone usage
export function SimpleExample() {
  return (
    <div className="p-6">
      <h1>Analytics Dashboard</h1>
      <AIChatStandalone />
    </div>
  )
}

// Example 2: Custom styling
export function CustomStyledExample() {
  return (
    <div className="max-w-4xl mx-auto">
      <AIChatStandalone 
        placeholder="Ask about your analytics data..."
        className="bg-gray-50 p-8 rounded-lg"
        maxSteps={50}
      />
    </div>
  )
}

// Example 3: Advanced usage with custom layout
export function AdvancedExample() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2>Analytics Dashboard</h2>
        <AIChatProvider maxSteps={30}>
          <AIChatForm placeholder="Ask about your data..." />
        </AIChatProvider>
      </div>
      <div>
        <h2>Chat History</h2>
        <AIChatProvider maxSteps={30}>
          <AIChatContainer showForm={false} />
        </AIChatProvider>
      </div>
    </div>
  )
}

// Example 4: Embedding in a modal or sidebar
export function ModalExample() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2>AI Assistant</h2>
        <AIChatStandalone 
          placeholder="How can I help you with your data?"
          className="mt-4"
        />
      </div>
    </div>
  )
} 