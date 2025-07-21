import { InsightCard } from '@/components/ai-chat/InsightCards'
import { InsightData } from '@/lib/hooks/use-insights-data'

export const createInsightsFromData = (data: InsightData | null): InsightCard[] => {
  if (!data) {
    // Fallback to static data if no real data is available
    return [
      {
        id: 'top-referrers',
        title: 'Top Referrers',
        description: 'Top five referrers in the last 6 days ordered by traffic',
        question: 'What are the top 5 referrers in the last 6 days ordered by traffic?',
        color: 'green'
      },
      {
        id: 'visitors-trend',
        title: 'Visitors Trend',
        description: 'Loading visitors data...',
        question: 'How many visitors did I have in the last 7 days and what is the trend?',
        color: 'purple'
      },
      {
        id: 'pageviews-trend',
        title: 'Pageviews Trend',
        description: 'Loading pageviews data...',
        question: 'How many pageviews did I have in the last 31 days and what is the trend?',
        color: 'orange'
      },
      {
        id: 'bounce-rate',
        title: 'Bounce Rate',
        description: 'Loading bounce rate data...',
        question: 'What is my bounce rate for the last month and how does it compare to previous periods?',
        color: 'green'
      },
      {
        id: 'top-location',
        title: 'Top Location',
        description: 'Loading location data...',
        question: 'Which countries are driving the most traffic and how has this changed recently?',
        color: 'purple'
      },
      {
        id: 'top-browser',
        title: 'Top Browser',
        description: 'Loading browser data...',
        question: 'What are the most popular browsers among my users and how does this vary by time period?',
        color: 'orange'
      }
    ]
  }

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  // Helper function to format percentage
  const formatPercentage = (num: number): string => `${Math.round(num)}%`

  // Helper function to get trend arrow
  const getTrendArrow = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
    }
  }

  return [
    {
      id: 'top-referrers',
      title: 'Top Referrers',
      description: `${data.topReferrers[0]?.referrer || 'Unknown'} is the top referrer with ${formatNumber(data.topReferrers[0]?.visits || 0)} visits`,
      question: 'What are the top 5 referrers in the last 6 days ordered by traffic?',
      color: 'green'
    },
    {
      id: 'visitors-trend',
      title: 'Visitors Trend',
      description: `${formatNumber(data.visitorsTrend.visits)} Visitors ${getTrendArrow(data.visitorsTrend.trend)} ${formatPercentage(data.visitorsTrend.percentage)}`,
      question: 'How many visitors did I have in the last 7 days and what is the trend?',
      color: 'purple'
    },
    {
      id: 'pageviews-trend',
      title: 'Pageviews Trend',
      description: `${formatNumber(data.pageviewsTrend.pageviews)} Pageviews ${getTrendArrow(data.pageviewsTrend.trend)} ${formatPercentage(data.pageviewsTrend.percentage)}`,
      question: 'How many pageviews did I have in the last 31 days and what is the trend?',
      color: 'orange'
    },
    {
      id: 'bounce-rate',
      title: 'Bounce Rate',
      description: `${formatPercentage(data.bounceRate.rate)} Bounce rate ${getTrendArrow(data.bounceRate.trend)} ${formatPercentage(data.bounceRate.percentage)}`,
      question: 'What is my bounce rate for the last month and how does it compare to previous periods?',
      color: 'green'
    },
    {
      id: 'top-location',
      title: 'Top Location',
      description: `${data.topLocation.location} is driving more traffic ${getTrendArrow(data.topLocation.trend)} ${formatPercentage(data.topLocation.percentage)}`,
      question: 'Which countries are driving the most traffic and how has this changed recently?',
      color: 'purple'
    },
    {
      id: 'top-browser',
      title: 'Top Browser',
      description: `${data.topBrowser.browser} is the most popular browser ${getTrendArrow(data.topBrowser.trend)} ${formatPercentage(data.topBrowser.percentage)}`,
      question: 'What are the most popular browsers among my users and how does this vary by time period?',
      color: 'orange'
    }
  ]
} 