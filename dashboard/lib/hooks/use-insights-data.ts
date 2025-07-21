import { useEndpoint } from './use-endpoint'
import { useTimeRange } from './use-time-range'

export interface InsightData {
  topReferrers: {
    referrer: string
    visits: number
    hits: number
  }[]
  visitorsTrend: {
    visits: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  pageviewsTrend: {
    pageviews: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  bounceRate: {
    rate: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  topLocation: {
    location: string
    visits: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  topBrowser: {
    browser: string
    visits: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
}

export function useInsightsData() {
  const { value: timeRange } = useTimeRange()
  
  // Parse time range to get date_from and date_to
  const getDateRange = () => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    switch (timeRange) {
      case '7d':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          date_from: sevenDaysAgo.toISOString().split('T')[0],
          date_to: today
        }
      case '30d':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return {
          date_from: thirtyDaysAgo.toISOString().split('T')[0],
          date_to: today
        }
      case '90d':
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        return {
          date_from: ninetyDaysAgo.toISOString().split('T')[0],
          date_to: today
        }
      default:
        return {
          date_from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_to: today
        }
    }
  }

  const dateRange = getDateRange()
  
  // Fetch data for each insight
  const { data: kpisData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    dateRange
  )
  
  const { data: topSourcesData } = useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
    'top_sources',
    { ...dateRange, limit: 5 }
  )
  
  const { data: topLocationsData } = useEndpoint<{ location: string; visits: number; hits: number }[]>(
    'top_locations',
    { ...dateRange, limit: 5 }
  )
  
  const { data: topBrowsersData } = useEndpoint<{ browser: string; visits: number; hits: number }[]>(
    'top_browsers',
    { ...dateRange, limit: 5 }
  )

  // Calculate trends by comparing with previous period
  const getPreviousPeriod = () => {
    const { date_from, date_to } = dateRange
    const fromDate = new Date(date_from)
    const toDate = new Date(date_to)
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const prevToDate = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000)
    const prevFromDate = new Date(prevToDate.getTime() - daysDiff * 24 * 60 * 60 * 1000)
    
    return {
      date_from: prevFromDate.toISOString().split('T')[0],
      date_to: prevToDate.toISOString().split('T')[0]
    }
  }

  const prevDateRange = getPreviousPeriod()
  
  const { data: prevKpisData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    prevDateRange
  )

  // Helper function to calculate trend
  const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'stable'; percentage: number } => {
    if (previous === 0) return { trend: 'stable', percentage: 0 }
    
    const percentage = ((current - previous) / previous) * 100
    const absPercentage = Math.abs(percentage)
    
    if (absPercentage < 5) return { trend: 'stable', percentage: Math.round(percentage) }
    return { 
      trend: percentage > 0 ? 'up' : 'down', 
      percentage: Math.round(absPercentage) 
    }
  }

  // Format the data for insights
  const formatInsightsData = (): InsightData | null => {
    if (!kpisData || !topSourcesData || !topLocationsData || !topBrowsersData || !prevKpisData) {
      return null
    }

    // Calculate totals for current period
    const currentVisits = kpisData.reduce((sum, day) => sum + day.visits, 0)
    const currentPageviews = kpisData.reduce((sum, day) => sum + day.pageviews, 0)
    const currentBounceRate = kpisData.reduce((sum, day) => sum + day.bounce_rate, 0) / kpisData.length

    // Calculate totals for previous period
    const prevVisits = prevKpisData?.reduce((sum, day) => sum + day.visits, 0) || 0
    const prevPageviews = prevKpisData?.reduce((sum, day) => sum + day.pageviews, 0) || 0
    const prevBounceRate = prevKpisData?.reduce((sum, day) => sum + day.bounce_rate, 0) / (prevKpisData?.length || 1) || 0

    return {
      topReferrers: topSourcesData.slice(0, 5),
      visitorsTrend: {
        visits: currentVisits,
        ...calculateTrend(currentVisits, prevVisits)
      },
      pageviewsTrend: {
        pageviews: currentPageviews,
        ...calculateTrend(currentPageviews, prevPageviews)
      },
      bounceRate: {
        rate: currentBounceRate,
        ...calculateTrend(prevBounceRate, currentBounceRate) // Inverted because lower bounce rate is better
      },
      topLocation: {
        location: topLocationsData[0]?.location || 'Unknown',
        visits: topLocationsData[0]?.visits || 0,
        trend: 'up', // Default trend
        percentage: 0
      },
      topBrowser: {
        browser: topBrowsersData[0]?.browser || 'Unknown',
        visits: topBrowsersData[0]?.visits || 0,
        trend: 'up', // Default trend
        percentage: 0
      }
    }
  }

  return {
    data: formatInsightsData(),
    isLoading: !kpisData || !topSourcesData || !topLocationsData || !topBrowsersData || !prevKpisData
  }
} 