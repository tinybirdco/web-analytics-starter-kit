import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  Bold,
} from '@tremor/react'
// Removed icon imports to fix rendering issue
import useWebVitalsDirect from '../lib/hooks/use-web-vitals-direct'
import { WebVitalCurrent, WebVitalDistribution, WebVitalRoute } from '../lib/types/web-vitals'

export default function WebVitals() {
  const { current, distribution, isLoading, error } = useWebVitalsDirect()
  
  console.log('Web Vitals Data:', { current, error })

  if (isLoading || error || !current?.length) {
    return (
      <Card className="mt-6">
        <Title>Web Vitals</Title>
        <Text>{error ? `Error loading web vitals: ${error.message}` : 'Loading web vitals data...'}</Text>
      </Card>
    )
  }

  // Group distribution data by metric
  const distributionByMetric = (distribution || []).reduce<
    Record<string, WebVitalDistribution[]>
  >((acc, item) => {
    if (!acc[item.metric_name]) {
      acc[item.metric_name] = []
    }
    acc[item.metric_name].push(item)
    return acc
  }, {})

  // Calculate overall score for each metric
  const metricScores = current.reduce<Record<string, number>>((acc, item) => {
    acc[item.metric_name] = item.score
    return acc
  }, {})

  const formattedMetricNames = {
    LCP: 'Largest Contentful Paint',
    TTFB: 'Time to First Byte',
    FCP: 'First Contentful Paint',
    INP: 'Interaction to Next Paint',
    CLS: 'Cumulative Layout Shift',
  }

  const statusColors = {
    Excellent: 'emerald',
    Good: 'amber',
    Poor: 'rose',
  }

  const getValueWithUnits = (metric: WebVitalCurrent) => {
    if (metric.metric_name === 'CLS') {
      return metric.avg_value.toFixed(2)
    }
    return `${Math.round(metric.avg_value)}ms`
  }

  // Calculate overall score as average of all metric scores
  const overallScore = current.length > 0
    ? Math.round(current.reduce((sum, metric) => sum + metric.score, 0) / current.length)
    : 0
  
  // Sort metrics in a consistent order
  const sortedMetrics = [...current].sort((a, b) => {
    const order = ['LCP', 'FCP', 'TTFB', 'INP', 'CLS']
    return order.indexOf(a.metric_name) - order.indexOf(b.metric_name)
  })

  // Prepare donut chart data for each metric
  const getDistributionData = (metricName: string) => {
    const data = distributionByMetric[metricName] || []
    return [
      { name: 'Excellent', value: data.find(d => d.performance_category === 'excellent')?.percentage || 0 },
      { name: 'Good', value: data.find(d => d.performance_category === 'good')?.percentage || 0 },
      { name: 'Poor', value: data.find(d => d.performance_category === 'poor')?.percentage || 0 }
    ]
  }

  return (
    <Card className="mt-6 p-5">
      <div className="flex justify-between items-center mb-3">
        <Title>Web Vitals Overview</Title>
      </div>
      
      {/* All metrics in a single row with donut charts */}
      <div className="flex items-center">
        {/* Overall Score */}
        <div className="flex flex-col items-center w-[15%] mr-4">
          <Text className="font-medium">Overall</Text>
          <Metric className="text-lg mt-1">{overallScore}</Metric>
        </div>
        
        
        {/* Individual Metrics */}
        <div className="flex justify-between w-full">
          {sortedMetrics.map((metric) => {
            const scoreColor = 
              metric.status === 'Excellent' ? 'text-emerald-500' : 
              metric.status === 'Good' ? 'text-amber-500' : 'text-rose-500'
            
            return (
              <div key={metric.metric_name} className="flex flex-col items-center">
                <div className="group relative">
                  <Text className="font-medium cursor-help">{metric.metric_name}</Text>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <p className="font-semibold mb-1">{formattedMetricNames[metric.metric_name as keyof typeof formattedMetricNames]}</p>
                    <p className="mb-1">{metric.description}</p>
                    <p>Thresholds: {metric.thresholds}</p>
                  </div>
                </div>
                <Text className="text-xs mt-0.5">{getValueWithUnits(metric)}</Text>
                
                <div className="flex flex-col items-center">
                  <div className="mt-1 relative group">
                    <svg width="48" height="48" viewBox="0 0 48 48" className="cursor-help">
                      {/* Background circle */}
                      <circle cx="24" cy="24" r="20" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                      
                      {/* Get distribution data */}
                      {(() => {
                        const data = getDistributionData(metric.metric_name);
                        const excellent = data[0].value;
                        const good = data[1].value;
                        const poor = data[2].value;
                        
                        
                        // Calculate segment angles
                        const excellentAngle = excellent * 3.6; // 3.6 = 360/100
                        const goodAngle = good * 3.6;
                        const poorAngle = poor * 3.6;
                        
                        // Calculate paths
                        const segments = [];
                        
                        // Only add segments with non-zero values
                        let currentAngle = 0;
                        
                        if (excellent > 0) {
                          const x1 = 24 + 20 * Math.sin(0);
                          const y1 = 24 - 20 * Math.cos(0);
                          const rad = (excellentAngle * Math.PI) / 180;
                          const x2 = 24 + 20 * Math.sin(rad);
                          const y2 = 24 - 20 * Math.cos(rad);
                          const largeArc = excellentAngle > 180 ? 1 : 0;
                          
                          segments.push(
                            <path 
                              key="excellent"
                              d={`M 24 24 L ${x1} ${y1} A 20 20 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill="#10b981" 
                            />
                          );
                          currentAngle += excellentAngle;
                        }
                        
                        if (good > 0) {
                          const rad1 = (currentAngle * Math.PI) / 180;
                          const x1 = 24 + 20 * Math.sin(rad1);
                          const y1 = 24 - 20 * Math.cos(rad1);
                          const rad2 = ((currentAngle + goodAngle) * Math.PI) / 180;
                          const x2 = 24 + 20 * Math.sin(rad2);
                          const y2 = 24 - 20 * Math.cos(rad2);
                          const largeArc = goodAngle > 180 ? 1 : 0;
                          
                          segments.push(
                            <path 
                              key="good"
                              d={`M 24 24 L ${x1} ${y1} A 20 20 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill="#f59e0b" 
                            />
                          );
                          currentAngle += goodAngle;
                        }
                        
                        if (poor > 0) {
                          const rad1 = (currentAngle * Math.PI) / 180;
                          const x1 = 24 + 20 * Math.sin(rad1);
                          const y1 = 24 - 20 * Math.cos(rad1);
                          const rad2 = ((currentAngle + poorAngle) * Math.PI) / 180;
                          const x2 = 24 + 20 * Math.sin(rad2);
                          const y2 = 24 - 20 * Math.cos(rad2);
                          const largeArc = poorAngle > 180 ? 1 : 0;
                          
                          segments.push(
                            <path 
                              key="poor"
                              d={`M 24 24 L ${x1} ${y1} A 20 20 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill="#ef4444" 
                            />
                          );
                        }
                        
                        return segments;
                      })()}
                      
                      {/* Inner circle with score */}
                      <circle cx="24" cy="24" r="12" fill="white" />
                      
                      {/* Score text directly in SVG */}
                      <text 
                        x="24" 
                        y="24" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        className={scoreColor}
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                      >
                        {metric.score}
                      </text>
                    </svg>
                    
                    {/* Tooltip for chart */}
                    {(() => {
                      const distributionData = getDistributionData(metric.metric_name);
                      const excellentData = distributionByMetric[metric.metric_name]?.find(d => d.performance_category === 'excellent');
                      const goodData = distributionByMetric[metric.metric_name]?.find(d => d.performance_category === 'good');
                      const poorData = distributionByMetric[metric.metric_name]?.find(d => d.performance_category === 'poor');
                      
                      return (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                          <p className="font-semibold mb-1">Performance Distribution</p>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-emerald-500 mr-2"></div>
                            <span>Excellent: {distributionData[0].value.toFixed(1)}% ({excellentData?.measurement_count || 0} measurements)</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-amber-500 mr-2"></div>
                            <span>Good: {distributionData[1].value.toFixed(1)}% ({goodData?.measurement_count || 0} measurements)</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <div className="w-3 h-3 bg-rose-500 mr-2"></div>
                            <span>Poor: {distributionData[2].value.toFixed(1)}% ({poorData?.measurement_count || 0} measurements)</span>
                          </div>
                          <div className="mt-1 pt-1 border-t border-gray-700">
                            <p>Overall score: {metric.score}/100</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}