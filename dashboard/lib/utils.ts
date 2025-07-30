import numeral from 'numeral'

export const cn = (...args: (string | undefined | false)[]) =>
  args.filter(Boolean).join(' ')

export const cx = (...args: (string | undefined | false)[]) =>
  args.filter(Boolean).join(' ')

export function kFormatter(value: number): string {
  return value > 999 ? `${(value / 1000).toFixed(1)}K` : String(value)
}

export function formatMinSec(totalSeconds: number) {
  if (isNaN(totalSeconds)) return '0s'

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const padTo2Digits = (value: number) => value.toString().padStart(2, '0')
  return `${minutes ? `${minutes}m` : ''} ${padTo2Digits(seconds)}s`
}

export function formatPercentage(value: number) {
  return `${value ? (value * 100).toFixed(2) : '0'}%`
}

export function formatNumber(
  value: number | null | undefined,
  format = '0.[0]a'
) {
  return numeral(value ?? 0).format(format)
}

export function formatBytes(value: number | null | undefined) {
  return formatNumber(value, '0.[0] b')
}

export function formatMilliseconds(ms: number): string {
  if (ms < 1000) return `${formatNumber(ms, '0.[00]a')}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${formatNumber(seconds, '0.[00]a')}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${formatNumber(minutes, '0.[00]a')}m`
  const hours = Math.floor(minutes / 60)
  return `${formatNumber(hours, '0.[00]a')}h`
}

type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never
}[keyof T]

export const maxCellWidth = <T extends Record<string, any>>(
  k: NumericKeys<T>,
  arr: T[]
) => {
  const max = Math.max(...(arr || []).map(p => (p[k!] as number) || 0))
  return max.toLocaleString().length * 8.4
}
