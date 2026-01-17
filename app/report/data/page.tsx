'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function ReportDataContent() {
  const searchParams = useSearchParams()
  const codesParam = searchParams.get('codes') || ''
  const startDateParam = searchParams.get('startDate') || ''
  const endDateParam = searchParams.get('endDate') || ''
  const sectionParam = searchParams.get('section') || 'Data'
  
  const codes = codesParam.split(',').map(c => c.trim()).filter(c => c.length > 0)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableData, setTableData] = useState<Record<string, string | number | null>[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!codesParam || !startDateParam || !endDateParam) {
      setError('Missing required parameters')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/report/series?codes=${codesParam}&startDate=${startDateParam}&endDate=${endDateParam}`
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch data')
        }
        const data = await response.json()
        setTableData(data.tableData || [])
        setDescriptions(data.descriptions || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setTableData([])
        setDescriptions({})
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [codesParam, startDateParam, endDateParam])

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Primary Report
        </a>
      </div>
      
      <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>{sectionParam} - Raw Data</h1>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Date Range: {new Date(startDateParam).toLocaleDateString()} to {new Date(endDateParam).toLocaleDateString()}
      </p>

      {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading...</div>}
      
      {error && (
        <div style={{ padding: '20px', background: '#fee', color: '#c33', borderRadius: '4px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && tableData.length > 0 && (
        <div>
          <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  {codes.map((code) => (
                    <th key={code} style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>
                      {descriptions[code] || code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.reverse().map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      {row.date ? new Date(row.date as string).toLocaleDateString() : ''}
                    </td>
                    {codes.map((code) => (
                      <td key={code} style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {row[code] !== null && row[code] !== undefined 
                          ? typeof row[code] === 'number' 
                            ? row[code].toFixed(2) 
                            : row[code]
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Showing all {tableData.length} rows (sorted by date, newest first)
          </p>
        </div>
      )}

      {!loading && !error && tableData.length === 0 && (
        <p style={{ padding: '20px', color: '#666' }}>No data available for the selected date range.</p>
      )}
    </div>
  )
}

export default function ReportDataPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
      <ReportDataContent />
    </Suspense>
  )
}