const config = {
  dashboardURL: process.env.NEXT_PUBLIC_TINYBIRD_DASHBOARD_URL as string,
  trackerToken: process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN as string,
  tenantId: process.env.TENANT_ID as string,
} as const

export default config
