export type TopSource = {
  referrer?: string
  utm_filter?: string
  visits: number
  href?: string
}

export type TopSources = {
  data: TopSource[]
  refs: string[]
  visits: number[]
}

export enum UTMFilter {
  All = 'all',
  Source = 'utm_source',
  Medium = 'utm_medium',
  Campaign = 'utm_campaign',
  Term = 'utm_term',
  Content = 'utm_content',
}
