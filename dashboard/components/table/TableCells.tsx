import { Text } from '../ui/Text'
import { Link } from '../ui/Link'
import { cn } from '@/lib/utils'
import styles from './TableCells.module.css'
import * as Flags from 'country-flag-icons/react/3x2'
import countries from '@/lib/constants/countries'
import browsers from '@/lib/constants/browsers'
import devices from '@/lib/constants/devices'

// Regular text cell
export function TableCellText({ children }: { children: React.ReactNode }) {
  return <Text variant="bodysemibold">{children}</Text>
}

// Bold text cell, optionally as a link
export function TableCellBold({ children, href }: { children: React.ReactNode; href?: string }) {
  if (href) {
    return <Link href={href}><Text variant="bodysemibold">{children}</Text></Link>
  }
  return <Text variant="bodysemibold">{children}</Text>
}

// Monospaced number cell
export function TableCellMono({ children }: { children: React.ReactNode }) {
  return <Text as="span" variant="code">{children}</Text>
}

// Progress bar cell
export function TableCellProgress({ value, max }: { value: number; max: number }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={styles.progressBarWrapper}>
      <div className={styles.progressBarBg}>
        <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

// Delta indicator cell
export function TableCellDelta({ delta }: { delta: number }) {
  const isPositive = delta > 0
  const isNegative = delta < 0
  const color = isPositive ? styles.deltaPositive : isNegative ? styles.deltaNegative : styles.deltaNeutral
  const sign = isPositive ? '+' : ''
  return (
    <span className={cn(styles.delta, color)}>
      {isPositive && '▲'}
      {isNegative && '▼'}
      {sign}{delta}%
    </span>
  )
}

// Combined cell for layouts like number + progress, number + delta, etc.
export function TableCellCombined({ children }: { children: React.ReactNode }) {
  return <div className={styles.combined}>{children}</div>
}

export function TableCellCountry({ code }: { code: string }) {
  const countryCode = code?.toUpperCase?.() || ''
  const name = countries[countryCode as keyof typeof countries] || countryCode || '(unknown)'
  const Flag = (Flags as any)[countryCode]
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {Flag ? (
        <span style={{ width: 20, display: 'inline-block' }}>
          <Flag title={name} />
        </span>
      ) : null}
      <Text variant="bodysemibold">{name}</Text>
    </span>
  )
}

export function TableCellBrowser({ code }: { code: string }) {
  const name = browsers[code as keyof typeof browsers] || code || '(unknown)'
  return <Text variant="bodysemibold">{name}</Text>
}

export function TableCellDevice({ code }: { code: string }) {
  const name = devices[code as keyof typeof devices] || code || '(unknown)'
  return <Text variant="bodysemibold">{name}</Text>
} 