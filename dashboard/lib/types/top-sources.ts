export type TopSourcesData = {
  referrer: string
  visits: number
}

export type TopSource = {
  referrer: string
  visits: number
  href?: string
}

export type TopSources = {
  data: Array<TopSourcesData>
  refs: string[]
  visits: number[]
}
