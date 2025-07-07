'use client'

import { Fragment } from 'react'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from './Select'

export function TimeRangeSelect({
  value,
  onChange,
  options,
  className,
  style
}: {
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string; separator?: boolean }[]
  className?: string
  style?: React.CSSProperties
}) {
  const defaultValue = (options.find(tr => tr.value === value) || options[2]).value
  return (
    <SelectRoot
      defaultValue={defaultValue}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className={className} style={{ minWidth: 160, ...style }}>
        <span>
          Last <SelectValue placeholder="Select time range" />
        </span>
      </SelectTrigger>
      <SelectContent sideOffset={8}>
        {options.map(option => (
          <Fragment key={option.label}>
            <SelectItem value={option.value}>{option.label}</SelectItem>
            {option.separator && <SelectSeparator />}
          </Fragment>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}
