'use client'

import { Suspense } from 'react'
/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import useAuth from '../lib/hooks/use-auth'
import config from '../lib/config'
import { Widgets } from './widgets'
import { TimeRangeSelect } from '@/components/ui/TimeRangeSelect'
import { useTimeRange } from '@/lib/hooks/use-time-range'
import CredentialsDialog from '@/components/CredentialsDialog'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/Text'
import { useChat } from "@ai-sdk/react"
import { useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Textarea } from '@/components/ui/Textarea'
import { SqlChart } from '@/components/ui/SqlChart'
import { PipeTable } from '@/components/PipeTable'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()
  const {
    value: timeRangeValue,
    setValue: setTimeRangeValue,
    options: timeRanges,
  } = useTimeRange()

  const { messages, input, handleInputChange, handleSubmit, status, isLoading, error } = useChat({
    maxSteps: 5
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e)
    setTimeout(scrollToBottom, 100)
  }

  return (
    <Suspense>
      <>
        {process.env.NODE_ENV === 'production' && (
          <Script
            defer
            src="https://unpkg.com/@tinybirdco/flock.js"
            data-token={config.trackerToken}
          />
        )}
        <header className="bg-[var(--background-01-color)] p-6 border-b border-[var(--border-01-color)] pb-[408px] -mb-[380px]">
          <img src="/icon.svg" alt="" width={24} height={24} />
        </header>

        {/* AI Chat Form */}
        <div className="container mx-auto max-w-2xl px-4 py-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-2 mb-6">
            <label htmlFor="ai-chat-input" className="font-medium mb-1">Ask a question about your analytics data</label>
            <Textarea
              id="ai-chat-input"
              placeholder="e.g. What are the top pages by bounce rate last week?"
              className="min-h-[60px] w-full resize-none"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!input.trim() || isLoading}>
                {isLoading ? "Thinking..." : "Ask"}
              </Button>
            </div>
            {error && <div className="text-red-500 text-sm">{error.message}</div>}
          </form>
          <div className="space-y-2 mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100"}`}>
                  {message.parts.map((part, i) => {
                    if (part.type === "text") {
                      return <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">{part.text}</div>
                    }
                    if (part.type === "tool-invocation" && part.toolInvocation.state === "result") {
                      const toolName = part.toolInvocation.toolName
                      const result = part.toolInvocation.result
                      if (toolName === "renderSqlChart") {
                        return (
                          <div key={`${message.id}-${i}`} className="my-2">
                            <SqlChart
                              data={result.data}
                              error={undefined}
                              isLoading={false}
                              xAxisKey={result.xAxisKey}
                              yAxisKey={result.yAxisKey}
                              title={result.title}
                              unit={result.unit}
                            />
                          </div>
                        )
                      }
                      if (toolName === "renderPipeTable") {
                        return (
                          <div key={`${message.id}-${i}`} className="my-2">
                            <PipeTable
                              data={result.data}
                              columns={result.columns}
                              title={result.title}
                            />
                          </div>
                        )
                      }
                      // fallback for unknown tool
                      return (
                        <div key={`${message.id}-${i}`} className="my-2 text-xs">
                          <div className="font-bold">Tool result:</div>
                          <pre className="mt-1 overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* End AI Chat Form */}

        <div className="px-4">
          <main className="container mx-auto space-y-10">
            <div className="grid grid-cols-6 gap-3">
              {new Array(6).fill(0).map((_, i) => (
                <div
                  key={`ai-ph_${i}`}
                  className={cn(
                    'aspect-square rounded-lg',
                    i === 0
                      ? 'bg-[var(--text-blue-color)]'
                      : 'border border-[var(--border-02-color)] bg-white'
                  )}
                />
              ))}
            </div>

            <nav className="flex justify-between">
              <Text variant="displaymedium" className="tracking-tight">
                Web Analytics
                <span className="ml-2 text-[var(--text-02-color)]">
                  https://domain.com
                </span>
              </Text>
              <div>
                <TimeRangeSelect
                  value={timeRangeValue}
                  onChange={setTimeRangeValue}
                  options={timeRanges}
                />
              </div>
            </nav>
            <div>
              {isAuthenticated && !isTokenValid && <p>error</p>}
              {isAuthenticated && isTokenValid && <Widgets />}
              {!isAuthenticated && <CredentialsDialog />}
            </div>
          </main>
        </div>
      </>
    </Suspense>
  )
}
