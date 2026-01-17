'use client'

import React from 'react'

interface FilterBarProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onPresetClick: (preset: string) => void
}

export default function FilterBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetClick
}: FilterBarProps) {
  const presets = ['1M', '3M', 'YTD', '1Y', '5Y', 'Max']

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      padding: '12px 16px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      <label style={{ fontSize: '14px', fontWeight: '500', color: '#475569', whiteSpace: 'nowrap' }}>
        Date Range:
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        style={{
          padding: '6px 10px',
          fontSize: '14px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          background: 'white',
          color: '#1e293b',
          outline: 'none',
          transition: 'all 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#2196f3'
          e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#cbd5e1'
          e.target.style.boxShadow = 'none'
        }}
      />
      <span style={{ color: '#64748b', fontSize: '14px' }}>to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        style={{
          padding: '6px 10px',
          fontSize: '14px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          background: 'white',
          color: '#1e293b',
          outline: 'none',
          transition: 'all 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#2196f3'
          e.target.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#cbd5e1'
          e.target.style.boxShadow = 'none'
        }}
      />
      <div style={{ display: 'flex', gap: '6px', marginLeft: '8px', flexWrap: 'wrap' }}>
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onPresetClick(preset)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: 'white',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.borderColor = '#94a3b8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white'
              e.currentTarget.style.borderColor = '#cbd5e1'
            }}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  )
}