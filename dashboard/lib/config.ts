const config = {
  dashboardURL: process.env.NEXT_PUBLIC_TINYBIRD_DASHBOARD_URL,
  trackerToken: process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN,
  authToken: process.env.NEXT_PUBLIC_TINYBIRD_AUTH_TOKEN,
  host: process.env.NEXT_PUBLIC_TINYBIRD_HOST,
} as const

export default config
