# AI Chat Components

This directory contains modular AI chat components that can be used independently or embedded in other applications.

## Components

### AIChatProvider
Context provider that manages the chat state using `@ai-sdk/react`.

```tsx
import { AIChatProvider } from '@/components/ai-chat'

<AIChatProvider maxSteps={30}>
  {/* Your chat components */}
</AIChatProvider>
```

### AIChatForm
Input form component for user messages.

```tsx
import { AIChatForm } from '@/components/ai-chat'

<AIChatForm 
  placeholder="Ask about your data..."
  className="my-custom-styles"
/>
```

### AIChatMessage
Displays individual chat messages with reasoning and results.

```tsx
import { AIChatMessage } from '@/components/ai-chat'

<AIChatMessage 
  message={message}
  messageIndex={index}
/>
```

### AIChatToolCall
Handles visualization of tool calls (SQL charts, tables, etc.).

```tsx
import { AIChatToolCall } from '@/components/ai-chat'

<AIChatToolCall 
  part={part}
  partIndex={index}
  isResult={false}
/>
```

### AIChatContainer
Main container that combines form and messages.

```tsx
import { AIChatContainer } from '@/components/ai-chat'

<AIChatContainer 
  placeholder="Ask about your data..."
  className="my-custom-styles"
  showForm={true}
/>
```

### AIChatStandalone
Complete standalone component that can be embedded anywhere.

```tsx
import { AIChatStandalone } from '@/components/ai-chat'

<AIChatStandalone 
  placeholder="Ask about your data..."
  className="my-custom-styles"
  maxSteps={30}
/>
```

## Usage Examples

### Basic Usage
```tsx
import { AIChatStandalone } from '@/components/ai-chat'

function MyPage() {
  return (
    <div>
      <h1>My Analytics Dashboard</h1>
      <AIChatStandalone />
    </div>
  )
}
```

### Custom Styling
```tsx
import { AIChatStandalone } from '@/components/ai-chat'

function MyPage() {
  return (
    <div>
      <AIChatStandalone 
        placeholder="Ask about your analytics..."
        className="max-w-4xl mx-auto p-6"
        maxSteps={50}
      />
    </div>
  )
}
```

### Advanced Usage with Custom Components
```tsx
import { 
  AIChatProvider, 
  AIChatForm, 
  AIChatContainer 
} from '@/components/ai-chat'

function MyCustomChat() {
  return (
    <AIChatProvider maxSteps={30}>
      <div className="my-custom-layout">
        <AIChatForm placeholder="Custom placeholder..." />
        <AIChatContainer showForm={false} />
      </div>
    </AIChatProvider>
  )
}
```

## Embedding in Other Applications

The components are designed to be easily embedded in other applications. Simply import the `AIChatStandalone` component and use it anywhere:

```tsx
// In any React application
import { AIChatStandalone } from '@your-org/ai-chat-components'

function App() {
  return (
    <div>
      <header>Your App</header>
      <main>
        <AIChatStandalone />
      </main>
    </div>
  )
}
```

## Dependencies

The components depend on:
- `@ai-sdk/react` for chat functionality
- Existing UI components from `@/components/ui/`
- CSS variables for theming

Make sure these dependencies are available in your target application. 