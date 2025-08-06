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
    previousVisits: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  pageviewsTrend: {
    pageviews: number
    previousPageviews: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  bounceRate: {
    rate: number
    previousRate: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  topLocation: {
    location: string
    visits: number
    previousVisits: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
  topBrowser: {
    browser: string
    visits: number
    previousVisits: number
    trend: 'up' | 'down' | 'stable'
    percentage: number
  }
}

export function useInsightsData() {
  const { value: timeRange } = useTimeRange()
  
  // Get hardcoded date ranges for each insight type
  const getVisitorsDateRange = () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return {
      date_from: sevenDaysAgo.toISOString().split('T')[0],
      date_to: yesterday.toISOString().split('T')[0]
    }
  }
  
  const getPageviewsDateRange = () => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return {
      date_from: thirtyDaysAgo.toISOString().split('T')[0],
      date_to: yesterday.toISOString().split('T')[0]
    }
  }
  
  const getBounceRateDateRange = () => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return {
      date_from: thirtyDaysAgo.toISOString().split('T')[0],
      date_to: yesterday.toISOString().split('T')[0]
    }
  }
  
  const getOtherInsightsDateRange = () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return {
      date_from: sevenDaysAgo.toISOString().split('T')[0],
      date_to: yesterday.toISOString().split('T')[0]
    }
  }
  
  const visitorsDateRange = getVisitorsDateRange()
  const pageviewsDateRange = getPageviewsDateRange()
  const bounceRateDateRange = getBounceRateDateRange()
  const otherInsightsDateRange = getOtherInsightsDateRange()
  
  // Fetch data for each insight with their specific date ranges
  const { data: visitorsData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    visitorsDateRange
  )
  
  const { data: pageviewsData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    pageviewsDateRange
  )
  
  const { data: bounceRateData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    bounceRateDateRange
  )
  
  const { data: topSourcesData } = useEndpoint<{ referrer: string; visits: number; hits: number }[]>(
    'top_sources',
    { ...otherInsightsDateRange, limit: 5 }
  )
  
  const { data: topLocationsData } = useEndpoint<{ location: string; visits: number; hits: number }[]>(
    'top_locations',
    { ...otherInsightsDateRange, limit: 5 }
  )
  
  const { data: topBrowsersData } = useEndpoint<{ browser: string; visits: number; hits: number }[]>(
    'top_browsers',
    { ...otherInsightsDateRange, limit: 5 }
  )

  // Calculate trends by comparing with previous period
  const getPreviousPeriod = (dateRange: { date_from: string; date_to: string }) => {
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

  const prevVisitorsDateRange = getPreviousPeriod(visitorsDateRange)
  const prevPageviewsDateRange = getPreviousPeriod(pageviewsDateRange)
  const prevBounceRateDateRange = getPreviousPeriod(bounceRateDateRange)
  
  const { data: prevVisitorsData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    prevVisitorsDateRange
  )
  
  const { data: prevPageviewsData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    prevPageviewsDateRange
  )
  
  const { data: prevBounceRateData } = useEndpoint<{ visits: number; pageviews: number; bounce_rate: number }[]>(
    'kpis',
    prevBounceRateDateRange
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
    if (!visitorsData || !pageviewsData || !bounceRateData || !topSourcesData || !topLocationsData || !topBrowsersData || !prevVisitorsData || !prevPageviewsData || !prevBounceRateData) {
      return null
    }

    // Calculate totals for current period
    const currentVisits = visitorsData.reduce((sum, day) => sum + day.visits, 0)
    const currentPageviews = pageviewsData.reduce((sum, day) => sum + day.pageviews, 0)
    const currentBounceRate = bounceRateData.reduce((sum, day) => sum + day.bounce_rate, 0) / bounceRateData.length

    // Calculate totals for previous period
    const prevVisits = prevVisitorsData?.reduce((sum, day) => sum + day.visits, 0) || 0
    const prevPageviews = prevPageviewsData?.reduce((sum, day) => sum + day.pageviews, 0) || 0
    const prevBounceRate = prevBounceRateData?.reduce((sum, day) => sum + day.bounce_rate, 0) / (prevBounceRateData?.length || 1) || 0

    return {
      topReferrers: topSourcesData.slice(0, 5),
      visitorsTrend: {
        visits: currentVisits,
        previousVisits: prevVisits,
        ...calculateTrend(currentVisits, prevVisits)
      },
      pageviewsTrend: {
        pageviews: currentPageviews,
        previousPageviews: prevPageviews,
        ...calculateTrend(currentPageviews, prevPageviews)
      },
      bounceRate: {
        rate: currentBounceRate,
        previousRate: prevBounceRate,
        ...calculateTrend(prevBounceRate, currentBounceRate) // Inverted because lower bounce rate is better
      },
      topLocation: {
        location: topLocationsData[0]?.location || 'Unknown',
        visits: topLocationsData[0]?.visits || 0,
        previousVisits: 0, // TODO: Add previous period data for locations
        trend: 'up', // Default trend
        percentage: 0
      },
      topBrowser: {
        browser: topBrowsersData[0]?.browser || 'Unknown',
        visits: topBrowsersData[0]?.visits || 0,
        previousVisits: 0, // TODO: Add previous period data for browsers
        trend: 'up', // Default trend
        percentage: 0
      }
    }
  }

  return {
    data: formatInsightsData(),
    isLoading: !visitorsData || !pageviewsData || !bounceRateData || !topSourcesData || !topLocationsData || !topBrowsersData || !prevVisitorsData || !prevPageviewsData || !prevBounceRateData
  }
} 