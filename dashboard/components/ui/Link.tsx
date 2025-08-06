import { cn } from '@/lib/utils'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import styles from './Link.module.css'

type LinkProps = ComponentProps<typeof NextLink> & {
  className?: string
}

export function Link({ className, ...props }: LinkProps) {
  return <NextLink className={cn(styles.link, className)} {...props} />
}
