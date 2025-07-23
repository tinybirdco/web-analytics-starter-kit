'use client'

import { Suspense, useState } from 'react'
/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import useAuth from '../lib/hooks/use-auth'
import config from '../lib/config'
import DashboardTabs from './DashboardTabs'
import { TimeRangeSelect } from '@/components/ui/TimeRangeSelect'
import { useTimeRange } from '@/lib/hooks/use-time-range'
import CredentialsDialog from '@/components/CredentialsDialog'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/Text'
import { AIChatProvider, AIChatContainer } from '@/components/ai-chat'
import { InsightCards } from '@/components/ai-chat/InsightCards'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/Dialog'
import { AskAiIcon } from '@/components/ui/Icons'
import { DomainSelect } from '@/components/ui/DomainSelect'
import { createInsightsFromData } from '@/lib/data/insights'
import { useInsightsData } from '@/lib/hooks/use-insights-data'
import useCurrentVisitors from '@/lib/hooks/use-current-visitors'
import React from 'react'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()
  const {
    value: timeRangeValue,
    setValue: setTimeRangeValue,
    options: timeRanges,
  } = useTimeRange()
  const [open, setOpen] = useState(false)
  const { data: insightsData, isLoading: insightsLoading } = useInsightsData()
  const insights = createInsightsFromData(insightsData)

  return (
    <AIChatProvider>
      <Suspense>
        <>
          {process.env.NODE_ENV === 'production' && (
            <Script
              defer
              src="https://unpkg.com/@tinybirdco/flock.js"
              data-token={config.trackerToken}
            />
          )}

          <header className="bg-[var(--background-01-color)] p-6 border-b border-[var(--border-01-color)] pb-[516px] -mb-[492px]">
            <img src="/icon.svg" alt="" width={24} height={24} />
          </header>
          <div className="px-4">
            <main className="max-w-[1216px] mx-auto space-y-10">
              <div className="w-full overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-fr gap-4 min-w-max">
                  {/* AI Chat Modal */}
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button
                        className={cn(
                          'aspect-square w-40 h-40 rounded-lg bg-[var(--text-blue-color)]',
                          'hover:opacity-90 transition-opacity duration-100',
                          'flex flex-col justify-between p-5 items-start'
                        )}
                        aria-label="Open AI Chat"
                      >
                        <AskAiIcon size={32} color="white" />
                        <div className="space-y-px flex flex-col">
                          <Text variant="displayxsmall" color="inverse">
                            Ask AI
                          </Text>
                          <Text variant="body" color="inverse">
                            Ask your data anything
                          </Text>
                        </div>
                      </button>
                    </DialogTrigger>
                    {/* Empty DialogContent to keep overlay, but not use the content box */}
                    <DialogContent className="!bg-transparent !shadow-none !border-none !p-0">
                      <AIChatContainer className="max-h-screen max-w-2xl overflow-y-auto" />
                    </DialogContent>
                  </Dialog>
                  {/* End AI Chat Modal */}

                  {/* Preloaded Insight Cards */}
                  <InsightCards
                    insights={insights}
                    onCardClick={() => setOpen(true)}
                    isLoading={insightsLoading}
                  />
                </div>
              </div>

              <nav className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <Text
                      variant="displaymedium"
                      color="default"
                      className="tracking-tight"
                    >
                      Web Analytics & Insights
                    </Text>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Text variant="body" color="01">
                        {useCurrentVisitors()} visitors online
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <DomainSelect />
                  </div>
                  <div>
                    <TimeRangeSelect
                      value={timeRangeValue}
                      onChange={setTimeRangeValue}
                      options={timeRanges}
                    />
                  </div>
                </div>
              </nav>
              <div>
                {isAuthenticated && !isTokenValid && <p>error</p>}
                {isAuthenticated && isTokenValid && <DashboardTabs />}
                {!isAuthenticated && <CredentialsDialog />}
              </div>
            </main>
          </div>
        </>
        <footer className="px-4 pt-24 pb-12">
          <div className="max-w-[1216px] mx-auto flex items-center gap-2">
            <img src="/icon.svg" alt="" width={16} height={16} />
            <Text variant="caption" color="01">
              This is a Tinybird template. Feel free to customize it.
            </Text>
          </div>
        </footer>
      </Suspense>
    </AIChatProvider>
  )
}
