'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import styles from './Button.module.css'
import { Loader } from './Loader'

const buttonVariants = cva(styles.base, {
  variants: {
    variant: {
      solid: styles.solid,
      outline: styles.outline,
      text: styles.text
    },
    color: {
      primary: styles.primary,
      secondary: styles.secondary,
      error: styles.error,
      dark: styles.dark
    },
    size: {
      small: styles.sizeSmall,
      medium: styles.sizeMedium,
      large: styles.sizeLarge,
      icon: styles.sizeIcon
    }
  },
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: 'medium'
  }
})

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
    fullWidth?: boolean
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? (Slot as React.ElementType) : 'button'
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, color, size, className }),
          fullWidth && styles.fullWidth
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <span className={cn(styles.content, isLoading && styles.loading)}>
            {isLoading && (
              <span className={styles.loadingOverlay}>
                <Loader />
              </span>
            )}
            {children}
          </span>
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
