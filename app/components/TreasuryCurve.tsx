'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Treasury series codes for yield curve (excluding 3M and 6M for now)
const TREASURY_SERIES = ['DGS1', 'DGS2', 'DGS5', 'DGS7', 'DGS10', 'DGS20', 'DGS30']
const TREASURY_LABELS: Record<string, string> = {
  'DGS1': '1Y',
  'DGS2': '2Y',
  'DGS5': '5Y',
  'DGS7': '7Y',
  'DGS10': '10Y',
  'DGS20': '20Y',
  'DGS30': '30Y'
}

interface CurveChartPoint {
  maturity: string
  curve1: number | null
  curve2: number | null
}

export default function TreasuryCurve() {
  // Full time series per code (from FinData.DATE and VALUE)
  const [seriesData, setSeriesData] = useState<
    Record<string, Array<{ date: string; value: number | null }>>
  >({})
  // Available dates where we have at least one data point
  const [availableDates, setAvailableDates] = useState<string[]>([])
  // Selected dates for the yield curve (primary and optional comparison)
  const [selectedDate1, setSelectedDate1] = useState<string>('')
  const [selectedDate2, setSelectedDate2] = useState<string>('')
  // Data formatted for the chart (one point per maturity, with up to two curves)
  const [chartData, setChartData] = useState<CurveChartPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const CACHE_KEY = 'treasury_curve_data'
    const PROCESSED_CACHE_KEY = 'treasury_curve_processed'
    const CACHE_EXPIRY_MS = 60 * 60 * 1000 // 1 hour cache

    const fetchCurve = async (forceRefresh = false) => {
      // Check processed cache first (much faster - already processed data)
      if (!forceRefresh) {
        try {
          const processedCache = localStorage.getItem(PROCESSED_CACHE_KEY)
          if (processedCache) {
            const { seriesData: cachedSeriesData, availableDates: cachedDates, timestamp } = JSON.parse(processedCache)
            const age = Date.now() - timestamp
            
            if (age < CACHE_EXPIRY_MS && cachedSeriesData && cachedDates) {
              // Use processed cached data - instant load!
              console.log('Treasury Curve - Using processed cached data')
              setSeriesData(cachedSeriesData)
              setAvailableDates(cachedDates)
              
              if (cachedDates.length > 0) {
                setSelectedDate1(prev => prev || cachedDates[0])
              }
              return // Exit early, using processed cache
            }
          }
        } catch (e) {
          console.warn('Treasury Curve - Processed cache read failed:', e)
        }
      }

      // Check raw cache second
      if (!forceRefresh) {
        try {
          const cached = localStorage.getItem(CACHE_KEY)
          if (cached) {
            const { data, timestamp } = JSON.parse(cached)
            const age = Date.now() - timestamp
            
            if (age < CACHE_EXPIRY_MS) {
              // Process cached raw data (faster than fetching)
              console.log('Treasury Curve - Processing cached raw data')
              const newSeriesData: Record<string, Array<{ date: string; value: number | null }>> = {}
              const dateSet = new Set<string>()

              TREASURY_SERIES.forEach(code => {
                const seriesData = data.chartData?.[code] || []
                newSeriesData[code] = (seriesData || []).map((d: { date: string; value: number | null }) => {
                  const isoDate = d.date
                  if (isoDate) {
                    dateSet.add(isoDate)
                  }
                  return { date: isoDate, value: d.value !== null ? Number(d.value) : null }
                })
              })

              const dates = Array.from(dateSet).sort(
                (a, b) => new Date(b).getTime() - new Date(a).getTime()
              )

              // Cache the processed data for even faster future loads
              try {
                localStorage.setItem(PROCESSED_CACHE_KEY, JSON.stringify({
                  seriesData: newSeriesData,
                  availableDates: dates,
                  timestamp: Date.now()
                }))
              } catch (e) {
                console.warn('Treasury Curve - Processed cache write failed:', e)
              }

              setSeriesData(newSeriesData)
              setAvailableDates(dates)

              if (dates.length > 0) {
                setSelectedDate1(prev => prev || dates[0])
              }
              return // Exit early, using cache
            } else {
              console.log('Treasury Curve - Cache expired, fetching fresh data')
            }
          }
        } catch (e) {
          console.warn('Treasury Curve - Cache read failed:', e)
        }
      }

      // Fetch fresh data (limited date range for performance)
      setLoading(true)
      setError(null)
      try {
        // Get last 30 years of data for treasury series
        const codes = TREASURY_SERIES.join(',')
        const today = new Date()
        const endDateStr = today.toISOString().split('T')[0]
        const thirtyYearsAgo = new Date(today)
        thirtyYearsAgo.setFullYear(today.getFullYear() - 30)
        const startDateStr = thirtyYearsAgo.toISOString().split('T')[0]

        const response = await fetch(
          `/api/report/series?codes=${codes}&startDate=${startDateStr}&endDate=${endDateStr}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch treasury data')
        }
        
        const data = await response.json()
        
        // Store raw series data keyed by code
        const newSeriesData: Record<string, Array<{ date: string; value: number | null }>> = {}
        const dateSet = new Set<string>()

        TREASURY_SERIES.forEach(code => {
          const seriesData = data.chartData?.[code] || []
          
          newSeriesData[code] = (seriesData || []).map((d: { date: string; value: number | null }) => {
            // Ensure we use the DATE column from FinData, passed through the API
            const isoDate = d.date
            if (isoDate) {
              dateSet.add(isoDate)
            }
            return { date: isoDate, value: d.value !== null ? Number(d.value) : null }
          })
        })
        
        // Build sorted list of available dates (most recent first)
        const dates = Array.from(dateSet).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        )

        // Cache both raw and processed data
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }))
          localStorage.setItem(PROCESSED_CACHE_KEY, JSON.stringify({
            seriesData: newSeriesData,
            availableDates: dates,
            timestamp: Date.now()
          }))
          console.log('Treasury Curve - Data cached (raw and processed)')
        } catch (e) {
          console.warn('Treasury Curve - Cache write failed:', e)
        }

        setSeriesData(newSeriesData)
        setAvailableDates(dates)

        // Default selection: most recent date as primary, no comparison initially
        if (dates.length > 0) {
          setSelectedDate1(prev => prev || dates[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setSeriesData({})
        setAvailableDates([])
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCurve()

    // Listen for refresh events
    const handleRefresh = () => {
      fetchCurve(true) // Force refresh
    }
    
    window.addEventListener('dataRefresh', handleRefresh)
    
    return () => {
      window.removeEventListener('dataRefresh', handleRefresh)
    }
  }, [])

  // Recompute chart data whenever selected dates or series data change
  useEffect(() => {
    if (!selectedDate1 || Object.keys(seriesData).length === 0) {
      setChartData([])
      return
    }

    const buildValueForDate = (code: string, date: string): number | null => {
      const series = seriesData[code] || []
      const match = series.find(p => p.date === date)
      return match && match.value !== null && !isNaN(Number(match.value))
        ? Number(match.value)
        : null
    }

    const points: CurveChartPoint[] = TREASURY_SERIES.map(code => {
      const label = TREASURY_LABELS[code]
      const value1 = buildValueForDate(code, selectedDate1)
      const value2 = selectedDate2 ? buildValueForDate(code, selectedDate2) : null

      return {
        maturity: label,
        curve1: value1,
        curve2: value2,
      }
    })

    setChartData(points)
  }, [selectedDate1, selectedDate2, seriesData])

  if (loading) {
    return (
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', background: 'white', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>Treasury Yield Curve</h3>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', background: 'white', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>Treasury Yield Curve</h3>
        <div style={{ padding: '20px', color: '#c33' }}>Error: {error}</div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', background: 'white', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>Treasury Yield Curve</h3>
        <div style={{ padding: '20px', color: '#666' }}>
          No treasury data available. Check browser console for details.
        </div>
      </div>
    )
  }

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      background: 'white',
      marginBottom: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      <h3 style={{
        fontSize: '18px',
        marginBottom: '12px',
        fontWeight: '600',
        color: '#1e293b'
      }}>
        Treasury Yield Curve
      </h3>

      {/* Yield curve date selectors */}
      <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Yield Curve Dates:</span>
        <label style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Primary:{' '}
          <input
            type="date"
            value={selectedDate1}
            onChange={(e) => {
              const date = e.target.value
              // Check if date exists in available dates, or find closest
              if (availableDates.includes(date)) {
                setSelectedDate1(date)
              } else {
                // Find closest available date
                const closest = availableDates.find(d => d <= date) || availableDates[availableDates.length - 1]
                if (closest) setSelectedDate1(closest)
              }
            }}
            min={availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined}
            max={availableDates.length > 0 ? availableDates[0] : undefined}
            style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
          />
          {selectedDate1 && !availableDates.includes(selectedDate1) && (
            <span style={{ fontSize: '10px', color: '#f59e0b' }}>(closest: {new Date(availableDates.find(d => d <= selectedDate1) || availableDates[0] || '').toLocaleDateString()})</span>
          )}
        </label>
        <label style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Compare:{' '}
          <input
            type="date"
            value={selectedDate2}
            onChange={(e) => {
              const date = e.target.value
              if (!date) {
                setSelectedDate2('')
              } else if (availableDates.includes(date)) {
                setSelectedDate2(date)
              } else {
                // Find closest available date
                const closest = availableDates.find(d => d <= date) || availableDates[availableDates.length - 1]
                if (closest) setSelectedDate2(closest)
              }
            }}
            min={availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined}
            max={availableDates.length > 0 ? availableDates[0] : undefined}
            style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
          />
          {selectedDate2 && !availableDates.includes(selectedDate2) && (
            <span style={{ fontSize: '10px', color: '#f59e0b' }}>(closest: {new Date(availableDates.find(d => d <= selectedDate2) || availableDates[0] || '').toLocaleDateString()})</span>
          )}
          {selectedDate2 && (
            <button
              onClick={() => setSelectedDate2('')}
              style={{ fontSize: '10px', padding: '2px 6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </label>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart 
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="maturity" 
            tick={{ fontSize: 11, fill: '#475569', fontWeight: '500' }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1' }}
            height={50}
            interval={0}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
            width={60}
            axisLine={{ stroke: '#cbd5e1' }}
            label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft', style: { fill: '#475569' } }}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelFormatter={(label) => `Maturity: ${label}`}
            formatter={(value: number) => {
              if (value === null || value === undefined || isNaN(value)) return 'N/A'
              return `${Number(value).toFixed(2)}%`
            }}
          />
          {selectedDate1 && (
            <Line 
              type="monotone" 
              dataKey="curve1" 
              name={new Date(selectedDate1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              stroke="#00bcd4" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#00bcd4', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, fill: '#00acc1' }}
              connectNulls={false}
              isAnimationActive={true}
            />
          )}
          {selectedDate2 && (
            <Line 
              type="monotone" 
              dataKey="curve2" 
              name={new Date(selectedDate2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#ea580c' }}
              connectNulls={false}
              isAnimationActive={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: '500', marginBottom: '4px' }}>
          Yields for selected dates:
        </p>
        <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
          {TREASURY_SERIES.map(code => {
            const label = TREASURY_LABELS[code]
            const point = chartData.find(p => p.maturity === label)

            const parts: string[] = []
            if (selectedDate1) {
              if (point && point.curve1 !== null) {
                parts.push(
                  `${point.curve1.toFixed(2)}% @ ${new Date(selectedDate1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                )
              } else {
                parts.push(`N/A @ ${new Date(selectedDate1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
              }
            }
            if (selectedDate2) {
              if (point && point.curve2 !== null) {
                parts.push(
                  `${point.curve2.toFixed(2)}% @ ${new Date(selectedDate2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                )
              } else {
                parts.push(`N/A @ ${new Date(selectedDate2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`)
              }
            }

            return (
              <div key={label} style={{ marginBottom: '2px' }}>
                <strong>{label}</strong>: {parts.join('  |  ') || 'N/A'}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}