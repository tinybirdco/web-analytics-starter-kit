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
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/Dialog'
import { AskAiIcon } from '@/components/ui/Icons'
import { DomainSelect } from '@/components/ui/DomainSelect'
import React from 'react'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()
  const {
    value: timeRangeValue,
    setValue: setTimeRangeValue,
    options: timeRanges,
  } = useTimeRange()
  const [open, setOpen] = useState(false)

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
        <div className="px-4">
          <main className="max-w-screen-xl mx-auto space-y-10">
            <div className="w-full overflow-x-auto">
              <div className="grid grid-flow-col auto-cols-[minmax(10rem,_1fr)] gap-4">
                {/* AI Chat Modal */}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        'aspect-square min-w-40 min-h-40 rounded-lg bg-[var(--text-blue-color)]',
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
                    <AIChatProvider>
                      <AIChatContainer className="max-h-screen max-w-2xl overflow-y-auto" />
                    </AIChatProvider>
                  </DialogContent>
                </Dialog>
                {/* End AI Chat Modal */}

                {/* Placeholder squares */}
                {new Array(6).fill(0).map((_, i) => (
                  <div
                    key={`ai-ph_${i}`}
                    className="aspect-square min-w-40 min-h-40 border border-[var(--border-02-color)] bg-white rounded-lg hover:border-[var(--border-03-color)] transition-colors duration-100"
                  />
                ))}
              </div>
            </div>

            <nav className="flex justify-between items-center">
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
            </nav>
            <div>
              {isAuthenticated && !isTokenValid && <p>error</p>}
              {isAuthenticated && isTokenValid && (
                <DashboardTabs />
              )}
              {!isAuthenticated && <CredentialsDialog />}
            </div>
          </main>
        </div>
      </>
    </Suspense>
  )
}
