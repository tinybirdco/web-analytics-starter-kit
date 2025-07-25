'use client'
import * as React from 'react'
import styles from './Input.module.css'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(styles.input, className)} {...props} />
}
