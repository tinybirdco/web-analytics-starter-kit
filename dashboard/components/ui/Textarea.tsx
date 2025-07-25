import * as React from 'react'

import { cn } from '@/lib/utils'
import styles from './Textarea.module.css'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<'textarea'>
>(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={cn(styles.textarea, className)} {...props} />
})

Textarea.displayName = 'Textarea'

export { Textarea }
