'use client'

import { cn } from '@/lib/utils'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'
import styles from './Tooltip.module.css'

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    variant?: 'dark' | 'light'
  }
>(({ className, sideOffset = 4, variant = 'dark', ...props }, ref) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(styles.content, styles[variant], className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
})

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger }

export function Tooltip({
  content,
  children,
  side = 'right',
  shortcut,
  asChild = true,
  variant = 'dark',
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: TooltipPrimitive.TooltipContentProps['side']
  shortcut?: React.ReactNode
  asChild?: boolean
  variant?: 'dark' | 'light'
}) {
  if (typeof content === 'undefined' || content === null) {
    return children
  }

  return (
    <TooltipRoot>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      {content && (
        <TooltipContent
          side={side}
          onPointerDownOutside={e => e.preventDefault()}
          variant={variant}
        >
          {content}
          {shortcut && (
            <div style={{ marginLeft: 4, display: 'inline-flex' }}>{shortcut}</div>
          )}
        </TooltipContent>
      )}
    </TooltipRoot>
  )
}
