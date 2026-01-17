'use client'

import React, { useState, useEffect } from 'react'
import ChartCard from './ChartCard'
import FilterBar from './FilterBar'
import SectionHeader from './SectionHeader'
import DataTable from './DataTable'
import TreasuryCurve from './TreasuryCurve'
import { theme } from '../theme'

interface SeriesData {
  date: string
  value: number | null
}

interface ReportSectionProps {
  title: string
  description: string
  codes: string[]
  defaultStartDate: string
  defaultEndDate: string
  adminMode: boolean
  onEdit?: () => void
}

export default function ReportSection({ title, description, codes, defaultStartDate, defaultEndDate, adminMode, onEdit }: ReportSectionProps) {
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<Record<string, SeriesData[]>>({})
  const [tableData, setTableData] = useState<Record<string, string | number | null>[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/report/series?codes=${codes.join(',')}&startDate=${startDate}&endDate=${endDate}`
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch data')
        }
        const data = await response.json()
        setChartData(data.chartData || {})
        setTableData(data.tableData || [])
        setDescriptions(data.descriptions || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setChartData({})
        setTableData([])
        setDescriptions({})
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [startDate, endDate, codes.join(',')])

  const applyPreset = (preset: string) => {
    const today = new Date()
    const end = today.toISOString().split('T')[0]
    let start: Date

    switch (preset) {
      case '1M':
        start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
        break
      case '3M':
        start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
        break
      case 'YTD':
        start = new Date(today.getFullYear(), 0, 1)
        break
      case '1Y':
        start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
        break
      case '5Y':
        start = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
        break
      case 'Max':
        start = new Date(2000, 0, 1)
        break
      default:
        return
    }
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end)
  }

  // Get chart colors based on section
  const getChartColor = (index: number) => {
    if (title === 'Equities') {
      return theme.chartColors.equities[index % theme.chartColors.equities.length]
    } else if (title === 'Fixed Income') {
      return theme.chartColors.fixedIncome[index % theme.chartColors.fixedIncome.length]
    } else {
      return theme.chartColors.economic[index % theme.chartColors.economic.length]
    }
  }

  // Calculate latest value and change for each series
  const getLatestValue = (seriesData: SeriesData[]) => {
    if (!seriesData || seriesData.length === 0) return null
    const sorted = [...seriesData].filter(d => d.value !== null).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0]?.value ?? null
  }

  const getLatestDate = (seriesData: SeriesData[]) => {
    if (!seriesData || seriesData.length === 0) return undefined
    const sorted = [...seriesData].filter(d => d.value !== null).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0]?.date
  }

  const getChange = (seriesData: SeriesData[]) => {
    if (!seriesData || seriesData.length < 2) return null
    const sorted = [...seriesData].filter(d => d.value !== null).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    if (sorted.length < 2) return null
    const latest = sorted[0]?.value
    const oldest = sorted[sorted.length - 1]?.value
    if (latest === null || oldest === null || typeof latest !== 'number' || typeof oldest !== 'number') return null
    return latest - oldest
  }

  const handleDownloadCSV = () => {
    const columns = ['Date', ...codes.map(c => descriptions[c] || c)]
    const rows = tableData.map(row => [
      row.date ? new Date(row.date as string).toLocaleDateString() : '',
      ...codes.map(c => row[c] !== null && row[c] !== undefined ? String(row[c]) : '')
    ])
    
    const csvContent = [
      columns.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <section style={{ marginBottom: '48px' }}>
      <SectionHeader
        title={title}
        description={description}
        onEdit={onEdit}
        showEdit={adminMode}
      />

      <div style={{ marginBottom: '24px' }}>
        <FilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onPresetClick={applyPreset}
        />
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: theme.colors.neutral[600],
          background: 'white',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.neutral[200]}`
        }}>
          Loading...
        </div>
      )}
      
      {error && (
        <div style={{
          padding: '20px',
          background: '#fef2f2',
          color: theme.colors.error,
          borderRadius: '12px',
          border: `1px solid #fecaca`,
          marginBottom: '24px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Treasury Curve (only for Fixed Income) */}
      {title === 'Fixed Income' && !loading && !error && <TreasuryCurve />}

      {/* Charts Grid */}
      {!loading && !error && Object.keys(chartData).length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: codes.length === 6 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {codes.map((code, index) => {
            const seriesData = chartData[code] || []
            const description = descriptions[code] || code
            const latestValue = getLatestValue(seriesData)
            const latestDate = getLatestDate(seriesData)
            const change = getChange(seriesData)
            const color = getChartColor(index)
            
            return (
              <ChartCard
                key={code}
                title={description}
                data={seriesData}
                color={color}
                latestValue={latestValue}
                latestDate={latestDate}
                change={change}
              />
            )
          })}
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && tableData.length > 0 && (
        <DataTable
          data={tableData}
          columns={codes.map(code => ({ code, label: descriptions[code] || code }))}
          onDownloadCSV={handleDownloadCSV}
          title={title}
        />
      )}
    </section>
  )
}