import React, { forwardRef, useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { motion, useTime, useTransform } from 'motion/react'
import { Dialog, DialogContent } from './Dialog'
import { Button } from './Button'
import { FullscreenIcon } from 'lucide-react'

export type CardVariant = 'default' | 'dark' | 'result' | 'error' | 'loading'

const CardWrapper = ({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: CardVariant
}) => {
  const time = useTime()

   // Animated conic-gradient for loading border
  const background = useTransform(
    () =>
      `conic-gradient(from ${
        time.get() * 0.25
      }deg, var(--border-01-color), #848587, var(--border-01-color))`
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
        'relative overflow-hidden transition-all duration-100',
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
    viewAll?: boolean
    title?: string
  }
>(
  (
    {
      children,
      maxHeight = undefined,
      viewAll = false,
      className,
      variant = 'default',
      title,
      ...props
    },
    ref
  ) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [showFade, setShowFade] = useState(false)
    const [showSeeMore, setShowSeeMore] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    // Check if content overflows and show fade/see more button (only when viewAll is true)
    useEffect(() => {
      if (!maxHeight || !viewAll || !contentRef.current) return

      const checkOverflow = () => {
        const element = contentRef.current
        if (!element) return

        const isOverflowing = element.scrollHeight > element.clientHeight
        setShowFade(isOverflowing)
        setShowSeeMore(isOverflowing)
      }

      checkOverflow()

      // Re-check on window resize
      const resizeObserver = new ResizeObserver(checkOverflow)
      resizeObserver.observe(contentRef.current)

      return () => {
        if (contentRef.current) {
          resizeObserver.unobserve(contentRef.current)
        }
      }
    }, [maxHeight, viewAll, children])

    return (
      <>
        <CardWrapper variant={variant}>
          <div
            ref={ref}
            className={cn(
              'bg-white border-[2px] border-white p-5 rounded-lg shadow-sm relative z-10 h-full',
              maxHeight && !viewAll ? 'overflow-hidden' : '',
              className
            )}
            style={{
              maxHeight: maxHeight ? `${maxHeight}px` : 'auto',
              ...props.style,
            }}
            {...props}
          >
            <div
              ref={contentRef}
              className={"h-full"}
              style={{
                maxHeight:
                  maxHeight && !viewAll ? `${maxHeight - 40}px` : 'auto', // Account for padding
                overflow: maxHeight && !viewAll ? 'auto' : 'hidden',
              }}
            >
              {children}
            </div>

            {/* Fade overlay - only show when viewAll is true */}
            {showFade && viewAll && (
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent via-white/80 pointer-events-none" />
            )}

            {/* See more button - only show when viewAll is true */}
            {showSeeMore && viewAll && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  variant="outline"
                  className="!rounded-full"
                  color="secondary"
                  size="medium"
                  onClick={() => setIsDialogOpen(true)}
                >
                  View all
                  <FullscreenIcon />
                </Button>
              </div>
            )}
          </div>
        </CardWrapper>

        {/* Dialog for full content - only when viewAll is true */}
        {viewAll && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto CustomScrollArea !shadow-none !rounded-xl">
              <div className="">{children}</div>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }
)

Card.displayName = 'Card'
