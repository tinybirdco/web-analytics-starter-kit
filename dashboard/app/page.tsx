'use client'

import { Suspense } from 'react'
/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import useAuth from '../lib/hooks/use-auth'
import config from '../lib/config'
import { Widgets } from './widgets'
import { TimeRangeSelect } from '@/components/TimeRangeSelect'
import { useTimeRange } from '@/lib/hooks/use-time-range'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()
  const { value: timeRangeValue, setValue: setTimeRangeValue, options: timeRanges } = useTimeRange()

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
        <div className="min-h-screen px-5 py-5 text-sm leading-5 sm:px-10 text-secondary">
          <div className="mx-auto max-w-7xl">
            <div className="space-y-6 sm:space-y-10">
              {isAuthenticated && isTokenValid && (
                <>
                  <img src="/icon.svg" alt="" width={24} height={24} />
                </>
              )}
              <TimeRangeSelect
                value={timeRangeValue}
                onChange={setTimeRangeValue}
                options={timeRanges}
              />
              <main>
                {isAuthenticated && !isTokenValid && <p>error</p>}
                {isAuthenticated && isTokenValid && <Widgets />}
                {!isAuthenticated && <p>credentials</p>}
              </main>
            </div>
          </div>
        </div>
      </>
    </Suspense>
  )
}
