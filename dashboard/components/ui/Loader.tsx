import { cn } from '@/lib/utils'
import styles from './Loader.module.css'
import { LoaderCircleIcon, LoaderIcon } from 'lucide-react'

export function Loader({
  className,
  color = 'currentColor',
  size = 11,
  width = 1,
  style
}: {
  className?: string
  color?: string
  size?: number
  width?: number
  style?: React.CSSProperties
}) {
  const borderColor = `${color} transparent transparent transparent`
  const borderWidth = `${width}px`
  return (
    <div
      className={cn(styles.loader, className)}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
      data-testid="loader"
    >
      <div
        style={{
          borderColor,
          borderWidth
        }}
      />
      <div
        style={{
          borderColor,
          borderWidth
        }}
      />
      <div
        style={{
          borderColor,
          borderWidth
        }}
      />
      <div
        style={{
          borderColor,
          borderWidth
        }}
      />
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          animationDuration: '1s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          animationName: 'spin'
        }}
      >
        <LoaderIcon size={16} />
      </div>
    </div>
  )
}

export function SpinnerCircle() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          animationDuration: '1s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          animationName: 'spin'
        }}
      >
        <LoaderCircleIcon size={16} />
      </div>
    </div>
  )
}
