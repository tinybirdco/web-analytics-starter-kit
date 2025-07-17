import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, useTime, useTransform } from 'motion/react'

export type CardVariant = 'default' | 'result' | 'error' | 'loading'

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: CardVariant
    maxHeight?: number
  }
>(
  (
    {
      children,
      maxHeight = undefined,
      className,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const time = useTime()

    // Animated conic-gradient for loading
    const background = useTransform(
      () =>
        `conic-gradient(from ${
          time.get() * 0.25
        }deg, var(--border-01-color), var(--border-01-color), var(--border-02-color), var(--border-01-color))`
    )

    // Background color per variant
    const bgColor =
      variant === 'result'
        ? 'bg-[var(--alternative-color)]'
        : variant === 'error'
        ? 'bg-[var(--error-color)]'
        : 'bg-[var(--border-01-color)]'

    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      variant === 'loading' ? (
        <motion.div
          className={cn(
            'rounded-[9px] p-px relative overflow-hidden',
            className
          )}
          style={{ backgroundImage: background }}
          ref={ref as React.Ref<HTMLDivElement>}
        >
          <div
            className={cn(
              'bg-white p-4 rounded-lg shadow-sm relative z-10 px-6',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </motion.div>
      ) : (
        <div
          className={cn(
            'rounded-[9px] p-px relative overflow-hidden',
            bgColor,
            className
          )}
          ref={ref}
        >
          <div
            className={cn(
              'bg-white pb-4 pt-5 rounded-lg shadow-sm relative z-10 px-5 h-full',
              className
            )}
            {...props}
          >
              {children}
          </div>
        </div>
      )
    // All other variants: static background color, no border
    return <Wrapper>{children}</Wrapper>
  }
)

Card.displayName = 'Card'
