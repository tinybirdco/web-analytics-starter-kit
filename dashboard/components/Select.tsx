'use client'

import { cn } from '@/lib/utils'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronUp } from 'lucide-react'
import * as React from 'react'
import { CheckIcon, ChevronDownIcon } from './Icons'
import styles from './Select.module.css'

const SelectRoot = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ placeholder, ...props }, ref) => {
  return (
    <SelectPrimitive.Value
      ref={ref}
      placeholder={
        typeof placeholder === 'string' ? <span>{placeholder}</span> : placeholder
      }
      {...props}
    />
  )
})

SelectValue.displayName = SelectPrimitive.Value.displayName

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(styles.trigger, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={styles.icon} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn(styles.scrollButton, className)}
      {...props}
    >
      <ChevronUp className={styles.scrollIcon} />
    </SelectPrimitive.ScrollUpButton>
  )
})

SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn(styles.scrollButton, className)}
      {...props}
    >
      <ChevronDownIcon className={styles.scrollIcon} />
    </SelectPrimitive.ScrollDownButton>
  )
})

SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(styles.content, className)}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            styles.viewport,
            position === 'popper' && styles.viewportPopper
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(styles.label, className)}
      {...props}
    />
  )
})

SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(styles.item, className)}
      {...props}
    >
      <SelectPrimitive.ItemText>
        {typeof children === 'string' ? <span>{children}</span> : children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
        <CheckIcon color="var(--icon-color)" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
})

SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn(styles.separator, className)}
      {...props}
    />
  )
})

SelectSeparator.displayName = SelectPrimitive.Separator.displayName

function Select({
  options,
  placeholder = 'Select option',
  className,
  width = 300,
  variant = 'default',
  ...props
}: Omit<SelectPrimitive.SelectProps, 'children'> & {
  className?: string
  placeholder?: React.ReactNode
  options: { value: string; label: React.ReactNode; separator?: boolean }[]
  width?: number | string
  variant?: 'default' | 'dark'
}) {
  return (
    <SelectRoot {...props}>
      <SelectTrigger
        className={cn(className, styles[variant])}
        style={{ width, minWidth: 120 }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent sideOffset={8} className={styles[variant]}>
        {options.map(option => (
          <React.Fragment key={option.value}>
            <SelectItem
              value={option.value}
              className={cn(className, styles[variant])}
            >
              {option.label}
            </SelectItem>
            {option.separator && <SelectSeparator />}
          </React.Fragment>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
}
