'use client'

import React from 'react'

interface DataTableProps {
  data: Record<string, string | number | null>[]
  columns: Array<{ code: string; label: string }>
  onDownloadCSV?: () => void
  title?: string
}

export default function DataTable({ data, columns, onDownloadCSV, title }: DataTableProps) {
  const displayData = data.slice(-5).reverse()
  
  // Get date range from data
  const dates = data.map(row => row.date as string).filter(Boolean)
  const startDate = dates.length > 0 ? dates[dates.length - 1] : ''
  const endDate = dates.length > 0 ? dates[0] : ''
  
  const tableTitle = title || 'Data Table'

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{tableTitle}</h3>
        {onDownloadCSV && (
          <button
            onClick={onDownloadCSV}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '500',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: 'white',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s'
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
            Download CSV
          </button>
        )}
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{
              background: '#f8fafc',
              borderBottom: '2px solid #e2e8f0',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                color: '#475569',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Date
              </th>
              {columns.map((col) => (
                <th
                  key={col.code}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#475569',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: idx % 2 === 0 ? 'white' : '#f8fafc',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#f8fafc'
                }}
              >
                <td style={{
                  padding: '10px 16px',
                  whiteSpace: 'nowrap',
                  color: '#1e293b',
                  fontWeight: '500'
                }}>
                  {row.date ? new Date(row.date as string).toLocaleDateString() : ''}
                </td>
                {columns.map((col) => {
                  const cellValue = row[col.code]
                  return (
                    <td
                      key={col.code}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'right',
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                        color: '#1e293b'
                      }}
                    >
                      {cellValue !== null && cellValue !== undefined
                        ? typeof cellValue === 'number'
                          ? cellValue.toFixed(2)
                          : cellValue
                        : 'N/A'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc'
      }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          Showing preview (5 rows)
        </p>
        <a
          href={`/report/data?codes=${columns.map(c => c.code).join(',')}&startDate=${startDate}&endDate=${endDate}&section=${tableTitle}`}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '500',
            background: '#2196f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1976d2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2196f3'
          }}
        >
          See More
        </a>
      </div>
    </div>
  )
}