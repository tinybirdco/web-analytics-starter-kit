import { useEffect, useState } from 'react'
import { WebVitalCurrent, WebVitalDistribution } from '../types/web-vitals'
import { getConfig } from '../api'

export default function useWebVitalsDirect() {
  const [current, setCurrent] = useState<WebVitalCurrent[]>([])
  const [distribution, setDistribution] = useState<WebVitalDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { host, token } = getConfig()
        const currentUrl = `${host}/v0/pipes/web_vitals_current.json?token=${token}&days=7`
        const distributionUrl = `${host}/v0/pipes/web_vitals_distribution.json?token=${token}&days=7`
        // Fetch current metrics
        console.log('Fetching current metrics from URL:', currentUrl)
        const currentResponse = await fetch(currentUrl)
        if (!currentResponse.ok) {
          throw new Error(`API Error (current): ${currentResponse.status} ${currentResponse.statusText}`)
        }
        const currentResult = await currentResponse.json()
        console.log('Current metrics result:', currentResult)
        if (currentResult.data) {
          setCurrent(currentResult.data)
        } else {
          console.error('Unexpected API response structure for current metrics', currentResult)
        }
        // Fetch distribution data
        console.log('Fetching distribution data from URL:', distributionUrl)
        const distributionResponse = await fetch(distributionUrl)
        if (!distributionResponse.ok) {
          throw new Error(`API Error (distribution): ${distributionResponse.status} ${distributionResponse.statusText}`)
        }
        const distributionResult = await distributionResponse.json()
        console.log('Distribution metrics result:', distributionResult)
        if (distributionResult.data) {
          setDistribution(distributionResult.data)
        } else {
          console.error('Unexpected API response structure for distribution metrics', distributionResult)
        }
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { current, distribution, isLoading: loading, error }
}