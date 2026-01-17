'use client'

import { useState, useEffect } from 'react'

interface FinMasterItem {
  code: string
  name: string
  source: string
}

export default function DbTestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [finMasterList, setFinMasterList] = useState<FinMasterItem[]>([])
  const [selectedApiCode, setSelectedApiCode] = useState<string>('')

  const testEndpoint = async (
    endpoint: string, 
    name: string, 
    onSuccess?: (data: any) => void
  ) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setResults(prev => ({ ...prev, [name]: data }))
      if (onSuccess) onSuccess(data)
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { error: error instanceof Error ? error.message : 'Unknown error' } 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  useEffect(() => {
    // Load FinMaster list on mount
    const loadFinMaster = async () => {
      setLoading(prev => ({ ...prev, finmaster: true }))
      try {
        const response = await fetch('/api/sample/finmaster')
        const data = await response.json()
        setResults(prev => ({ ...prev, finmaster: data }))
        
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // The API returns data with 'code', 'name', 'source' fields
          const mappedData = data.data.map((item: any) => ({
            code: item.code || item.APICode || item.Code || '',
            name: item.name || item.Name || item.Description || '',
            source: item.source || item.Source || ''
          }))
          
          setFinMasterList(mappedData)
          if (mappedData.length > 0 && mappedData[0].code) {
            setSelectedApiCode(mappedData[0].code)
          }
        }
      } catch (error) {
        setResults(prev => ({ 
          ...prev, 
          finmaster: { error: error instanceof Error ? error.message : 'Unknown error' } 
        }))
      } finally {
        setLoading(prev => ({ ...prev, finmaster: false }))
      }
    }
    
    loadFinMaster()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <div style={{
        background: '#fff3cd',
        border: '2px solid #ffc107',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#856404' }}>
          Admin / Diagnostic Page — Not for end users
        </h2>
        <p style={{ margin: '0', color: '#856404' }}>
          This page is read-only and used for database connectivity and schema checks. 
          All database access is server-side only—no credentials are exposed to the browser.
        </p>
      </div>
      
      <h1>Database Connection Test Console</h1>
      
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ marginBottom: '10px', fontSize: '18px' }}>Health Checks:</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => testEndpoint('/api/health/config', 'config')}
            disabled={loading.config}
            style={{ padding: '10px', cursor: loading.config ? 'wait' : 'pointer', backgroundColor: '#e0e0e0', maxWidth: '300px' }}
          >
            {loading.config ? 'Checking...' : 'Check Config (Env Vars)'}
          </button>

          <button
            onClick={() => testEndpoint('/api/health/db', 'db')}
            disabled={loading.db}
            style={{ padding: '10px', cursor: loading.db ? 'wait' : 'pointer', maxWidth: '300px' }}
          >
            {loading.db ? 'Testing...' : 'Test DB Connection'}
          </button>

          <button
            onClick={() => testEndpoint('/api/health/db-info', 'dbInfo')}
            disabled={loading.dbInfo}
            style={{ padding: '10px', cursor: loading.dbInfo ? 'wait' : 'pointer', maxWidth: '300px' }}
          >
            {loading.dbInfo ? 'Loading...' : 'Get DB Info'}
          </button>

          <button
            onClick={() => testEndpoint('/api/health/schema', 'schema')}
            disabled={loading.schema}
            style={{ padding: '10px', cursor: loading.schema ? 'wait' : 'pointer', maxWidth: '300px' }}
          >
            {loading.schema ? 'Checking...' : 'Check Schema'}
          </button>

          <button
            onClick={() => testEndpoint('/api/health/columns', 'columns')}
            disabled={loading.columns}
            style={{ padding: '10px', cursor: loading.columns ? 'wait' : 'pointer', maxWidth: '300px', backgroundColor: '#fff3cd' }}
          >
            {loading.columns ? 'Loading...' : 'Check Column Names'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '10px', fontSize: '18px' }}>Sample Data:</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Select ApiCode:
            </label>
            <select
              value={selectedApiCode}
              onChange={(e) => setSelectedApiCode(e.target.value)}
              style={{ 
                padding: '8px', 
                width: '100%', 
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              disabled={loading.finmaster || finMasterList.length === 0}
            >
              {loading.finmaster ? (
                <option>Loading...</option>
              ) : finMasterList.length === 0 ? (
                <option>No codes available</option>
              ) : (
                finMasterList.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} - {item.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => testEndpoint('/api/sample/finmaster', 'finmaster')}
            disabled={loading.finmaster}
            style={{ padding: '10px', cursor: loading.finmaster ? 'wait' : 'pointer' }}
          >
            {loading.finmaster ? 'Loading...' : 'Get FinMaster List (Top 10)'}
          </button>

          <button
            onClick={() => testEndpoint(`/api/sample/findata?apiCode=${encodeURIComponent(selectedApiCode)}`, 'findata')}
            disabled={loading.findata || !selectedApiCode}
            style={{ padding: '10px', cursor: (loading.findata || !selectedApiCode) ? 'not-allowed' : 'pointer' }}
          >
            {loading.findata ? 'Loading...' : `Get FinData (Latest 50 rows for ${selectedApiCode})`}
          </button>

          <button
            onClick={() => testEndpoint('/api/sample/weekly', 'weekly')}
            disabled={loading.weekly}
            style={{ padding: '10px', cursor: loading.weekly ? 'wait' : 'pointer' }}
          >
            {loading.weekly ? 'Loading...' : 'Get Latest Weekly Summary'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Results:</h2>
        {Object.keys(results).length === 0 ? (
          <p style={{ color: '#666' }}>Click a button above to test endpoints</p>
        ) : (
          Object.entries(results).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <h3>{key}:</h3>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}