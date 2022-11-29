import { Color } from '@tremor/react'

// https://www.tremor.so/docs/layout/color-palette
const tremorColors: Record<Color, string> = {
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  teal: '#14b8a6',
  fuchsia: '#d946ef',
  purple: '#a855f7',
  pink: '#ec4899',
  rose: '#f43f5e',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  slate: '#64748b',
  gray: '#6b7280',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
}

export const tremorColorNames = Object.keys(tremorColors) as Color[]
export const tremorColorCodes = Object.values(tremorColors)

export default tremorColors
