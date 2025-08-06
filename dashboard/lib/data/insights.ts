import { InsightCard } from '@/components/ai-chat/InsightCards'
import { InsightData } from '@/lib/hooks/use-insights-data'
import browsers from '@/lib/constants/browsers'
import countries from '@/lib/constants/countries'

export const createInsightsFromData = (
  data: InsightData | null
): InsightCard[] => {
  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // Helper function to format percentage
  const formatPercentage = (num: number): string => `${Math.round(num * 100)}%`

  // Helper function to get trend arrow
  const getTrendArrow = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      case 'stable':
        return '→'
    }
  }

  // Helper function to format browser name
  const formatBrowser = (browserKey: string): string => {
    const key = browserKey.toLowerCase()
    return browsers[key as keyof typeof browsers] || browserKey
  }

  // Helper function to format country name
  const formatCountry = (countryCode: string): string => {
    return countries[countryCode as keyof typeof countries] || countryCode
  }

  return [
    {
      id: 'top-referrers',
      title: 'Top Referrers',
      description: 'Top five referrers in the last 7 days ordered by traffic',
      question:
        'What are the top 5 referrers in the last 7 days ordered by traffic?',
      color: 'green',
      type: 'list',
      isLoading: !data,
    },
    {
      id: 'visitors-trend',
      title: 'Visitors Trend',
      metric: data ? formatNumber(data.visitorsTrend.visits) : undefined,
      subtitle: 'Visitors in the last 7 days',
      description: data 
        ? `${formatNumber(data.visitorsTrend.visits)} Visitors ${getTrendArrow(data.visitorsTrend.trend)} ${formatPercentage(data.visitorsTrend.percentage)}`
        : 'Visitors trend for the last 7 days',
      question:
        'How many visitors did I have in the last 7 days and what is the trend?',
      color: 'purple',
      type: 'metric',
      isLoading: !data,
      delta: data ? data.visitorsTrend.percentage : undefined,
    },
    {
      id: 'pageviews-trend',
      title: 'Pageviews Trend',
      metric: data ? formatNumber(data.pageviewsTrend.pageviews) : undefined,
      subtitle: 'Pageviews in the last 30 days',
      description: data 
        ? `${formatNumber(data.pageviewsTrend.pageviews)} Pageviews ${getTrendArrow(data.pageviewsTrend.trend)} ${formatPercentage(data.pageviewsTrend.percentage)}`
        : 'Pageviews trend for the last 30 days',
      question:
        'How many pageviews did I have in the last 30 days and what is the trend?',
      color: 'orange',
      type: 'metric',
      isLoading: !data,
      delta: data ? data.pageviewsTrend.percentage : undefined,
    },
    {
      id: 'bounce-rate',
      title: 'Bounce Rate',
      metric: data ? formatPercentage(data.bounceRate.rate) : undefined,
      subtitle: 'Bounce rate during the last 30 days',
      description: data 
        ? `${formatPercentage(data.bounceRate.rate)} Bounce rate ${getTrendArrow(data.bounceRate.trend)} ${formatPercentage(data.bounceRate.percentage)}`
        : 'Bounce rate for the last 30 days',
      question:
        'What is my bounce rate for the last 30 days and how does it compare to previous periods?',
      color: 'green',
      type: 'metric',
      isLoading: !data,
      delta: data ? data.bounceRate.percentage : undefined,
    },
    {
      id: 'top-location',
      title: 'Top Location',
      metric: data ? formatCountry(data.topLocation.location) : undefined,
      subtitle: 'is driving more traffic during the last 7 days',
      description: data 
        ? `${formatCountry(data.topLocation.location)} is driving more traffic ${getTrendArrow(data.topLocation.trend)} ${formatPercentage(data.topLocation.percentage)}`
        : 'Top location driving traffic in the last 7 days',
      question:
        'Which countries are driving the most traffic and how has this changed recently?',
      color: 'purple',
      type: 'list',
      isLoading: !data,
      delta: data ? data.topLocation.percentage : undefined,
    },
    {
      id: 'top-browser',
      title: 'Top Browser',
      metric: data ? formatBrowser(data.topBrowser.browser) : undefined,
      subtitle: 'is the most popular browser for your user base',
      description: data 
        ? `${formatBrowser(data.topBrowser.browser)} is the most popular browser ${getTrendArrow(data.topBrowser.trend)} ${formatPercentage(data.topBrowser.percentage)}`
        : 'Most popular browser among your users',
      question:
        'What are the most popular browsers among my users and how does this vary by time period?',
      color: 'orange',
      type: 'list',
      isLoading: !data,
      delta: data ? data.topBrowser.percentage : undefined,
    },
  ]
}
