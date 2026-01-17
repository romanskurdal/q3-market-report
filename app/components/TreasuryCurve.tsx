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

interface TreasuryPoint {
  maturity: string
  value: number | null
}

export default function TreasuryCurve() {
  const [curveData, setCurveData] = useState<TreasuryPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurve = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get latest values for treasury series
        const codes = TREASURY_SERIES.join(',')
        const response = await fetch(`/api/report/series?codes=${codes}&startDate=1900-01-01&endDate=2099-12-31`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch treasury data')
        }
        
        const data = await response.json()
        
        // Debug: log what we received
        console.log('Treasury Curve - Data received:', {
          chartDataKeys: Object.keys(data.chartData || {}),
          descriptions: data.descriptions
        })
        
        // Extract the latest value for each series and sort by maturity order
        const maturityOrder: Record<string, number> = {
          '1Y': 0,
          '2Y': 1,
          '5Y': 2,
          '7Y': 3,
          '10Y': 4,
          '20Y': 5,
          '30Y': 6
        }
        
        const points: TreasuryPoint[] = []
        
        TREASURY_SERIES.forEach(code => {
          const seriesData = data.chartData?.[code] || []
          
          console.log(`Treasury Curve - ${code}:`, {
            hasData: seriesData.length > 0,
            dataLength: seriesData.length,
            firstFew: seriesData.slice(0, 3)
          })
          
          if (seriesData.length > 0) {
            // Get the most recent non-null value
            const validData = seriesData.filter((d: { value: number | null }) => 
              d.value !== null && d.value !== undefined && !isNaN(Number(d.value))
            )
            
            if (validData.length > 0) {
              const latestValue = validData
                .sort((a: { date: string }, b: { date: string }) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0]?.value
              
              if (latestValue !== null && latestValue !== undefined) {
                const label = TREASURY_LABELS[code] || code
                const order = maturityOrder[label] ?? 999
                
                // Add each maturity point (no duplicates)
                if (!points.find(p => p.maturity === label)) {
                  points.push({
                    maturity: label,
                    value: Number(latestValue),
                    order
                  })
                  console.log(`Treasury Curve - Added ${label}: ${latestValue}`)
                }
              }
            }
          } else {
            console.warn(`Treasury Curve - No data found for ${code}`)
          }
        })
        
        console.log('Treasury Curve - All points before sorting:', points)
        
        // Sort by maturity order and remove the order property
        const sortedPoints = points
          .sort((a, b) => (a as any).order - (b as any).order)
          .map(({ order, ...point }) => point)
        
        console.log('Treasury Curve - Final sorted points:', sortedPoints)
        
        setCurveData(sortedPoints)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setCurveData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCurve()
  }, [])

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

  if (curveData.length === 0) {
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
        marginBottom: '16px',
        fontWeight: '600',
        color: '#1e293b'
      }}>
        Treasury Yield Curve
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart 
          data={curveData}
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
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#00bcd4" 
            strokeWidth={3}
            dot={{ r: 6, fill: '#00bcd4', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, fill: '#00acc1' }}
            connectNulls={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: '500' }}>
          Latest available yields: {curveData.length > 0 
            ? curveData.map(p => `${p.maturity} ${p.value?.toFixed(2)}%`).join(' • ')
            : 'No data available'}
        </p>
        {curveData.length < TREASURY_SERIES.length && (
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Note: {TREASURY_SERIES.length - curveData.length} series not available in database
          </p>
        )}
      </div>
    </div>
  )
}