import React from 'react'
import { cn } from '@/lib/utils'

export function Card({ children, className, blueBorder = false, isLoading = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { blueBorder?: boolean }) {
  return (
    <div
      className={cn(
        'bg-white p-4 rounded-lg shadow-sm border',
        blueBorder ? 'border-[var(--alternative-color)] border-2' : 'border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 