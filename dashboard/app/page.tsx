'use client'

import { Suspense, useState } from 'react'
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
import { AIChatProvider, AIChatContainer } from '@/components/ai-chat'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/Dialog'

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
          <main className="container mx-auto space-y-10">
            <div className="grid grid-cols-6 gap-3">
              {/* AI Chat Modal */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button
                    className={cn(
                      'aspect-square rounded-lg bg-[var(--text-blue-color)]',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--text-blue-color)]',
                      'w-full h-full'
                    )}
                    aria-label="Open AI Chat"
                  />
                </DialogTrigger>
                {/* Empty DialogContent to keep overlay, but not use the content box */}
                <DialogContent className="!bg-transparent !shadow-none !border-none !p-0">
                  <AIChatProvider>
                    <AIChatContainer />
                  </AIChatProvider>
                </DialogContent>
              </Dialog>
              {/* End AI Chat Modal */}

              {/* The rest remain as before */}
              {new Array(5).fill(0).map((_, i) => (
                <div
                  key={`ai-ph_${i}`}
                  className="border border-[var(--border-02-color)] bg-white"
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
