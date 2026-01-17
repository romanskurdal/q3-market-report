'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartCardProps {
  title: string
  data: Array<{ date: string; value: number | null }>
  color: string
  latestValue?: number | null
  latestDate?: string
  change?: number | null
}

export default function ChartCard({ title, data, color, latestValue, latestDate, change }: ChartCardProps) {
  const formatValue = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A'
    return typeof value === 'number' ? value.toFixed(2) : 'N/A'
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: '1.4'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          {latestValue !== null && latestValue !== undefined && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                {formatValue(latestValue)}
              </span>
              {change !== null && change !== undefined && (
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: change >= 0 ? '#10b981' : '#ef4444'
                }}>
                  {change >= 0 ? '+' : ''}{formatValue(change)}
                </span>
              )}
            </div>
          )}
          {latestDate && (
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              as of {formatDate(latestDate)}
            </span>
          )}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
            tickFormatter={(value) => {
              try {
                const d = new Date(value)
                return `${d.getMonth() + 1}/${d.getDate()}`
              } catch {
                return value
              }
            }}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={{ stroke: '#cbd5e1' }}
            width={60}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip
            contentStyle={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelFormatter={(value) => {
              try {
                return new Date(value).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })
              } catch {
                return value
              }
            }}
            formatter={(value: number) => {
              if (value === null || value === undefined) return 'N/A'
              return [typeof value === 'number' ? value.toFixed(2) : value, 'Value']
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: color }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}