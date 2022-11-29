export type TopSource = {
  referrer: string
  visits: number
  href?: string
}

export type TopSources = {
  data: Array<TopSource>
  refs: string[]
  visits: number[]
}
