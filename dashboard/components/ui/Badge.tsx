'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import styles from './Badge.module.css'
import { ArrowDownRightIcon, ArrowUpLeft, ArrowUpRightIcon } from 'lucide-react'

const badgeVariants = cva(styles.base, {
  variants: {
    variant: {
      default: styles.default,
      success: styles.success,
      warning: styles.warning,
      error: styles.error,
      info: styles.info,
    },
    size: {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'medium',
  },
})

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    delta?: number
    showSign?: boolean
  }

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, delta, showSign = true, children, ...props },
    ref
  ) => {
    const renderContent = () => {
      if (delta !== undefined) {
        return `${delta.toLocaleString()}%`
      }

      return children
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {delta ? (
          <>
            {delta > 0 && <ArrowUpRightIcon size={14} />}
            {delta < 0 && <ArrowDownRightIcon size={14} />}
          </>
        ) : null}
        
        {renderContent()}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
