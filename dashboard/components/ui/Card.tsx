import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion, useTime, useTransform } from 'motion/react'

export type CardVariant = 'default' | 'dark' | 'result' | 'error' | 'loading'

const CardWrapper = ({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: CardVariant
}) => {
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
      : variant === 'dark'
      ? 'bg-[var(--border-02-color)]'
      : 'bg-[var(--border-01-color)]'

  return variant === 'loading' ? (
    <motion.div
      className={cn('rounded-[9px] p-px relative overflow-hidden')}
      style={{ backgroundImage: background }}
    >
      {children}
    </motion.div>
  ) : (
    <div
      className={cn(
        'relative overflow-hidden',
        bgColor,
        variant === 'result' ? 'p-0.5 rounded-[10px]' : 'p-px rounded-[9px]'
      )}
    >
      {children}
    </div>
  )
}

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
    // All other variants: static background color, no border
    return (
      <CardWrapper variant={variant}>
        <div
          ref={ref}
          className={cn(
            'bg-white border-[2px] border-white p-5 rounded-lg scroll-smooth shadow-sm relative z-10 h-full CustomScrollArea',
            className
          )}
          style={{
            maxHeight: maxHeight ? `${maxHeight}px` : 'auto',
            overflowY: maxHeight ? 'scroll' : 'auto',
            ...props.style,
          }}
          {...props}
        >
          {children}
        </div>
      </CardWrapper>
    )
  }
)

Card.displayName = 'Card'
